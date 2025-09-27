-- Migration: Initialize Tinedy CRM Schema
-- Generated: 2024-01-27 06:00:00
-- Description: Create initial database schema for Tinedy CRM system

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'OPERATIONS', 'TRAINING', 'QC_MANAGER');

-- CreateEnum
CREATE TYPE "public"."QCStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "public"."TrainingStatus" AS ENUM ('AWAITING_DOCUMENTS', 'DOCUMENTS_RECEIVED', 'TRAINING_IN_PROGRESS', 'TRAINING_COMPLETED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'RETRY_NEEDED');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'NEW',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "n8nWorkflowId" TEXT,
    "webhookData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'OPERATIONS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quality_checks" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "status" "public"."QCStatus" NOT NULL DEFAULT 'PENDING',
    "completedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quality_checklists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_workflows" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "public"."TrainingStatus" NOT NULL DEFAULT 'AWAITING_DOCUMENTS',
    "documentsReceived" BOOLEAN NOT NULL DEFAULT false,
    "trainingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_logs" (
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

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."failed_webhooks" (
    "id" TEXT NOT NULL,
    "originalLogId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorDetails" TEXT NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryAfter" TIMESTAMP(3),
    "manualReview" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "failed_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_lineUserId_key" ON "public"."customers"("lineUserId");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "public"."customers"("status");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "public"."customers"("createdAt");

-- CreateIndex
CREATE INDEX "customers_lineUserId_idx" ON "public"."customers"("lineUserId");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "public"."customers"("name");

-- CreateIndex
CREATE INDEX "jobs_customerId_idx" ON "public"."jobs"("customerId");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "public"."jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_assignedToId_idx" ON "public"."jobs"("assignedToId");

-- CreateIndex
CREATE INDEX "jobs_scheduledAt_idx" ON "public"."jobs"("scheduledAt");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "public"."jobs"("createdAt");

-- CreateIndex
CREATE INDEX "jobs_priority_idx" ON "public"."jobs"("priority");

-- CreateIndex
CREATE INDEX "jobs_serviceType_idx" ON "public"."jobs"("serviceType");

-- CreateIndex
CREATE INDEX "jobs_customerId_status_idx" ON "public"."jobs"("customerId", "status");

-- CreateIndex
CREATE INDEX "jobs_assignedToId_status_idx" ON "public"."jobs"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "jobs_status_priority_idx" ON "public"."jobs"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "quality_checks_jobId_idx" ON "public"."quality_checks"("jobId");

-- CreateIndex
CREATE INDEX "quality_checks_status_idx" ON "public"."quality_checks"("status");

-- CreateIndex
CREATE INDEX "quality_checks_createdAt_idx" ON "public"."quality_checks"("createdAt");

-- CreateIndex
CREATE INDEX "quality_checks_checklistId_idx" ON "public"."quality_checks"("checklistId");

-- CreateIndex
CREATE INDEX "quality_checklists_isActive_idx" ON "public"."quality_checklists"("isActive");

-- CreateIndex
CREATE INDEX "quality_checklists_name_idx" ON "public"."quality_checklists"("name");

-- CreateIndex
CREATE UNIQUE INDEX "training_workflows_jobId_key" ON "public"."training_workflows"("jobId");

-- CreateIndex
CREATE INDEX "training_workflows_status_idx" ON "public"."training_workflows"("status");

-- CreateIndex
CREATE INDEX "training_workflows_createdAt_idx" ON "public"."training_workflows"("createdAt");

-- CreateIndex
CREATE INDEX "webhook_logs_source_idx" ON "public"."webhook_logs"("source");

-- CreateIndex
CREATE INDEX "webhook_logs_status_idx" ON "public"."webhook_logs"("status");

-- CreateIndex
CREATE INDEX "webhook_logs_createdAt_idx" ON "public"."webhook_logs"("createdAt");

-- CreateIndex
CREATE INDEX "webhook_logs_workflowId_idx" ON "public"."webhook_logs"("workflowId");

-- CreateIndex
CREATE INDEX "webhook_logs_processedAt_idx" ON "public"."webhook_logs"("processedAt");

-- CreateIndex
CREATE INDEX "failed_webhooks_failedAt_idx" ON "public"."failed_webhooks"("failedAt");

-- CreateIndex
CREATE INDEX "failed_webhooks_manualReview_idx" ON "public"."failed_webhooks"("manualReview");

-- CreateIndex
CREATE INDEX "failed_webhooks_retryAfter_idx" ON "public"."failed_webhooks"("retryAfter");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "public"."audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quality_checks" ADD CONSTRAINT "quality_checks_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quality_checks" ADD CONSTRAINT "quality_checks_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "public"."quality_checklists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_workflows" ADD CONSTRAINT "training_workflows_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_logs" ADD CONSTRAINT "webhook_logs_createdJobId_fkey" FOREIGN KEY ("createdJobId") REFERENCES "public"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;