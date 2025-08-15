-- 查询联系提交数据以调试subject字段格式
SELECT id, name, email, subject, status, submitted_at 
FROM contact_submissions 
ORDER BY submitted_at DESC 
LIMIT 10;