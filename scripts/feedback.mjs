import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';

export const specs={
 help:[],datasets:[],responses:['dataset'],response:['response'],themes:[],
 'theme-volume':[],'segment-compare':[],'score-drivers':[],trend:[],'review-queue':[],
 'actions-due':['days'],attention:[],compliance:[],activity:[],'weekly-review':[],
 'add-dataset':['name','owner','purpose','jurisdiction','retention','actor'],
 'add-response':['dataset','reference','comment','date','segment','channel','score','actor'],
 'add-theme':['name','definition','actor'],code:['response','theme','excerpt','sentiment','rationale','actor'],
 'review-code':['code','decision','note','actor'],'privacy-review':['response','note','actor'],
 'add-action':['dataset','theme','reference','title','owner','due','actor'],'close-action':['action','evidence','actor'],
 retention:['dataset','purpose','review','hold','actor'],log:['dataset','note','actor'],
 'draft-brief':['dataset'],import:['dataset','file','map','dry-run','actor'],export:[]
};
export const commands=Object.keys(specs);
const hash=s=>createHash('sha256').update(s).digest('hex');
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
export function isoDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s)throw Error('Use a real ISO date YYYY-MM-DD');return s;}
function integer(s,min,max){if(!/^-?\d+$/.test(String(s))||Number(s)<min||Number(s)>max)throw Error(`Expected integer between ${min} and ${max}`);return Number(s);}
const choice=(s,values)=>{if(!values.includes(s))throw Error(`Expected ${values.join('|')}`);return s;};
function parse(argv){const c=argv[0]||'help';if(!specs[c])throw Error(`Unknown command: ${c}`);const o={},pos=[];for(const a of argv.slice(1)){if(!a.startsWith('--')){pos.push(a);continue;}const at=a.indexOf('=');const k=a.slice(2,at<0?undefined:at);if(!(specs[c].includes(k)||k==='json'))throw Error(`Unknown option --${k}`);if(k in o)throw Error(`Duplicate --${k}`);o[k]=at<0?true:a.slice(at+1);if(['json','dry-run'].includes(k)&&o[k]!==true)throw Error(`--${k} is a bare flag`);if(!['json','dry-run'].includes(k)&&typeof o[k]!=='string')throw Error(`--${k}=value required`);}if(pos.length&&(c!=='import'||pos.length!==1||pos[0]!=='thematic'))throw Error('Unexpected positional argument');if(c==='import'&&pos[0]!=='thematic')throw Error('Use import thematic');return {c,o};}
export async function resolve(db,table,ref){
 const labels={datasets:'name',responses:'reference',themes:'name',codes:'id::text',actions:'reference'};
 if(!labels[table])throw Error('Invalid record type');if(!ref)throw Error(`Missing ${table} reference`);
 const label=labels[table];
 let rows=await db.query(`select * from ${table} where id::text=$1 or lower(${label})=lower($1)`,[ref]);
 if(!rows.length)rows=await db.query(`select * from ${table} where starts_with(id::text,$1) or strpos(lower(${label}),lower($1))>0 order by id`,[ref]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${table}:\n${rows.map(r=>`${r.id} ${r.name||r.reference||''}`).join('\n')}`:`No matching ${table}: ${ref}`);
 return rows[0];
}
const nps=(alias='r')=>`round(100.0*(count(*) filter(where ${alias}.score>=9)-count(*) filter(where ${alias}.score<=6))/nullif(count(${alias}.score),0),1)`;
async function audit(db,dataset,actor,event,details={}){await db.query('insert into activity(dataset_id,actor,event,details) values($1,$2,$3,$4)',[dataset,actor,event,JSON.stringify(details)]);}
async function tx(db,fn){await db.exec('BEGIN');try{const r=await fn();await db.exec('COMMIT');return r;}catch(e){await db.exec('ROLLBACK');throw e;}}
export async function run(db,argv){
 const {c,o}=parse(argv);
 if(c==='help')return commands.map(command=>({command,options:specs[command].join(', ')}));
 if(c==='datasets')return db.query('select d.*, (select count(*)::int from responses r where r.dataset_id=d.id) responses from datasets d order by name');
 if(c==='responses'){const d=o.dataset?await resolve(db,'datasets',o.dataset):null;return db.query('select r.id,d.name dataset,r.reference,r.received_on,r.segment,r.channel,r.score,r.privacy_reviewed from responses r join datasets d on d.id=r.dataset_id where ($1::uuid is null or r.dataset_id=$1) order by r.received_on desc,r.reference',[d?.id||null]);}
 if(c==='response'){const r=await resolve(db,'responses',required(o,'response'));return {response:r,codes:await db.query('select c.*,t.name theme from codes c join themes t on t.id=c.theme_id where c.response_id=$1 order by t.name',[r.id])};}
 if(c==='themes')return db.query('select id,name,definition from themes order by name');
 if(c==='theme-volume')return db.query('select * from v_theme_volume order by dataset,mentions desc,theme');
 if(c==='segment-compare')return db.query(`select d.name dataset,r.segment,t.name theme,count(distinct r.id)::int mentions,
 (select count(*)::int from responses rr where rr.dataset_id=r.dataset_id and rr.segment=r.segment) segment_responses,
 round(100.0*count(distinct r.id)/nullif((select count(*) from responses rr where rr.dataset_id=r.dataset_id and rr.segment=r.segment),0),1) share_pct
 from codes c join responses r on r.id=c.response_id join datasets d on d.id=r.dataset_id join themes t on t.id=c.theme_id where c.state='accepted'
 group by d.name,r.dataset_id,r.segment,t.name order by d.name,r.segment,t.name`);
 if(c==='score-drivers')return db.query(`with groups as (
 select d.id dataset_id,d.name dataset,t.id theme_id,t.name theme from datasets d cross join themes t
 where exists(select 1 from codes c join responses r on r.id=c.response_id where r.dataset_id=d.id and c.theme_id=t.id and c.state='accepted'))
 select g.dataset,g.theme,
 count(r.score) filter(where exists(select 1 from codes c where c.response_id=r.id and c.theme_id=g.theme_id and c.state='accepted'))::int scored_with_theme,
 round(100.0*(count(*) filter(where r.score>=9 and exists(select 1 from codes c where c.response_id=r.id and c.theme_id=g.theme_id and c.state='accepted'))-count(*) filter(where r.score<=6 and exists(select 1 from codes c where c.response_id=r.id and c.theme_id=g.theme_id and c.state='accepted')))/nullif(count(r.score) filter(where exists(select 1 from codes c where c.response_id=r.id and c.theme_id=g.theme_id and c.state='accepted')),0),1) theme_nps,
 count(r.score)::int scored_dataset,${nps()} dataset_nps,
 'Association only; small samples require review' caution
 from groups g join responses r on r.dataset_id=g.dataset_id group by g.dataset,g.theme,g.theme_id order by g.dataset,g.theme`);
 if(c==='trend')return db.query(`select d.name dataset,t.name theme,
 count(distinct r.id) filter(where r.received_on>current_date-30 and r.received_on<=current_date)::int recent_mentions,
 count(distinct r.id) filter(where r.received_on>current_date-60 and r.received_on<=current_date-30)::int prior_mentions,
 (select count(*)::int from responses x where x.dataset_id=d.id and x.received_on>current_date-30 and x.received_on<=current_date) recent_responses,
 (select count(*)::int from responses x where x.dataset_id=d.id and x.received_on>current_date-60 and x.received_on<=current_date-30) prior_responses
 from codes c join responses r on r.id=c.response_id join datasets d on d.id=r.dataset_id join themes t on t.id=c.theme_id
 where c.state='accepted' group by d.id,d.name,t.name order by d.name,t.name`);
 if(c==='review-queue')return db.query('select * from v_review_queue order by received_on,reference');
 if(c==='actions-due')return db.query('select * from v_actions_due where days_left<=$1 order by days_left,reference',[integer(o.days??'14',0,3650)]);
 if(c==='attention')return db.query(`select d.name dataset,d.owner,current_date-max(r.received_on) days_since_feedback,
 (select count(*)::int from v_review_queue q where q.dataset=d.name) reviews_waiting,
 (select count(*)::int from actions a where a.dataset_id=d.id and a.status='open' and a.due_on<current_date) overdue_actions
 from datasets d left join responses r on r.dataset_id=d.id group by d.id,d.name,d.owner order by d.name`);
 if(c==='compliance')return db.query(`select d.name dataset,case when jurisdiction='NZ' then 'NZ-IPP9' when jurisdiction='AU' then 'AU-APP11.2' else 'POLICY-RETENTION' end rule,
 case when legal_hold then 'Hold: review retention without deleting' else 'Review purpose and retention date' end finding
 from datasets d where personal_data and (retention_review is null or retention_review<=current_date or trim(purpose)='')
 union all select d.name,'POLICY-PRIVACY','Unreviewed comments: '||count(*) from responses r join datasets d on d.id=r.dataset_id where not r.privacy_reviewed group by d.name
 union all select d.name,'POLICY-EVIDENCE','Proposed coding: '||count(*) from codes c join responses r on r.id=c.response_id join datasets d on d.id=r.dataset_id where c.state='proposed' group by d.name order by dataset,rule`);
 if(c==='activity')return db.query('select actor,event,details,created_at from activity order by created_at,id');
 if(c==='weekly-review'){const out={};for(const name of ['theme-volume','review-queue','actions-due'])out[name]=await run(db,[name]);return out;}
 if(c==='export'){const out={format:'feedback-analysis-v1',exported_at:new Date().toISOString(),records:{}};for(const table of ['datasets','responses','themes','codes','actions','activity','imports'])out.records[table]=await db.query(`select * from ${table} order by id`);const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'exports');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`feedback-${randomUUID()}.json`);fs.writeFileSync(file,JSON.stringify(out,null,2));return {file,counts:Object.fromEntries(Object.entries(out.records).map(([k,v])=>[k,v.length]))};}
 if(c==='draft-brief'){const d=await resolve(db,'datasets',required(o,'dataset'));const volumes=await db.query('select * from v_theme_volume where dataset=$1 order by mentions desc,theme',[d.name]);const actions=await db.query('select reference,title,owner,due_on from v_actions_due where dataset=$1 order by due_on',[d.name]);const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`brief-${d.id}-${randomUUID()}.md`);fs.writeFileSync(file,`# Internal feedback review: ${d.name}\n\nDraft only. Counts use accepted coding. No customer comments included. Small samples do not establish causation.\n\n${human(volumes)}\n\n## Actions\n\n${human(actions)}\n`);return {file,themes:volumes.length,actions:actions.length};}
 const actor=required(o,'actor');
 if(c==='import')return importThematic(db,o,actor);
 return tx(db,async()=>{
 let result,dataset=null;
 if(c==='add-dataset'){result=(await db.query('insert into datasets(name,owner,purpose,jurisdiction,retention_review) values($1,$2,$3,$4,$5) returning *',[required(o,'name'),required(o,'owner'),required(o,'purpose'),choice(o.jurisdiction||'NZ',['NZ','AU','other']),isoDate(required(o,'retention'))]))[0];dataset=result.id;}
 if(c==='add-response'){const d=await resolve(db,'datasets',required(o,'dataset'));dataset=d.id;const date=isoDate(required(o,'date'));if(date>new Date().toISOString().slice(0,10))throw Error('Response date cannot be in the future');result=(await db.query('insert into responses(dataset_id,reference,comment,received_on,segment,channel,score) values($1,$2,$3,$4,$5,$6,$7) returning *',[d.id,required(o,'reference'),required(o,'comment'),date,o.segment||'Unspecified',o.channel||'Unspecified',o.score===undefined?null:integer(o.score,0,10)]))[0];}
 if(c==='add-theme')result=(await db.query('insert into themes(name,definition) values($1,$2) returning *',[required(o,'name'),required(o,'definition')]))[0];
 if(c==='code'){const r=await resolve(db,'responses',required(o,'response')),t=await resolve(db,'themes',required(o,'theme'));dataset=r.dataset_id;result=(await db.query('insert into codes(response_id,theme_id,excerpt,sentiment,rationale) values($1,$2,$3,$4,$5) returning *',[r.id,t.id,required(o,'excerpt'),choice(required(o,'sentiment'),['negative','positive','neutral','mixed','unknown']),required(o,'rationale')]))[0];}
 if(c==='review-code'){const x=await resolve(db,'codes',required(o,'code'));if(x.state!=='proposed')throw Error('Coding has already been reviewed');dataset=(await resolve(db,'responses',x.response_id)).dataset_id;result=(await db.query('update codes set state=$1,reviewer=$2,reviewed_at=now(),rationale=rationale||$3 where id=$4 and state=$5 returning *',[choice(required(o,'decision'),['accepted','rejected']),actor,'\nReview: '+required(o,'note'),x.id,'proposed']))[0];if(!result)throw Error('Coding has already been reviewed');}
 if(c==='privacy-review'){const r=await resolve(db,'responses',required(o,'response'));dataset=r.dataset_id;required(o,'note');result=(await db.query('update responses set privacy_reviewed=true where id=$1 returning id,reference,privacy_reviewed',[r.id]))[0];}
 if(c==='add-action'){const d=await resolve(db,'datasets',required(o,'dataset')),t=await resolve(db,'themes',required(o,'theme'));dataset=d.id;result=(await db.query('insert into actions(dataset_id,theme_id,reference,title,owner,due_on) values($1,$2,$3,$4,$5,$6) returning *',[d.id,t.id,required(o,'reference'),required(o,'title'),required(o,'owner'),isoDate(required(o,'due'))]))[0];}
 if(c==='close-action'){const a=await resolve(db,'actions',required(o,'action'));dataset=a.dataset_id;if(a.status==='closed')throw Error('Action is already closed');result=(await db.query("update actions set status='closed',evidence=$1,closed_on=current_date where id=$2 and status='open' returning *",[required(o,'evidence'),a.id]))[0];}
 if(c==='retention'){const d=await resolve(db,'datasets',required(o,'dataset'));dataset=d.id;result=(await db.query('update datasets set purpose=$1,retention_review=$2,legal_hold=$3 where id=$4 returning *',[required(o,'purpose'),isoDate(required(o,'review')),choice(required(o,'hold'),['true','false'])==='true',d.id]))[0];}
 if(c==='log'){const d=await resolve(db,'datasets',required(o,'dataset'));dataset=d.id;result={note:required(o,'note')};}
 if(!result)throw Error('Command is not implemented');
 await audit(db,dataset,actor,c,{id:result.id||null,note:o.note||null});return result;
 });
}

async function importThematic(db,o,actor){
 const dataset=await resolve(db,'datasets',required(o,'dataset'));
 const file=required(o,'file'),input=fs.readFileSync(file,'utf8'),rows=parseCsv(input);if(!rows.length)throw Error('CSV contains no response rows');
 const aliases={reference:['Response ID','id','reference'],comment:['Comment','Response','Feedback'],date:['Date','received_on'],segment:['Segment'],channel:['Channel'],score:['NPS','Score'],themes:['Themes']};
 const map=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
 for(const [k,v] of Object.entries(map)){if(!aliases[k]||typeof v!=='string'||!Object.keys(rows[0]).includes(v))throw Error(`Invalid mapping ${k}: ${v}`);}
 for(const k of ['reference','comment','date'])if(!Object.keys(rows[0]).some(h=>(map[k]?[map[k]]:aliases[k]).some(a=>a.toLowerCase()===h.toLowerCase())))throw Error(`Missing ${k} column; provide --map`);
 const get=(r,k)=>pick(r,...(map[k]?[map[k]]:aliases[k]));
 const seen=new Set();const prepared=rows.map((raw,i)=>{
 const reference=get(raw,'reference').trim(),comment=get(raw,'comment'),date=isoDate(get(raw,'date'));
 if(!reference||!comment.trim())throw Error(`Row ${i+2}: reference and comment required`);
 if(seen.has(reference))throw Error(`Duplicate reference in file: ${reference}`);seen.add(reference);
 if(date>new Date().toISOString().slice(0,10))throw Error('Response date cannot be in the future');
 const tags=get(raw,'themes')?JSON.parse(get(raw,'themes')):[];if(!Array.isArray(tags))throw Error('Themes must be a JSON list from a byResponse export');
 for(const tag of tags)if(!tag||typeof tag.base!=='string'||!tag.base.trim()||(tag.sub!==undefined&&typeof tag.sub!=='string'))throw Error('Invalid Thematic theme entry');
 return {raw,reference,comment,date,segment:get(raw,'segment')||'Unspecified',channel:get(raw,'channel')||'Unspecified',score:get(raw,'score')===''?null:integer(get(raw,'score'),0,10),tags,fingerprint:hash(JSON.stringify(Object.fromEntries(Object.entries(raw).sort(([a],[b])=>a.localeCompare(b)))))};
 });
 await db.exec('BEGIN');try{
 let imported=0,skipped=0,coding=0;
 for(const r of prepared){
 const old=(await db.query('select id,source_hash from responses where dataset_id=$1 and reference=$2',[dataset.id,r.reference]))[0];
 if(old){if(old.source_hash!==r.fingerprint)throw Error(`Changed repeat ${r.reference}; reconcile explicitly before importing`);skipped++;continue;}
 const response=(await db.query('insert into responses(dataset_id,reference,comment,received_on,segment,channel,score,source_data,source_hash) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id',[dataset.id,r.reference,r.comment,r.date,r.segment,r.channel,r.score,JSON.stringify(r.raw),r.fingerprint]))[0];
 for(const tag of r.tags){const name=tag.base+(tag.sub?' / '+tag.sub:'');let theme=(await db.query('select id from themes where lower(name)=lower($1)',[name]))[0];if(!theme)theme=(await db.query('insert into themes(name,definition) values($1,$2) returning id',[name,'Imported vendor label; review the definition before use']))[0];
 const sent=tag.data?.sent;const sentiment=typeof sent==='number'&&sent>=-1&&sent<=1?(sent<0?'negative':sent>0?'positive':'neutral'):'unknown';
 const added=await db.query("insert into codes(response_id,theme_id,excerpt,sentiment,rationale) values($1,$2,$3,$4,'Imported vendor coding; whole comment retained as evidence, awaiting review') on conflict(response_id,theme_id) do nothing returning id",[response.id,theme.id,r.comment,sentiment]);coding+=added.length;
 }imported++;
 }
 if(!o['dry-run']){await db.query('insert into imports(dataset_id,file_hash,imported,skipped,actor) values($1,$2,$3,$4,$5)',[dataset.id,hash(input),imported,skipped,actor]);await audit(db,dataset.id,actor,'import thematic',{imported,skipped,coding});}
 await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return {imported,skipped,proposed_codes:coding,dry_run:!!o['dry-run']};
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function human(value){
 if(!Array.isArray(value))return JSON.stringify(value,null,2);if(!value.length)return 'No records.';
 const keys=Object.keys(value[0]);const cell=x=>x===null||x===undefined?'':typeof x==='object'?JSON.stringify(x):String(x).replace(/\s+/g,' ');
 const widths=keys.map(k=>Math.min(64,Math.max(k.length,...value.map(r=>cell(r[k]).length))));
 const row=r=>keys.map((k,i)=>cell(r[k]).slice(0,64).padEnd(widths[i])).join('  ').trimEnd();
 return [row(Object.fromEntries(keys.map(k=>[k,k.replaceAll('_',' ')]))),widths.map(w=>'-'.repeat(w)).join('  '),...value.map(row)].join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
