# **Internal CRM System Architecture Document \- Index**

## **1\. บทนำ (Introduction)**

เอกสารฉบับนี้สรุปสถาปัตยกรรมระบบทั้งหมดสำหรับโปรเจกต์ "Internal CRM System" โดยครอบคลุมทั้งส่วนของ Backend, Frontend, และการเชื่อมต่อระหว่างกัน โดยมีเป้าหมายเพื่อใช้เป็นพิมพ์เขียวทางเทคนิคสำหรับทีมพัฒนาในการสร้างระบบที่สอดคล้องกับข้อกำหนดในเอกสาร Product Requirements Document (PRD)

### **Starter Template or Existing Project**

N/A \- Greenfield project

### **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 27 ก.ย. 2568 | 2.0 | Final version. | Winston (Architect) |

## **2\. สถาปัตยกรรมระดับสูง (High Level Architecture)**

### **2.1 บทสรุปทางเทคนิค (Technical Summary)**

สถาปัตยกรรมที่นำเสนอคือระบบ Full-Stack ที่ทันสมัย โดยใช้โครงสร้างแบบ **Monorepo** เพื่อจัดการโค้ดทั้ง Frontend และ Backend ในที่เดียว ส่วนของ Frontend จะเป็น Single-Page Application (SPA) ที่สร้างด้วย **React (Next.js)** เพื่อมอบประสบการณ์การใช้งานที่รวดเร็วและราบรื่นสำหรับทีมงานภายใน ส่วนของ Backend จะใช้สถาปัตยกรรมแบบ **Serverless** (Vercel Functions) เพื่อสร้าง API ที่ปลอดภัยสำหรับ Frontend และ Webhook Endpoint สำหรับการเชื่อมต่อกับ N8N โดยข้อมูลทั้งหมดจะถูกจัดเก็บในฐานข้อมูลเชิงสัมพันธ์ (Relational Database) เช่น PostgreSQL

### **2.2 แพลตฟอร์มและโครงสร้างพื้นฐาน (Platform and Infrastructure)**

**แพลตฟอร์มที่แนะนำ:** **Vercel**

### **2.3 โครงสร้าง Repository (Repository Structure)**

**โครงสร้างที่เลือก:** **Monorepo**

### **2.4 แผนภาพสถาปัตยกรรมระดับสูง (High Level Architecture Diagram)**

graph TD  
    subgraph "User Interface"  
        A\[Team Member's Browser\]  
    end

    subgraph "Vercel Platform"  
        B(Next.js Frontend App)  
        C(Serverless API)  
    end

    subgraph "External Services"  
        D\[N8N Workflow\]  
    end  
      
    subgraph "Data Store"  
        E\[(Vercel Postgres DB)\]  
    end

    A \-- "Uses CRM" \--\> B  
    B \-- "Calls API (e.g., get customers)" \--\> C  
    C \-- "Reads/Writes Data" \--\> E  
    D \-- "Sends New Job (Webhook)" \--\> C

### **2.5 รูปแบบสถาปัตยกรรม (Architectural Patterns)**

* **Serverless Architecture**  
* **Component-Based UI**  
* **Repository Pattern (Backend)**  
* **API Gateway Pattern**

## **Sections**

* [**3\. ชุดเทคโนโลยี (Tech Stack)**](https://www.google.com/search?q=./architecture/3-tech-stack.md)  
* [**4\. โครงสร้างข้อมูล (Data Models)**](https://www.google.com/search?q=./architecture/4-data-models.md)  
* [**5\. ข้อกำหนด API (API Specification)**](https://www.google.com/search?q=./architecture/5-api-specification.md)  
* [**6\. โครงสร้าง Source Tree (Source Tree Structure)**](https://www.google.com/search?q=./architecture/6-source-tree.md)  
* [**7\. Implementation, Security, and Standards**](https://www.google.com/search?q=./architecture/7-implementation-standards.md)