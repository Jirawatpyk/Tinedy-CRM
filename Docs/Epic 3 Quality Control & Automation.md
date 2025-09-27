# **Epic 3: ระบบควบคุมคุณภาพและการเชื่อมต่ออัตโนมัติ (Quality Control & Automation)**

**Goal:** เพิ่มความสามารถในการสร้างและใช้งาน Checklist ควบคุมคุณภาพ และเชื่อมต่อกับ N8N เพื่อรับงานใหม่โดยอัตโนมัติ ซึ่งจะช่วยรักษามาตรฐานและลดขั้นตอนการทำงาน

## **Story 3.1: N8N Webhook Integration**

As a System,  
I want to have a secure webhook endpoint that N8N can call,  
so that new bookings from LINE OA can be automatically created as jobs in the CRM.  
**Acceptance Criteria:**

1. A new API endpoint is created at /api/webhook/n8n/new-job.  
2. The endpoint is secured and requires a valid API Key in the header for access.  
3. The endpoint can receive a JSON payload from N8N containing customer and job information.  
4. Upon receiving a valid request, the system creates a new customer (if they don't exist) and a new job with the status "New".  
5. The system returns a success response (e.g., 202 Accepted) to N8N.  
6. Invalid requests (e.g., wrong API key, bad data) are rejected with an appropriate error code.

## **Story 3.2: Checklist Template Management**

As an Admin,  
I want to be able to create and manage checklist templates for different service types,  
so that I can standardize the quality control process for our services.  
**Acceptance Criteria:**

1. A new section in the settings area is created for "Checklist Templates".  
2. On this page, I can see a list of all existing templates.  
3. I can create a new template by giving it a name, associating it with a Service Type (Cleaning/Training), and adding a list of checkable items.  
4. I can edit the name and items of an existing template.  
5. I can delete a template.

## **Story 3.3: Attach and Use Checklist in a Job**

As an Admin or Operations Team Member,  
I want to attach a checklist to a job and update its status,  
so that we can ensure all steps of the service are completed correctly.  
**Acceptance Criteria:**

1. When viewing a Job's details, an Admin can attach a Checklist Template to it.  
2. Once attached, the Operations Team member assigned to the job can see the list of checklist items.  
3. Each item in the checklist has a checkbox next to it.  
4. The team member can check/uncheck the items to mark them as complete.  
5. The state of the checklist is saved automatically and is visible to anyone viewing the job.