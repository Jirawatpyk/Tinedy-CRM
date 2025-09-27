# **4\. โครงสร้างข้อมูล (Data Models)**

นี่คือโครงสร้างข้อมูลหลักสำหรับ MVP ซึ่งจะถูกแปลงเป็น Schema ของฐานข้อมูลโดย Prisma ต่อไป

### **User**

* **Purpose:** จัดการข้อมูลผู้ใช้งานระบบ (ทีมงาน) และสิทธิ์การเข้าถึง  
* **Key Attributes:**  
  * id: String (UUID) \- Primary Key  
  * name: String \- ชื่อผู้ใช้งาน  
  * email: String \- อีเมลสำหรับ Login (Unique)  
  * password: String \- รหัสผ่าน (Hashed)  
  * role: Enum (ADMIN, OPERATIONS, MANAGER) \- บทบาท  
  * createdAt: DateTime  
* **Relationships:**  
  * A User can be assigned to many Jobs (One-to-Many)

### **Customer**

* **Purpose:** เก็บข้อมูลลูกค้าทั้งหมด  
* **Key Attributes:**  
  * id: String (UUID) \- Primary Key  
  * name: String \- ชื่อลูกค้า  
  * phone: String \- เบอร์โทรศัพท์ (Unique)  
  * address: String (Optional) \- ที่อยู่  
  * contactChannel: String \- ช่องทางที่ลูกค้าติดต่อเข้ามา  
  * createdAt: DateTime  
  * updatedAt: DateTime  
* **Relationships:**  
  * A Customer can have many Jobs (One-to-Many)

### **Job**

* **Purpose:** เก็บข้อมูลงานบริการทั้งหมด  
* **Key Attributes:**  
  * id: String (UUID) \- Primary Key  
  * serviceType: Enum (CLEANING, TRAINING) \- ประเภทบริการ  
  * scheduledDate: DateTime \- วันที่นัดหมาย  
  * price: Decimal \- ราคา  
  * status: String \- สถานะงาน (เช่น New, Assigned, In Progress, Done)  
  * notes: String (Optional) \- บันทึกเพิ่มเติม  
  * courseName: String (Optional) \- ชื่อหลักสูตร (สำหรับ Training)  
  * attendeeCount: Integer (Optional) \- จำนวนผู้เข้าอบรม (สำหรับ Training)  
  * createdAt: DateTime  
  * updatedAt: DateTime  
* **Relationships:**  
  * A Job belongs to one Customer (Many-to-One)  
  * A Job can be assigned to one User (Many-to-One, Optional)  
  * A Job can have one ChecklistInstance (One-to-One, Optional)

### **ChecklistTemplate**

* **Purpose:** เก็บเทมเพลต Checklist สำหรับบริการแต่ละประเภท  
* **Key Attributes:**  
  * id: String (UUID) \- Primary Key  
  * name: String \- ชื่อเทมเพลต  
  * serviceType: Enum (CLEANING, TRAINING) \- สำหรับบริการประเภทไหน  
  * items: JSON \- รายการ Checklist (e.g., \["เช็ดกระจก", "ดูดฝุ่น"\])  
  * createdAt: DateTime  
* **Relationships:**  
  * A ChecklistTemplate can be used in many ChecklistInstances (One-to-Many)

### **ChecklistInstance**

* **Purpose:** เก็บข้อมูล Checklist ที่ใช้งานจริงในแต่ละ Job  
* **Key Attributes:**  
  * id: String (UUID) \- Primary Key  
  * itemStatus: JSON \- สถานะของแต่ละรายการ (e.g., {"เช็ดกระจก": true, "ดูดฝุ่น": false})  
  * completedAt: DateTime (Optional) \- วันที่ทำเสร็จ  
* **Relationships:**  
  * A ChecklistInstance belongs to one Job (One-to-One)  
  * A ChecklistInstance is created from one ChecklistTemplate (Many-to-One)