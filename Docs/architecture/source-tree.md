# **6\. โครงสร้าง Source Tree (Source Tree Structure)**

นี่คือโครงสร้างโฟลเดอร์ที่แนะนำสำหรับโปรเจกต์ Monorepo ของเรา ซึ่งจะช่วยให้การพัฒนาเป็นระเบียบและง่ายต่อการจัดการ

/  
|-- apps/  
|   \`-- crm-app/                \# The main Next.js Application (FE \+ BE)  
|       |-- app/  
|       |   |-- api/              \# API Route Handlers (Backend Logic)  
|       |   |   |-- auth/  
|       |   |   |-- customers/  
|       |   |   |-- jobs/  
|       |   |   \`-- webhook/  
|       |   |-- (auth)/           \# Route group for auth pages  
|       |   |   \`-- login/  
|       |   \`-- (dashboard)/      \# Route group for protected dashboard pages  
|       |       |-- layout.tsx  
|       |       |-- page.tsx      \# Main dashboard page  
|       |       |-- customers/  
|       |       \`-- jobs/  
|       |-- components/  
|       |   |-- ui/               \# Re-exported shadcn/ui components  
|       |   |-- shared/           \# Common components (e.g., PageHeader)  
|       |   \`-- forms/            \# Reusable forms (e.g., CustomerForm)  
|       |-- lib/  
|       |   |-- api-client.ts     \# Frontend functions to call the API  
|       |   |-- db.ts             \# Prisma client instance (used by backend)  
|       |   |-- services/         \# Backend business logic services  
|       |   \`-- utils.ts  
|       |-- prisma/  
|       |   |-- schema.prisma  
|       |   \`-- migrations/  
|       \`-- package.json  
|  
|-- packages/  
|   \`-- types/                  \# Shared TypeScript types (e.g., Prisma-generated types)  
|       \`-- index.ts  
|  
|-- package.json                \# Root package.json  
|-- tsconfig.json  
\`-- pnpm-workspace.yaml  
