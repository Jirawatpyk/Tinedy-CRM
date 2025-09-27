# **Epic 1: พื้นฐานระบบและการจัดการผู้ใช้งาน (Core System & User Management)**

**Goal:** สร้างโครงสร้างพื้นฐานของแอปพลิเคชัน, ระบบ Login, และการจัดการบทบาทผู้ใช้งานเบื้องต้น เพื่อให้ระบบพร้อมใช้งานและมีความปลอดภัย

## **Story 1.1: Project Setup**

As a Developer,  
I want to set up the initial project structure for the React frontend and the backend services,  
so that we have a clean and standardized foundation for development.  
**Acceptance Criteria:**

1. A new monorepo is created containing separate packages for frontend and backend.  
2. The frontend package is initialized with a new React (Next.js) application using TypeScript and Tailwind CSS.  
3. The backend package is initialized with a basic serverless function structure.  
4. Basic linting and formatting configurations are set up for both packages.  
5. A basic "Hello World" or index page can be run successfully on the development server.

## **Story 1.2: User Authentication**

As a Team Member,  
I want to be able to log in to the CRM system with a username and password,  
so that I can access the system securely.  
**Acceptance Criteria:**

1. A login page is created with fields for username and password.  
2. The system can authenticate users against a predefined list of credentials in the database.  
3. Upon successful login, the user is redirected to the main dashboard page.  
4. Upon failed login, an appropriate error message is displayed.  
5. A secure session (e.g., using JWT) is created for the logged-in user.

## **Story 1.3: Role-Based Access Control**

As an Admin,  
I want the system to recognize different user roles (Admin, Operations Team, Manager),  
so that we can control access to different features based on job responsibilities.  
**Acceptance Criteria:**

1. User model in the database is updated to include a role field.  
2. The login process correctly assigns the user's role to their session.  
3. A basic access control mechanism is implemented (e.g., a higher-order component or middleware) that checks the user's role.  
4. As a proof of concept, a simple admin-only page is created and is only accessible by users with the 'ADMIN' role.