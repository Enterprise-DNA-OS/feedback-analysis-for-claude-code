insert into datasets(id,name,owner,purpose,jurisdiction,retention_review,legal_hold) values
 ('10000000-0000-0000-0000-000000000001','Harbour customer survey','Aroha','Review delivery and support experience','NZ',current_date-8,false),
 ('10000000-0000-0000-0000-000000000002','Harbour support follow-up','Wiremu','Check resolved support experience','AU',current_date+20,true)
 on conflict do nothing;
insert into themes(id,name,definition) values
 ('20000000-0000-0000-0000-000000000001','Delivery reliability','Late, missing or timely deliveries'),
 ('20000000-0000-0000-0000-000000000002','Support handover','Ownership and continuity between support staff'),
 ('20000000-0000-0000-0000-000000000003','Invoice clarity','Clarity of charges and invoice descriptions') on conflict do nothing;
insert into responses(id,dataset_id,reference,comment,received_on,segment,channel,score,privacy_reviewed) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','R-001','The delivery arrived late and support asked me to repeat the story.',current_date-5,'Wholesale','NPS survey',3,true),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','R-002','Our delivery was late again. The invoice description was unclear.',current_date-2,'Wholesale','NPS survey',5,true),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','R-003','Delivery was on time and everything was clear.',current_date-6,'Retail','NPS survey',10,true),
 ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','R-004','Nobody owned the support handover.',current_date-40,'Wholesale','NPS survey',4,true),
 ('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','R-005','The invoice was confusing.',current_date-35,'Retail','NPS survey',7,true),
 ('30000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','R-006','A clear update made the wait manageable.',current_date-1,'Retail','Web feedback',null,false),
 ('30000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000002','R-007','I had to explain the problem to another person.',current_date-32,'Wholesale','Support survey',2,true),
 ('30000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000002','R-008','The team resolved everything quickly.',current_date-34,'Retail','Support survey',9,true) on conflict do nothing;
insert into codes(id,response_id,theme_id,excerpt,sentiment,state,rationale,reviewer,reviewed_at) values
 ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','delivery arrived late','negative','accepted','Explicit delay','Aroha',now()),
 ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','repeat the story','negative','accepted','Repeated explanation','Aroha',now()),
 ('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','delivery was late again','negative','accepted','Explicit delay','Aroha',now()),
 ('40000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','Delivery was on time','positive','accepted','Explicit timeliness','Aroha',now()),
 ('40000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','support handover','negative','accepted','Missing owner','Aroha',now()),
 ('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003','invoice was confusing','negative','accepted','Unclear invoice','Aroha',now()),
 ('40000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000002','explain the problem to another person','negative','accepted','Repeated explanation','Wiremu',now()),
 ('40000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','invoice description was unclear','negative','proposed','Awaiting analyst review',null,null) on conflict do nothing;
insert into actions(id,reference,dataset_id,theme_id,title,owner,due_on) values
 ('50000000-0000-0000-0000-000000000001','A-001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Check dispatch promises against carrier cutoffs','Aroha',current_date-4),
 ('50000000-0000-0000-0000-000000000002','A-002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Assign one owner through the support handover','Wiremu',current_date+3) on conflict do nothing;
