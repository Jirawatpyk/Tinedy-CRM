-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."QCStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('CLEANING', 'TRAINING');

-- CreateEnum
CREATE TYPE "public"."TrainingStatus" AS ENUM ('AWAITING_DOCUMENTS', 'DOCUMENTS_RECEIVED', 'TRAINING_IN_PROGRESS', 'TRAINING_COMPLETED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'OPERATIONS', 'TRAINING', 'QC_MANAGER');

-- CreateEnum
CREATE TYPE "public"."WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'RETRY_NEEDED');

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "contactChannel" TEXT NOT NULL,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FailedWebhook" (
    "id" TEXT NOT NULL,
    "originalLogId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorDetails" TEXT NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryAfter" TIMESTAMP(3),
    "manualReview" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FailedWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "assignedUserId" TEXT,
    "description" TEXT,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "completedAt" TIMESTAMP(3),
    "n8nWorkflowId" TEXT,
    "webhookData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QualityChecklist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QualityCheck" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "status" "public"."QCStatus" NOT NULL DEFAULT 'PENDING',
    "completedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrainingWorkflow" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "public"."TrainingStatus" NOT NULL DEFAULT 'AWAITING_DOCUMENTS',
    "documentsReceived" BOOLEAN NOT NULL DEFAULT false,
    "trainingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'OPERATIONS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookLog" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "workflowId" TEXT,
    "executionId" TEXT,
    "payload" JSONB NOT NULL,
    "status" "public"."WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdJobId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "public"."AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "public"."Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_contactChannel_idx" ON "public"."Customer"("contactChannel");

-- CreateIndex
CREATE INDEX "Customer_contactChannel_status_idx" ON "public"."Customer"("contactChannel", "status");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "public"."Customer"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "public"."Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_name_status_idx" ON "public"."Customer"("name", "status");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "public"."Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_phone_status_idx" ON "public"."Customer"("phone", "status");

-- CreateIndex
CREATE INDEX "Customer_status_createdAt_idx" ON "public"."Customer"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "public"."Customer"("status");

-- CreateIndex
CREATE INDEX "FailedWebhook_failedAt_idx" ON "public"."FailedWebhook"("failedAt");

-- CreateIndex
CREATE INDEX "FailedWebhook_manualReview_idx" ON "public"."FailedWebhook"("manualReview");

-- CreateIndex
CREATE INDEX "FailedWebhook_retryAfter_idx" ON "public"."FailedWebhook"("retryAfter");

-- CreateIndex
CREATE INDEX "Job_assignedUserId_idx" ON "public"."Job"("assignedUserId");

-- CreateIndex
CREATE INDEX "Job_assignedUserId_status_idx" ON "public"."Job"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "public"."Job"("createdAt");

-- CreateIndex
CREATE INDEX "Job_customerId_idx" ON "public"."Job"("customerId");

-- CreateIndex
CREATE INDEX "Job_customerId_scheduledDate_idx" ON "public"."Job"("customerId", "scheduledDate" DESC);

-- CreateIndex
CREATE INDEX "Job_customerId_serviceType_idx" ON "public"."Job"("customerId", "serviceType");

-- CreateIndex
CREATE INDEX "Job_customerId_status_idx" ON "public"."Job"("customerId", "status");

-- CreateIndex
CREATE INDEX "Job_price_idx" ON "public"."Job"("price");

-- CreateIndex
CREATE INDEX "Job_priority_idx" ON "public"."Job"("priority");

-- CreateIndex
CREATE INDEX "Job_scheduledDate_idx" ON "public"."Job"("scheduledDate");

-- CreateIndex
CREATE INDEX "Job_scheduledDate_status_idx" ON "public"."Job"("scheduledDate", "status");

-- CreateIndex
CREATE INDEX "Job_serviceType_idx" ON "public"."Job"("serviceType");

-- CreateIndex
CREATE INDEX "Job_serviceType_status_idx" ON "public"."Job"("serviceType", "status");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "public"."Job"("status");

-- CreateIndex
CREATE INDEX "Job_status_priority_idx" ON "public"."Job"("status", "priority");

-- CreateIndex
CREATE INDEX "QualityChecklist_isActive_idx" ON "public"."QualityChecklist"("isActive");

-- CreateIndex
CREATE INDEX "QualityChecklist_name_idx" ON "public"."QualityChecklist"("name");

-- CreateIndex
CREATE INDEX "QualityCheck_checklistId_idx" ON "public"."QualityCheck"("checklistId");

-- CreateIndex
CREATE INDEX "QualityCheck_createdAt_idx" ON "public"."QualityCheck"("createdAt");

-- CreateIndex
CREATE INDEX "QualityCheck_jobId_idx" ON "public"."QualityCheck"("jobId");

-- CreateIndex
CREATE INDEX "QualityCheck_status_idx" ON "public"."QualityCheck"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingWorkflow_jobId_key" ON "public"."TrainingWorkflow"("jobId");

-- CreateIndex
CREATE INDEX "TrainingWorkflow_createdAt_idx" ON "public"."TrainingWorkflow"("createdAt");

-- CreateIndex
CREATE INDEX "TrainingWorkflow_status_idx" ON "public"."TrainingWorkflow"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "WebhookLog_createdAt_idx" ON "public"."WebhookLog"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_processedAt_idx" ON "public"."WebhookLog"("processedAt");

-- CreateIndex
CREATE INDEX "WebhookLog_source_idx" ON "public"."WebhookLog"("source");

-- CreateIndex
CREATE INDEX "WebhookLog_status_idx" ON "public"."WebhookLog"("status");

-- CreateIndex
CREATE INDEX "WebhookLog_workflowId_idx" ON "public"."WebhookLog"("workflowId");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QualityCheck" ADD CONSTRAINT "QualityCheck_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "public"."QualityChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QualityCheck" ADD CONSTRAINT "QualityCheck_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainingWorkflow" ADD CONSTRAINT "TrainingWorkflow_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebhookLog" ADD CONSTRAINT "WebhookLog_createdJobId_fkey" FOREIGN KEY ("createdJobId") REFERENCES "public"."Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
