# **Epic 2: ระบบจัดการลูกค้าและงาน (Customer & Job Management)**

**Goal:** พัฒนาฟังก์ชันหลักของ CRM คือการเพิ่ม/แก้ไข/ค้นหาข้อมูลลูกค้า และการสร้าง/จัดการ/มอบหมายงานบริการ เพื่อให้ทีมสามารถเริ่มจัดการข้อมูลลูกค้าและงานได้อย่างมีประสิทธิภาพ

## **Story 2.1: View Customer List**

As an Admin,  
I want to see a list of all customers in the system,  
so that I can get an overview of the customer base.  
**Acceptance Criteria:**

1. A new page is created at /customers.  
2. The page displays a table with all customers from the database.  
3. The table shows at least the Customer's Name and Phone Number.  
4. The page includes a search bar to filter customers by name or phone number.  
5. The page has a clear "Add New Customer" button.

## **Story 2.2: Add/Edit Customer**

As an Admin,  
I want to be able to add a new customer and edit the details of an existing customer,  
so that I can keep customer information up-to-date.  
**Acceptance Criteria:**

1. Clicking the "Add New Customer" button opens a form (modal or new page).  
2. The form includes fields for Name, Phone, Address, and Contact Channel.  
3. Submitting the form successfully saves the new customer to the database and redirects to the customer list.  
4. From the customer list, there is an option to "Edit" each customer, which opens the same form pre-filled with their data.  
5. Saving changes to an existing customer updates their information in the database.

## **Story 2.3: View Customer Details with Job History**

As an Admin,  
I want to view the detailed information of a single customer, including their complete job history,  
so that I have a full context of their relationship with the company.  
**Acceptance Criteria:**

1. Clicking on a customer from the list navigates to a customer detail page (e.g., /customers/\[id\]).  
2. The page displays all details of the selected customer.  
3. Below the customer details, there is a section that lists all jobs associated with this customer.  
4. The job list shows key information like Job ID, Service Type, Scheduled Date, and Status.

## **Story 2.4: View Job Dashboard**

As a Team Member,  
I want to see a central dashboard listing all jobs,  
so that I can track the status of all ongoing work.  
**Acceptance Criteria:**

1. A new page is created at /jobs or as the main dashboard page.  
2. The page displays a table or kanban board of all jobs.  
3. The dashboard shows key job information (Job ID, Customer Name, Service Type, Date, Status, Assigned Team).  
4. There are filters to view jobs by Status, Service Type, or Assigned Team.  
5. There is a "Create New Job" button for manual entry.

## **Story 2.5: Manual Job Creation and Assignment**

As an Admin,  
I want to manually create a new job and assign it to an operations team member,  
so that I can manage bookings that don't come through the automated channel.  
**Acceptance Criteria:**

1. Clicking "Create New Job" opens a form.  
2. The form allows me to select an existing customer or add a new one.  
3. The form includes fields for all necessary job details (Service Type, Date, Price, Notes).  
4. The form has a dropdown to select a team member (from the User list) to assign the job to.  
5. Upon creation, the job appears on the main dashboard with the status "Assigned".  
6. The assigned team member can see this new job on their view of the dashboard.

## **Story 2.6: Update Job Status**

As an Operations Team Member,  
I want to be able to update the status of the jobs assigned to me,  
so that everyone in the team is aware of the work progress.  
**Acceptance Criteria:**

1. On the Job Dashboard or Job Detail page, there is a clear way to change the job status.  
2. The available statuses to change to are logical (e.g., from "Assigned" can go to "In Progress").  
3. Only Admins or the assigned team member can change the status of a job.  
4. Changing the status is reflected immediately on the dashboard for all users.