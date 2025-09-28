-- ===============================================================================
-- Migration: Fix Job Model to Match Story 2.3 Requirements
-- Created by: Database Agent (Alex)
-- Date: 2025-09-28
-- Description: Complete fix of Job model according to Story 2.3 requirements
-- Issues Fixed:
-- 1. Missing scheduledDate field (rename from scheduledAt and make required)
-- 2. Missing price field (Decimal 10,2)
-- 3. Missing notes field
-- 4. Wrong serviceType (String -> ServiceType enum)
-- 5. Wrong assignedToId (rename to assignedUserId)
-- 6. Missing ServiceType enum
-- 7. Missing ASSIGNED and DONE in JobStatus enum
-- 8. Optimize indexes for Story 2.3 queries
-- ===============================================================================

DO $$
BEGIN
    -- เพิ่ม ServiceType enum ถ้ายังไม่มี
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceType') THEN
        CREATE TYPE "ServiceType" AS ENUM ('CLEANING', 'TRAINING');
        RAISE NOTICE 'Created ServiceType enum';
    END IF;

    -- เพิ่ม ASSIGNED และ DONE ใน JobStatus enum ถ้ายังไม่มี
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ASSIGNED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JobStatus')) THEN
        ALTER TYPE "JobStatus" ADD VALUE 'ASSIGNED';
        RAISE NOTICE 'Added ASSIGNED to JobStatus enum';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DONE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JobStatus')) THEN
        ALTER TYPE "JobStatus" ADD VALUE 'DONE';
        RAISE NOTICE 'Added DONE to JobStatus enum';
    END IF;

    -- ตรวจสอบว่าตาราง jobs มีอยู่หรือไม่
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'jobs') THEN
        RAISE NOTICE 'Jobs table exists, updating...';

        -- 1. แก้ไข scheduledAt -> scheduledDate และทำให้เป็น required
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'scheduledAt') THEN
            -- อัปเดตข้อมูลที่ null ให้เป็น current timestamp ก่อน
            UPDATE "jobs" SET "scheduledAt" = COALESCE("scheduledAt", "createdAt") WHERE "scheduledAt" IS NULL;

            -- เปลี่ยนชื่อและทำให้เป็น NOT NULL
            ALTER TABLE "jobs" RENAME COLUMN "scheduledAt" TO "scheduledDate";
            ALTER TABLE "jobs" ALTER COLUMN "scheduledDate" SET NOT NULL;
            RAISE NOTICE 'Renamed scheduledAt to scheduledDate and made it required';
        ELSIF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'scheduledDate') THEN
            ALTER TABLE "jobs" ADD COLUMN "scheduledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added scheduledDate column';
        END IF;

        -- 2. เพิ่มฟิลด์ price
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'price') THEN
            ALTER TABLE "jobs" ADD COLUMN "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
            RAISE NOTICE 'Added price column';
        END IF;

        -- 3. เพิ่มฟิลด์ notes
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'notes') THEN
            ALTER TABLE "jobs" ADD COLUMN "notes" TEXT;
            RAISE NOTICE 'Added notes column';
        END IF;

        -- 4. แก้ไข assignedToId -> assignedUserId
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'assignedToId') THEN
            -- ลบ foreign key constraint เก่า
            ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_assignedToId_fkey";

            -- เปลี่ยนชื่อ column
            ALTER TABLE "jobs" RENAME COLUMN "assignedToId" TO "assignedUserId";
            RAISE NOTICE 'Renamed assignedToId to assignedUserId';
        ELSIF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'assignedUserId') THEN
            ALTER TABLE "jobs" ADD COLUMN "assignedUserId" TEXT;
            RAISE NOTICE 'Added assignedUserId column';
        END IF;

        -- 5. แก้ไข serviceType จาก text เป็น ServiceType enum
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'serviceType' AND data_type = 'text') THEN
            -- อัปเดตข้อมูลเดิมให้ตรงกับ enum values
            UPDATE "jobs" SET "serviceType" = 'CLEANING' WHERE "serviceType" NOT IN ('CLEANING', 'TRAINING');

            -- เปลี่ยน column type เป็น enum
            ALTER TABLE "jobs" ALTER COLUMN "serviceType" TYPE "ServiceType" USING "serviceType"::"ServiceType";
            ALTER TABLE "jobs" ALTER COLUMN "serviceType" SET NOT NULL;
            RAISE NOTICE 'Converted serviceType to enum';
        ELSIF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'serviceType') THEN
            ALTER TABLE "jobs" ADD COLUMN "serviceType" "ServiceType" NOT NULL DEFAULT 'CLEANING';
            RAISE NOTICE 'Added serviceType enum column';
        END IF;

        -- 6. เพิ่ม foreign key constraints
        IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'jobs_assignedUserId_fkey') THEN
            ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assignedUserId_fkey"
                FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            RAISE NOTICE 'Added assignedUserId foreign key constraint';
        END IF;

        -- 7. ลบ indexes เก่าที่ไม่ต้องการ
        DROP INDEX IF EXISTS "jobs_assignedToId_idx";
        DROP INDEX IF EXISTS "jobs_assignedToId_status_idx";
        DROP INDEX IF EXISTS "jobs_scheduledAt_idx";

        -- 8. เพิ่ม indexes ใหม่สำหรับ Story 2.3 performance
        CREATE INDEX IF NOT EXISTS "jobs_scheduledDate_idx" ON "jobs"("scheduledDate" DESC);
        CREATE INDEX IF NOT EXISTS "jobs_price_idx" ON "jobs"("price");
        CREATE INDEX IF NOT EXISTS "jobs_assignedUserId_idx" ON "jobs"("assignedUserId");
        CREATE INDEX IF NOT EXISTS "jobs_serviceType_status_idx" ON "jobs"("serviceType", "status");
        CREATE INDEX IF NOT EXISTS "jobs_scheduledDate_status_idx" ON "jobs"("scheduledDate" DESC, "status");
        CREATE INDEX IF NOT EXISTS "jobs_customerId_serviceType_idx" ON "jobs"("customerId", "serviceType");
        CREATE INDEX IF NOT EXISTS "jobs_assignedUserId_status_idx" ON "jobs"("assignedUserId", "status");

        -- Key index สำหรับ Story 2.3: customer jobs sorted by scheduledDate DESC
        CREATE INDEX IF NOT EXISTS "jobs_customerId_scheduledDate_idx" ON "jobs"("customerId", "scheduledDate" DESC);

        RAISE NOTICE 'Updated all indexes for Story 2.3 performance';

    ELSE
        RAISE NOTICE 'Jobs table does not exist, this should not happen';
    END IF;

    -- เพิ่ม comments สำหรับ documentation
    COMMENT ON COLUMN "jobs"."serviceType" IS 'ประเภทบริการ: CLEANING (ทำความสะอาด), TRAINING (ฝึกอบรม) - Story 2.3';
    COMMENT ON COLUMN "jobs"."scheduledDate" IS 'วันที่นัดหมายบริการ (required) - Story 2.3';
    COMMENT ON COLUMN "jobs"."price" IS 'ราคาบริการ (2 ทศนิยม) - Story 2.3';
    COMMENT ON COLUMN "jobs"."notes" IS 'บันทึกเพิ่มเติม (optional) - Story 2.3';
    COMMENT ON COLUMN "jobs"."assignedUserId" IS 'รหัสพนักงานที่รับผิดชอบ (optional) - Story 2.3';

    RAISE NOTICE 'Migration completed successfully for Story 2.3 requirements';

END $$;