# **5\. ข้อกำหนด API (API Specification \- Using OpenAPI 3.0)**

นี่คือการออกแบบ API สำหรับระบบของเรา โดยจะใช้มาตรฐาน OpenAPI 3.0 เพื่อให้ง่ายต่อการพัฒนาและทดสอบ

openapi: 3.0.1  
info:  
  title: Internal CRM API  
  version: 1.0.0  
  description: API for managing customers, jobs, and operations for the Internal CRM.

servers:  
  \- url: /api  
    description: Development server

security:  
  \- bearerAuth: \[\]

paths:  
  /auth/login:  
    post:  
      summary: User login  
      tags: \[Auth\]  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              type: object  
              properties:  
                email:  
                  type: string  
                password:  
                  type: string  
      responses:  
        '200':  
          description: Login successful, returns JWT token.

  /customers:  
    get:  
      summary: List all customers  
      tags: \[Customers\]  
      responses:  
        '200':  
          description: A list of customers.  
    post:  
      summary: Create a new customer  
      tags: \[Customers\]  
      responses:  
        '201':  
          description: Customer created.

  /jobs:  
    get:  
      summary: List all jobs with filters  
      tags: \[Jobs\]  
      responses:  
        '200':  
          description: A list of jobs.  
    post:  
      summary: Create a new job  
      tags: \[Jobs\]  
      responses:  
        '201':  
          description: Job created.

  /jobs/{jobId}:  
    get:  
      summary: Get a job by ID  
      tags: \[Jobs\]  
      responses:  
        '200':  
          description: The requested job.  
    put:  
      summary: Update a job  
      tags: \[Jobs\]  
      responses:  
        '200':  
          description: Job updated.

  /checklist-templates:  
    get:  
      summary: List all checklist templates  
      tags: \[Checklists\]  
      responses:  
        '200':  
          description: A list of checklist templates.  
    post:  
      summary: Create a new checklist template  
      tags: \[Checklists\]  
      responses:  
        '201':  
          description: Template created.

  /webhook/n8n/new-job:  
    post:  
      summary: Webhook endpoint for N8N to create a new job  
      tags: \[Webhook\]  
      security:  
        \- apiKeyAuth: \[\]  
      responses:  
        '202':  
          description: Accepted. The job creation request has been received.

components:  
  securitySchemes:  
    bearerAuth:  
      type: http  
      scheme: bearer  
      bearerFormat: JWT  
    apiKeyAuth:  
      type: apiKey  
      in: header  
      name: X-API-KEY  
