-- =============================================================================
-- CUSTOMER SCHEMA UPDATE MIGRATION
-- Created: 2025-09-27
-- Purpose: Update Customer model to match story requirements
-- Changes:
-- 1. Change id from cuid() to uuid()
-- 2. Make phone required and unique
-- 3. Add contactChannel field (required)
-- 4. Remove lineUserId, email, notes fields
-- 5. Keep name, address, status, timestamps
-- =============================================================================

-- First, check if this is an existing database with customers table
DO $$
BEGIN
    -- If customers table exists, we need to update it
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'contactChannel') THEN
            ALTER TABLE "public"."customers" ADD COLUMN "contactChannel" TEXT;
        END IF;

        -- Update existing records to have contactChannel if null
        UPDATE "public"."customers"
        SET "contactChannel" = COALESCE("lineUserId", 'LINE_OA')
        WHERE "contactChannel" IS NULL;

        -- Make contactChannel required
        ALTER TABLE "public"."customers" ALTER COLUMN "contactChannel" SET NOT NULL;

        -- Make phone required if it's not already
        UPDATE "public"."customers"
        SET "phone" = CONCAT('PHONE_', "id")
        WHERE "phone" IS NULL;

        ALTER TABLE "public"."customers" ALTER COLUMN "phone" SET NOT NULL;

        -- Add unique constraint to phone if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'customers_phone_key') THEN
            -- Handle duplicate phone numbers by appending id
            WITH duplicates AS (
                SELECT "phone", COUNT(*) as cnt
                FROM "public"."customers"
                GROUP BY "phone"
                HAVING COUNT(*) > 1
            )
            UPDATE "public"."customers"
            SET "phone" = "phone" || '_' || "id"
            WHERE "phone" IN (SELECT "phone" FROM duplicates);

            ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_phone_key" UNIQUE ("phone");
        END IF;

        -- Drop old columns if they exist
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'lineUserId') THEN
            ALTER TABLE "public"."customers" DROP COLUMN "lineUserId";
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email') THEN
            ALTER TABLE "public"."customers" DROP COLUMN "email";
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'notes') THEN
            ALTER TABLE "public"."customers" DROP COLUMN "notes";
        END IF;

        -- Drop old indexes if they exist
        DROP INDEX IF EXISTS "customers_lineUserId_idx";

        -- Create new indexes
        CREATE INDEX IF NOT EXISTS "customers_contactChannel_idx" ON "public"."customers"("contactChannel");
        CREATE INDEX IF NOT EXISTS "customers_contactChannel_status_idx" ON "public"."customers"("contactChannel", "status");

    ELSE
        -- This is a fresh database, create the table with new structure
        -- Create enums first
        CREATE TYPE IF NOT EXISTS "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
        CREATE TYPE IF NOT EXISTS "public"."JobStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');
        CREATE TYPE IF NOT EXISTS "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        CREATE TYPE IF NOT EXISTS "public"."UserRole" AS ENUM ('ADMIN', 'OPERATIONS', 'TRAINING', 'QC_MANAGER');
        CREATE TYPE IF NOT EXISTS "public"."QCStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'NEEDS_REVIEW');
        CREATE TYPE IF NOT EXISTS "public"."TrainingStatus" AS ENUM ('AWAITING_DOCUMENTS', 'DOCUMENTS_RECEIVED', 'TRAINING_IN_PROGRESS', 'TRAINING_COMPLETED', 'COMPLETED');
        CREATE TYPE IF NOT EXISTS "public"."WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'RETRY_NEEDED');

        -- Create customers table with new structure
        CREATE TABLE "public"."customers" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "phone" TEXT NOT NULL,
            "address" TEXT,
            "contactChannel" TEXT NOT NULL,
            "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
        );

        -- Create indexes
        CREATE UNIQUE INDEX "customers_phone_key" ON "public"."customers"("phone");
        CREATE INDEX "customers_status_idx" ON "public"."customers"("status");
        CREATE INDEX "customers_createdAt_idx" ON "public"."customers"("createdAt");
        CREATE INDEX "customers_name_idx" ON "public"."customers"("name");
        CREATE INDEX "customers_phone_idx" ON "public"."customers"("phone");
        CREATE INDEX "customers_contactChannel_idx" ON "public"."customers"("contactChannel");
        CREATE INDEX "customers_name_status_idx" ON "public"."customers"("name", "status");
        CREATE INDEX "customers_phone_status_idx" ON "public"."customers"("phone", "status");
        CREATE INDEX "customers_status_createdAt_idx" ON "public"."customers"("status", "createdAt");
        CREATE INDEX "customers_contactChannel_status_idx" ON "public"."customers"("contactChannel", "status");
    END IF;
END $$;

-- =============================================================================
-- PERFORMANCE OPTIMIZATION
-- Add text search optimization for PostgreSQL (GIN indexes for full-text search)
-- =============================================================================

-- Create computed columns for case-insensitive search
CREATE INDEX IF NOT EXISTS "customers_name_gin_idx" ON "public"."customers" USING gin(to_tsvector('simple', lower("name")));
CREATE INDEX IF NOT EXISTS "customers_phone_gin_idx" ON "public"."customers" USING gin(to_tsvector('simple', "phone"));

-- =============================================================================
-- DATA INTEGRITY CHECKS
-- =============================================================================

-- Ensure all existing customers have valid data
DO $$
BEGIN
    -- Check if customers table exists before running checks
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        -- Ensure no duplicate phone numbers
        IF (SELECT COUNT(*) FROM (SELECT "phone", COUNT(*) FROM "public"."customers" GROUP BY "phone" HAVING COUNT(*) > 1) as dups) > 0 THEN
            RAISE EXCEPTION 'Duplicate phone numbers found. Please clean data before migration.';
        END IF;

        -- Ensure all required fields are populated
        IF (SELECT COUNT(*) FROM "public"."customers" WHERE "name" IS NULL OR "name" = '') > 0 THEN
            RAISE EXCEPTION 'Empty customer names found. Please clean data before migration.';
        END IF;

        IF (SELECT COUNT(*) FROM "public"."customers" WHERE "phone" IS NULL OR "phone" = '') > 0 THEN
            RAISE EXCEPTION 'Empty customer phone numbers found. Please clean data before migration.';
        END IF;

        IF (SELECT COUNT(*) FROM "public"."customers" WHERE "contactChannel" IS NULL OR "contactChannel" = '') > 0 THEN
            RAISE EXCEPTION 'Empty customer contact channels found. Please clean data before migration.';
        END IF;
    END IF;
END $$;