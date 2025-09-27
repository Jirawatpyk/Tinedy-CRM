# **3\. ชุดเทคโนโลยี (Tech Stack)**

ตารางด้านล่างคือชุดเทคโนโลยีที่ถูกเลือกสำหรับโครงการนี้ ซึ่งจะเป็นแหล่งอ้างอิงหลักเพียงแห่งเดียวสำหรับทีมพัฒนา

| Category | Technology | Version | Purpose | Rationale |
| :---- | :---- | :---- | :---- | :---- |
| **Frontend Language** | TypeScript | \~5.x | ภาษาหลักในการพัฒนา Frontend | เพิ่มความปลอดภัยของ Type และลดข้อผิดพลาด |
| **Frontend Framework** | Next.js (React) | \~14.x | โครงสร้างหลักของ Frontend App | มีประสิทธิภาพสูง, รองรับ SEO, และทำงานร่วมกับ Vercel ได้ดีที่สุด |
| **UI Components** | shadcn/ui & Radix UI | Latest | ชุดเครื่องมือสร้าง UI | มี Components ที่ครบถ้วน, สวยงาม, เข้าถึงง่าย (Accessible), และปรับแต่งได้สูง |
| **Styling** | Tailwind CSS | \~3.x | Framework สำหรับการทำ Styling | ช่วยให้สร้าง UI ที่สวยงามและสอดคล้องกันได้อย่างรวดเร็ว |
| **Icons** | Lucide React | Latest | ชุดไอคอนสำหรับ UI | เป็นชุดไอคอนมาตรฐานสำหรับ shadcn/ui ทำให้ UI สอดคล้องกัน |
| **State Management** | Zustand | \~4.x | การจัดการสถานะของ Frontend | เรียบง่าย, ขนาดเล็ก, และมีประสิทธิภาพสูง เหมาะสำหรับ MVP |
| **Backend Language** | TypeScript | \~5.x | ภาษาหลักในการพัฒนา Backend | ใช้ภาษาเดียวกับ Frontend ทำให้ง่ายต่อการแชร์โค้ดและบำรุงรักษา |
| **Backend Framework** | Vercel Functions | N/A | รัน Backend API แบบ Serverless | ผสานกับการทำงานของ Vercel ได้อย่างสมบูรณ์, ไม่ต้องจัดการ Server |
| **Database** | Vercel Postgres | N/A | ฐานข้อมูลหลักของระบบ | เป็น PostgreSQL ที่ทำงานบน Serverless และจัดการโดย Vercel |
| **Database ORM** | Prisma | \~5.x | เครื่องมือจัดการการเชื่อมต่อฐานข้อมูล | ใช้งานง่าย, มี Type-safety สูง, และช่วยลดความซับซ้อนในการเขียน SQL |
| **Authentication** | NextAuth.js | \~5.x | ระบบยืนยันตัวตน | เป็นโซลูชันที่ครบวงจรและปลอดภัยสำหรับ Next.js |
| **Form Handling** | React Hook Form | \~7.x | การจัดการฟอร์มใน Frontend | มีประสิทธิภาพสูงและใช้งานง่าย |
| **Frontend Testing** | Jest & React Testing Library | Latest | การทดสอบ Frontend Components | เป็นเครื่องมือมาตรฐานสำหรับการทดสอบในระบบนิเทศของ React |
| **Backend Testing** | Vitest | \~1.x | การทดสอบ Backend API/Logic | ทันสมัย, รวดเร็ว, และทำงานร่วมกับ Prisma และ TypeScript ได้ดี |
| **E2E Testing** | Playwright | \~1.x | การทดสอบกระบวนการทำงานทั้งหมด | น่าเชื่อถือ, รวดเร็ว, และสามารถทดสอบข้ามเบราว์เซอร์ได้ |

