create table datasets (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), owner text not null,
 purpose text not null default '', jurisdiction text not null default 'NZ' check(jurisdiction in ('NZ','AU','other')),
 personal_data boolean not null default true, retention_review date, legal_hold boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index datasets_name on datasets(lower(name));
create table responses (
 id uuid primary key default gen_random_uuid(), dataset_id uuid not null references datasets(id), reference text not null,
 comment text not null check(length(trim(comment))>0), received_on date not null, segment text not null default 'Unspecified',
 channel text not null default 'Unspecified', score integer check(score between 0 and 10), privacy_reviewed boolean not null default false,
 source_data jsonb not null default '{}', source_hash text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(dataset_id,reference)
);
create table themes (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), definition text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index themes_name on themes(lower(name));
create table codes (
 id uuid primary key default gen_random_uuid(), response_id uuid not null references responses(id), theme_id uuid not null references themes(id),
 excerpt text not null check(length(trim(excerpt))>0), sentiment text not null check(sentiment in ('negative','neutral','positive','mixed','unknown')),
 state text not null default 'proposed' check(state in ('proposed','accepted','rejected')), rationale text not null,
 reviewer text, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(response_id,theme_id), check((state='proposed' and reviewer is null and reviewed_at is null) or (state<>'proposed' and reviewer is not null and reviewed_at is not null))
);
create table actions (
 id uuid primary key default gen_random_uuid(), reference text not null unique, theme_id uuid not null references themes(id),
 dataset_id uuid not null references datasets(id), title text not null, owner text not null, due_on date not null,
 status text not null default 'open' check(status in ('open','closed')), evidence text, closed_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((status='open' and closed_on is null and evidence is null) or (status='closed' and closed_on is not null and length(trim(evidence))>0))
);
create table activity (
 id uuid primary key default gen_random_uuid(), dataset_id uuid references datasets(id), actor text not null, event text not null, details jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), dataset_id uuid not null references datasets(id), file_hash text not null,
 imported integer not null, skipped integer not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function touch_updated() returns trigger language plpgsql as $$begin new.updated_at=now(); return new; end$$;
create function check_code_excerpt() returns trigger language plpgsql as $$begin
 if not exists(select 1 from responses where id=new.response_id and strpos(comment,new.excerpt)>0) then raise exception 'Excerpt must occur in the source comment'; end if; return new;
end$$;
create trigger validate_excerpt before insert or update on codes for each row execute function check_code_excerpt();
do $$declare t text; begin foreach t in array array['datasets','responses','themes','codes','actions','activity','imports'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
end loop; end$$;
create index responses_dataset_date on responses(dataset_id,received_on);
create index codes_state on codes(state,response_id);
create view v_theme_volume as
 select d.name dataset,t.name theme,count(distinct r.id)::int mentions,
 (select count(*)::int from responses rr where rr.dataset_id=d.id) total_responses,
 round(100.0*count(distinct r.id)/nullif((select count(*) from responses rr where rr.dataset_id=d.id),0),1) share_pct,
 count(distinct r.id) filter(where c.sentiment='negative')::int negative,
 (select count(*)::int from actions a where a.dataset_id=d.id and a.theme_id=t.id and a.status='open') open_actions
 from codes c join responses r on r.id=c.response_id join datasets d on d.id=r.dataset_id join themes t on t.id=c.theme_id
 where c.state='accepted' group by d.id,d.name,t.id,t.name;
create view v_actions_due as select a.id,a.reference,d.name dataset,t.name theme,a.title,a.owner,a.due_on,
 a.due_on-current_date days_left,a.status from actions a join datasets d on d.id=a.dataset_id join themes t on t.id=a.theme_id where a.status='open';
create view v_review_queue as select r.id,r.reference,d.name dataset,r.segment,r.received_on,
 count(c.id) filter(where c.state='proposed')::int proposed,
 count(c.id) filter(where c.state='accepted')::int accepted,r.privacy_reviewed
 from responses r join datasets d on d.id=r.dataset_id left join codes c on c.response_id=r.id
 group by r.id,d.name having count(c.id) filter(where c.state='proposed')>0 or count(c.id) filter(where c.state='accepted')=0 or not r.privacy_reviewed;
revoke all on v_theme_volume,v_actions_due,v_review_queue from public;
