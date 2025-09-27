-- AddCustomerSearchIndexes: Optimize customer search performance
-- Migration: 20250927_add_customer_search_indexes
-- Author: Database Agent (Alex)

-- Add standard B-tree indexes for phone number search
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_phone_idx" ON "customers"("phone");

-- Add composite indexes for combined queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_name_status_idx" ON "customers"("name", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_phone_status_idx" ON "customers"("phone", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_status_created_at_idx" ON "customers"("status", "createdAt");

-- Add GIN indexes for case-insensitive text search using trigrams
-- Note: ต้องเปิดใช้งาน pg_trgm extension ก่อน
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index สำหรับ case-insensitive search บน name field
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_name_gin_trgm_idx"
ON "customers" USING gin(lower("name") gin_trgm_ops);

-- GIN index สำหรับ case-insensitive search บน phone field
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_phone_gin_trgm_idx"
ON "customers" USING gin(lower("phone") gin_trgm_ops);

-- เพิ่ม compound GIN index สำหรับ search หลายฟิลด์พร้อมกัน
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customers_combined_search_idx"
ON "customers" USING gin((lower("name") || ' ' || COALESCE(lower("phone"), '')) gin_trgm_ops);

-- คอมเมนต์อธิบาย indexes ที่สร้าง
COMMENT ON INDEX "customers_phone_idx" IS 'B-tree index for exact phone number lookups';
COMMENT ON INDEX "customers_name_status_idx" IS 'Composite index for name search with status filtering';
COMMENT ON INDEX "customers_phone_status_idx" IS 'Composite index for phone search with status filtering';
COMMENT ON INDEX "customers_status_created_at_idx" IS 'Composite index for status filtering with date sorting';
COMMENT ON INDEX "customers_name_gin_trgm_idx" IS 'GIN trigram index for case-insensitive name search with LIKE/ILIKE';
COMMENT ON INDEX "customers_phone_gin_trgm_idx" IS 'GIN trigram index for case-insensitive phone search with LIKE/ILIKE';
COMMENT ON INDEX "customers_combined_search_idx" IS 'GIN trigram index for combined name+phone search';