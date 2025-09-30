# **Epic 5: Workflow พิเศษและ UI สำหรับมือถือ (Specialized Workflows & Mobile UI)**

**Goal:** พัฒนา Workflow เฉพาะสำหรับการฝึกอบรม และปรับปรุง UI ทั้งหมดให้รองรับการใช้งานบนมือถือได้อย่างสมบูรณ์ เพื่อรองรับบริการทุกรูปแบบและเพิ่มความสะดวกในการทำงานนอกสถานที่

## **Story 5.1: Specialized Training Workflow**

As an Admin,  
I want to manage jobs for "Training" services with a unique workflow and specific data fields,  
so that the process for training is handled correctly and separately from cleaning jobs.  
**Acceptance Criteria:**

1. When creating a new job, if the "Service Type" is "Training", the system displays a different form.  
2. The form for training jobs must have fields for "Course Name" and "Attendee Count".  
3. The status options for a training job are different from a cleaning job (e.g., "รอเอกสาร", "กำลังอบรม", "จบหลักสูตร").  
4. On the main job dashboard, training jobs are clearly distinguishable from cleaning jobs (e.g., with a tag or icon).

## **Story 5.2: Mobile-Friendly UI**

As an Operations Team Member,  
I want the entire CRM application to be mobile-friendly,  
so that I can easily view and update job information from my phone or tablet while on-site.  
**Acceptance Criteria:**

1. All pages, including the login page, dashboard, customer lists, and job details, are fully responsive.  
2. On small screens, tables are converted into a readable list format.  
3. Buttons and interactive elements are large enough to be easily tapped.  
4. Navigation is collapsed into a mobile-friendly menu (e.g., hamburger menu).  
5. Forms are easy to fill out on a mobile device.