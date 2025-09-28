-- ===============================================================================
-- Migration: Update Job Model for Story 2.3
-- Created by: Database Agent (Alex)
-- Date: 2025-09-28
-- Description: Update Job model according to Story 2.3 requirements
-- ===============================================================================

DO $$
BEGIN
    -- เพิ่ม ServiceType enum ถ้ายังไม่มี
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceType') THEN
        CREATE TYPE "ServiceType" AS ENUM ('CLEANING', 'TRAINING');
    END IF;

    -- ปรับปรุง JobStatus enum - เพิ่ม ASSIGNED และ DONE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ASSIGNED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JobStatus')) THEN
        ALTER TYPE "JobStatus" ADD VALUE 'ASSIGNED';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DONE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'JobStatus')) THEN
        ALTER TYPE "JobStatus" ADD VALUE 'DONE';
    END IF;

    -- ตรวจสอบว่าตาราง jobs มีอยู่หรือไม่
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'jobs') THEN

        -- เพิ่มฟิลด์ใหม่ถ้ายังไม่มี
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'scheduledDate') THEN
            -- ถ้ามี scheduledAt อยู่แล้ว ให้เปลี่ยนชื่อ ถ้าไม่มีให้สร้างใหม่
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'scheduledAt') THEN
                ALTER TABLE "jobs" RENAME COLUMN "scheduledAt" TO "scheduledDate";
                ALTER TABLE "jobs" ALTER COLUMN "scheduledDate" SET NOT NULL;
            ELSE
                ALTER TABLE "jobs" ADD COLUMN "scheduledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
            END IF;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'price') THEN
            ALTER TABLE "jobs" ADD COLUMN "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'notes') THEN
            ALTER TABLE "jobs" ADD COLUMN "notes" TEXT;
        END IF;

        -- เปลี่ยนชื่อ assignedToId เป็น assignedUserId
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'assignedToId') THEN
            ALTER TABLE "jobs" RENAME COLUMN "assignedToId" TO "assignedUserId";
        ELSIF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'assignedUserId') THEN
            ALTER TABLE "jobs" ADD COLUMN "assignedUserId" TEXT;
        END IF;

        -- ปรับปรุง serviceType เป็น enum ถ้ายังเป็น text อยู่
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'serviceType' AND data_type = 'text') THEN
            -- อัปเดตข้อมูลเดิมให้ตรงกับ enum values
            UPDATE "jobs" SET "serviceType" = 'CLEANING' WHERE "serviceType" NOT IN ('CLEANING', 'TRAINING');
            -- เปลี่ยน column type เป็น enum
            ALTER TABLE "jobs" ALTER COLUMN "serviceType" TYPE "ServiceType" USING "serviceType"::"ServiceType";
        ELSIF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'serviceType') THEN
            ALTER TABLE "jobs" ADD COLUMN "serviceType" "ServiceType" NOT NULL DEFAULT 'CLEANING';
        END IF;

        -- ปรับปรุง foreign key constraints
        ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_assignedToId_fkey";

        IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'jobs_assignedUserId_fkey') THEN
            ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assignedUserId_fkey"
                FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- ลบ indexes เก่า
        DROP INDEX IF EXISTS "jobs_assignedToId_idx";
        DROP INDEX IF EXISTS "jobs_assignedToId_status_idx";
        DROP INDEX IF EXISTS "jobs_scheduledAt_idx";

        -- เพิ่ม indexes ใหม่สำหรับ performance
        CREATE INDEX IF NOT EXISTS "jobs_scheduledDate_idx" ON "jobs"("scheduledDate");
        CREATE INDEX IF NOT EXISTS "jobs_price_idx" ON "jobs"("price");
        CREATE INDEX IF NOT EXISTS "jobs_assignedUserId_idx" ON "jobs"("assignedUserId");
        CREATE INDEX IF NOT EXISTS "jobs_serviceType_status_idx" ON "jobs"("serviceType", "status");
        CREATE INDEX IF NOT EXISTS "jobs_scheduledDate_status_idx" ON "jobs"("scheduledDate", "status");
        CREATE INDEX IF NOT EXISTS "jobs_customerId_serviceType_idx" ON "jobs"("customerId", "serviceType");
        CREATE INDEX IF NOT EXISTS "jobs_assignedUserId_status_idx" ON "jobs"("assignedUserId", "status");

    ELSE
        -- ตารางยังไม่มี สร้างใหม่ตามสคีมาที่ต้องการ
        CREATE TABLE "jobs" (
            "id" TEXT NOT NULL,
            "customerId" TEXT NOT NULL,
            "serviceType" "ServiceType" NOT NULL,
            "scheduledDate" TIMESTAMP(3) NOT NULL,
            "price" DECIMAL(10,2) NOT NULL,
            "status" "JobStatus" NOT NULL DEFAULT 'NEW',
            "notes" TEXT,
            "assignedUserId" TEXT,
            "description" TEXT,
            "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
            "completedAt" TIMESTAMP(3),
            "n8nWorkflowId" TEXT,
            "webhookData" JSONB,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
        );

        -- สร้าง foreign key constraints
        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assignedUserId_fkey"
            FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

        -- สร้าง indexes
        CREATE INDEX "jobs_customerId_idx" ON "jobs"("customerId");
        CREATE INDEX "jobs_status_idx" ON "jobs"("status");
        CREATE INDEX "jobs_assignedUserId_idx" ON "jobs"("assignedUserId");
        CREATE INDEX "jobs_scheduledDate_idx" ON "jobs"("scheduledDate");
        CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");
        CREATE INDEX "jobs_priority_idx" ON "jobs"("priority");
        CREATE INDEX "jobs_serviceType_idx" ON "jobs"("serviceType");
        CREATE INDEX "jobs_price_idx" ON "jobs"("price");
        CREATE INDEX "jobs_customerId_status_idx" ON "jobs"("customerId", "status");
        CREATE INDEX "jobs_assignedUserId_status_idx" ON "jobs"("assignedUserId", "status");
        CREATE INDEX "jobs_status_priority_idx" ON "jobs"("status", "priority");
        CREATE INDEX "jobs_serviceType_status_idx" ON "jobs"("serviceType", "status");
        CREATE INDEX "jobs_scheduledDate_status_idx" ON "jobs"("scheduledDate", "status");
        CREATE INDEX "jobs_customerId_serviceType_idx" ON "jobs"("customerId", "serviceType");
    END IF;

    -- เพิ่ม comments สำหรับ documentation
    COMMENT ON COLUMN "jobs"."serviceType" IS 'ประเภทบริการ: CLEANING (ทำความสะอาด), TRAINING (ฝึกอบรม)';
    COMMENT ON COLUMN "jobs"."scheduledDate" IS 'วันที่นัดหมายบริการ (required)';
    COMMENT ON COLUMN "jobs"."price" IS 'ราคาบริการ (2 ทศนิยม)';
    COMMENT ON COLUMN "jobs"."notes" IS 'บันทึกเพิ่มเติม (optional)';
    COMMENT ON COLUMN "jobs"."assignedUserId" IS 'รหัสพนักงานที่รับผิดชอบ (optional)';

END $$;