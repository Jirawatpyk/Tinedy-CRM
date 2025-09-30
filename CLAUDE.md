# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tinedy CRM system - an internal CRM for managing customers, jobs, and quality control workflows after customers book services through LINE OA. The system integrates with N8N automation workflows and focuses on streamlining internal operations for admin and operations teams.

## Architecture

- **Type**: Monorepo structure (planned)
- **Frontend**: Next.js 14+ with React, TypeScript, shadcn/ui components, Tailwind CSS
- **Backend**: Serverless architecture using Vercel Functions
- **Database**: Vercel Postgres with Prisma ORM
- **Authentication**: NextAuth.js v5
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library (frontend), Vitest (backend), Playwright (E2E)
- **Platform**: Vercel

## Project Structure (Planned)

```
/
├── apps/
│   └── crm-app/                # Main Next.js application
│       ├── app/
│       │   ├── api/            # API route handlers (backend)
│       │   │   ├── auth/
│       │   │   ├── customers/
│       │   │   ├── jobs/
│       │   │   └── webhook/    # N8N integration endpoint
│       │   ├── (auth)/         # Auth pages route group
│       │   └── (dashboard)/    # Protected dashboard pages
│       ├── components/
│       │   ├── ui/             # shadcn/ui components
│       │   ├── shared/         # Common components
│       │   └── forms/          # Reusable forms
│       ├── lib/
│       │   ├── api-client.ts   # Frontend API calls
│       │   ├── db.ts           # Prisma client
│       │   ├── services/       # Backend business logic
│       │   └── utils.ts
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── packages/
│   └── types/                  # Shared TypeScript types
└── package.json
```

## Key Features

- **Customer Management**: Add, edit, search customers and view service history
- **Job/Booking Management**: View all jobs, status tracking (new, in-progress, completed)
- **Assignment System**: Admin assigns jobs to operations team
- **Quality Control Checklist**: Create standard checklists for quality assurance
- **Training Workflow**: Track training workflow status (awaiting documents, training, completed)
- **N8N Integration**: Webhook endpoint to receive booking data from N8N workflows

## Development Standards

### Code Quality
- TypeScript is mandatory throughout the project
- Use Repository Pattern for data access through Service Layer
- Input validation at API layer before Service layer
- Shared types between frontend/backend via packages/types
- ESLint + Prettier for code formatting

### Security Requirements
- NextAuth.js for authentication
- Role-based authorization (Admin, Operations) in API endpoints
- Webhook security with API keys for N8N integration
- Prisma ORM prevents SQL injection by default
- Environment variables for all secrets (no hardcoding)
- No sensitive data in logs

### Error Handling
- Standardized JSON error responses from all API endpoints
- API-level input validation before service calls
- Backend error logging for important failures

### Testing Strategy
- Unit tests for backend Services and frontend Components
- Integration tests for API-database connections
- E2E tests with Playwright for critical user workflows

## User Types

- **Admin**: Manages customer data, receives LINE bookings, assigns jobs
- **Operations Team**: Receives assignments, views job details, updates status
- **Training Team**: Manages training workflows
- **Manager/QC**: Uses checklists for quality control and overview

## Current State

**Project Status**: 🔄 **Active Development** (Epic 2 - 67% Complete)

### Implementation Progress
- ✅ **Epic 1**: Core System & User Management (Completed)
  - NextAuth.js v5 authentication with role-based access
  - Database schema with Prisma ORM
  - User model with 4 roles (ADMIN, OPERATIONS, TRAINING, QC_MANAGER)

- 🔄 **Epic 2**: Customer & Job Management (In Progress - 67%)
  - ✅ Stories 2.1-2.6: Customer CRUD, Job management, Checklist system (Completed)
  - 📝 Stories 2.7-2.9: Delete operations, User management (Approved, ready for implementation)
  - **Remaining**: 2 weeks (7 days)

- 🔴 **Epic 3**: Admin Job Booking Management (DEPRECATED)
  - 98.3% overlap with Epic 2 - see `docs/DEPRECATED-Epic-3.md`
  - All functionality covered by Epic 2 stories

- ⏳ **Epic 4**: Quality Control & Automation (Planned - next after Epic 2)
  - N8N webhook integration
  - Checklist template management
  - Advanced quality control features

### Project Roadmap
See detailed roadmap: `docs/PROJECT-ROADMAP.md`

### Codebase Structure
The actual implementation is located in:
- `apps/crm-app/` - Main Next.js application
- `apps/crm-app/prisma/` - Database schema and migrations
- `apps/crm-app/app/api/` - API route handlers
- `apps/crm-app/components/` - React components

## External Integrations

- **N8N**: Receives booking data via webhook endpoints
- **LINE OA**: Customer booking source (external to this CRM system) และ booking จากแอดมิน
- ให้ตอบกลับเป็นภาษาไทย เข้าใจง่าย
- การพัฒนาโค้ดควรใช้ MCP ที่มีอยู่ด้วย
- เมื่อมีการแก้ไข database ให้เรียกใช้ agent .claude\agents\database-architect.md มาช่วยทำงานด้วย
- Integration กับ Context7 MCP (สำหรับการพัฒนาที่ทันสมัย)
- การทำงานแบบ Best Practice
- Dev agent ปรับปรุงการทำงาน 
1. ตรวจสอบการมีอยู่จริงของไฟล์ ก่อนรายงานว่าเสร็จสิ้น   
2. การทดสอบที่ครอบคลุมมากขึ้น ก่อนประกาศความสำเร็จ      
3. ความละเอียดในการติดตามงาน เพื่อความถูกต้อง
- Dev agent AUTO-DELEGATE to specialized sub-agents (located in .claude\agents) based on task type for maximum speed and accuracy.
- การแก้ไข error ควรแก้ไขอย่างเป็นระบบ วิเคราะห์ error หาสาเหตุ เป้าหมาย แก้ไข