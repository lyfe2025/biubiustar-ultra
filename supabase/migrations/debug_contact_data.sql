-- 查询联系提交数据，检查subject字段格式
SELECT id, name, email, subject, message, status, phone, ip_address, created_at 
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 10;