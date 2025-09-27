# Customer Search Indexes Migration

## วัตถุประสงค์

Migration นี้เพิ่ม database indexes เพื่อปรับปรุงประสิทธิภาพการค้นหาลูกค้าในระบบ Tinedy CRM

## Indexes ที่เพิ่ม

### 1. Basic B-tree Indexes

- `customers_phone_idx`: สำหรับการค้นหาเบอร์โทรศัพท์แบบ exact match

### 2. Composite Indexes

- `customers_name_status_idx`: ค้นหาชื่อพร้อมกรองสถานะ
- `customers_phone_status_idx`: ค้นหาเบอร์โทรพร้อมกรองสถานะ
- `customers_status_created_at_idx`: กรองสถานะและเรียงตามวันที่

### 3. GIN Trigram Indexes (สำหรับ Case-insensitive Search)

- `customers_name_gin_trgm_idx`: ค้นหาชื่อแบบ partial match และ case-insensitive
- `customers_phone_gin_trgm_idx`: ค้นหาเบอร์โทรแบบ partial match
- `customers_combined_search_idx`: ค้นหาผสมชื่อและเบอร์โทรในครั้งเดียว

## ข้อกำหนดเบื้องต้น

- PostgreSQL 9.1+ (สำหรับ pg_trgm extension)
- สิทธิ์ SUPERUSER หรือ CREATE EXTENSION

## วิธีใช้งาน

### Apply Migration

```bash
# ผ่าน Prisma (แนะนำ)
npx prisma migrate deploy

# หรือ run SQL โดยตรง
psql -d your_database -f migration.sql
```

### Rollback Migration

```bash
# Run rollback script
psql -d your_database -f rollback.sql
```

## ประโยชน์ที่คาดหวัง

### Before (ไม่มี indexes)

- การค้นหาลูกค้า: Full table scan
- เวลาประมวลผล: O(n) เพิ่มขึ้นตามจำนวนลูกค้า
- การค้นหาแบบ LIKE '%text%': ช้ามาก

### After (มี indexes)

- การค้นหาเบอร์โทรแบบ exact: O(log n)
- การค้นหาชื่อแบบ partial match: O(log n) + trigram matching
- การค้นหาผสมกับ status filtering: ใช้ composite index
- การค้นหาแบบ case-insensitive: ใช้ GIN trigram index

## Query Examples ที่ได้ประโยชน์

```sql
-- ค้นหาชื่อลูกค้า (case-insensitive)
SELECT * FROM customers WHERE lower(name) LIKE lower('%สมชาย%');

-- ค้นหาเบอร์โทรศัพท์
SELECT * FROM customers WHERE phone = '081-234-5678';

-- ค้นหาชื่อพร้อมกรองสถานะ
SELECT * FROM customers WHERE name ILIKE '%สมชาย%' AND status = 'ACTIVE';

-- ค้นหาผสมชื่อและเบอร์โทร
SELECT * FROM customers WHERE
  lower(name || ' ' || COALESCE(phone, '')) LIKE lower('%สมชาย 081%');
```

## ข้อควรระวัง

1. การสร้าง index จะใช้เวลานานกับข้อมูลจำนวนมาก
2. CONCURRENT index creation ป้องกัน table lock แต่ใช้เวลานานกว่า
3. GIN indexes ใช้ storage มากกว่า B-tree indexes
4. ควร monitor disk space หลัง apply migration

## Testing

ทดสอบ performance ก่อน-หลัง apply migration:

```sql
EXPLAIN ANALYZE SELECT * FROM customers WHERE name ILIKE '%test%';
```
