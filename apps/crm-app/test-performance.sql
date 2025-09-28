-- =============================================================================
-- Performance Testing Queries for Story 2.3
-- Created by: Database Agent (Alex)
-- =============================================================================

-- Test 1: Key query สำหรับ GET /api/customers/[id]/jobs
-- ดึงงานของลูกค้าเรียงตาม scheduledDate DESC (Story 2.3 requirement)
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    j.id,
    j."customerId",
    j."serviceType",
    j."scheduledDate",
    j.price,
    j.status,
    j.notes,
    j."assignedUserId",
    c.name as customer_name,
    c.phone as customer_phone,
    u.name as assigned_user_name,
    u.email as assigned_user_email
FROM jobs j
INNER JOIN customers c ON j."customerId" = c.id
LEFT JOIN users u ON j."assignedUserId" = u.id
WHERE j."customerId" = 'test-customer-id'
ORDER BY j."scheduledDate" DESC
LIMIT 20 OFFSET 0;

-- Test 2: ตรวจสอบ composite index ทำงานได้ดี
EXPLAIN (ANALYZE, BUFFERS)
SELECT j.id, j."scheduledDate", j.status, j.price
FROM jobs j
WHERE j."customerId" = 'test-customer-id'
ORDER BY j."scheduledDate" DESC
LIMIT 20;

-- Test 3: Query ค้นหาตาม serviceType และ status
EXPLAIN (ANALYZE, BUFFERS)
SELECT j.id, j."customerId", j."serviceType", j.status
FROM jobs j
WHERE j."serviceType" = 'CLEANING' AND j.status = 'NEW'
ORDER BY j."scheduledDate" DESC
LIMIT 50;

-- Test 4: Query ค้นหางานที่มอบหมายให้ user
EXPLAIN (ANALYZE, BUFFERS)
SELECT j.id, j."customerId", j."assignedUserId", j.status
FROM jobs j
WHERE j."assignedUserId" = 'test-user-id' AND j.status IN ('ASSIGNED', 'IN_PROGRESS')
ORDER BY j."scheduledDate" DESC;

-- Test 5: Performance test กับข้อมูลจำลอง
-- สร้างข้อมูลทดสอบ
INSERT INTO customers (id, name, phone, "contactChannel") VALUES
('test-customer-id', 'Test Customer', '0812345678', 'LINE_OA'),
('test-customer-2', 'Test Customer 2', '0887654321', 'LINE_OA');

INSERT INTO users (id, email, password, name, role) VALUES
('test-user-id', 'test@example.com', 'hashed_password', 'Test User', 'OPERATIONS');

-- สร้าง sample jobs สำหรับ performance testing
INSERT INTO jobs (id, "customerId", "serviceType", "scheduledDate", price, status, notes)
SELECT
    gen_random_uuid(),
    'test-customer-id',
    CASE WHEN random() < 0.7 THEN 'CLEANING'::servicetype ELSE 'TRAINING'::servicetype END,
    CURRENT_TIMESTAMP - (random() * 365 || ' days')::interval,
    (random() * 5000 + 500)::decimal(10,2),
    CASE
        WHEN random() < 0.3 THEN 'NEW'::jobstatus
        WHEN random() < 0.6 THEN 'ASSIGNED'::jobstatus
        WHEN random() < 0.8 THEN 'IN_PROGRESS'::jobstatus
        ELSE 'DONE'::jobstatus
    END,
    'Test job #' || generate_series
FROM generate_series(1, 1000);

-- รัน performance test อีกครั้งกับข้อมูลจำลอง
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    j.id,
    j."serviceType",
    j."scheduledDate",
    j.price,
    j.status,
    c.name
FROM jobs j
INNER JOIN customers c ON j."customerId" = c.id
WHERE j."customerId" = 'test-customer-id'
ORDER BY j."scheduledDate" DESC
LIMIT 20 OFFSET 0;

-- ทดสอบ index selectivity
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'jobs'
ORDER BY idx_scan DESC;

-- ตรวจสอบ table statistics
SELECT
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
WHERE tablename IN ('jobs', 'customers', 'users');