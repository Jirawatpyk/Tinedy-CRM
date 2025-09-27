-- Rollback AddCustomerSearchIndexes: Remove customer search optimization indexes
-- Migration Rollback: 20250927_add_customer_search_indexes
-- Author: Database Agent (Alex)

-- Drop GIN indexes first (most complex)
DROP INDEX CONCURRENTLY IF EXISTS "customers_combined_search_idx";
DROP INDEX CONCURRENTLY IF EXISTS "customers_phone_gin_trgm_idx";
DROP INDEX CONCURRENTLY IF EXISTS "customers_name_gin_trgm_idx";

-- Drop composite indexes
DROP INDEX CONCURRENTLY IF EXISTS "customers_status_created_at_idx";
DROP INDEX CONCURRENTLY IF EXISTS "customers_phone_status_idx";
DROP INDEX CONCURRENTLY IF EXISTS "customers_name_status_idx";

-- Drop basic B-tree indexes
DROP INDEX CONCURRENTLY IF EXISTS "customers_phone_idx";

-- Note: pg_trgm extension จะไม่ถูกลบออก เพื่อป้องกันไม่ให้กระทบกับ indexes อื่น
-- หากต้องการลบ extension ให้รันคำสั่ง: DROP EXTENSION IF EXISTS pg_trgm;

-- Log rollback completion
-- SELECT 'Customer search indexes rollback completed successfully' as status;