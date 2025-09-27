# **UI/UX Specification: Internal CRM System MVP**

## **1\. Introduction**

เอกสารฉบับนี้กำหนดเป้าหมายด้านประสบการณ์ผู้ใช้, สถาปัตยกรรมข้อมูล, โฟลว์การใช้งาน, และข้อกำหนดด้านการออกแบบภาพสำหรับ User Interface ของโปรเจกต์ "Internal CRM System" โดยจะทำหน้าที่เป็นแนวทางหลักสำหรับการออกแบบและพัฒนา Frontend เพื่อให้แน่ใจว่าผู้ใช้จะได้รับประสบการณ์ที่ดีและสอดคล้องกัน

### **1.1 Overall UX Goals & Principles**

#### **Target User Personas**

* **แอดมิน (Admin):** ผู้ใช้งานหลักที่ต้องการความสามารถในการจัดการข้อมูลทั้งหมดได้อย่างรวดเร็วและครบถ้วน  
* **ทีมปฏิบัติการ (Operations Team):** ผู้ใช้งานภาคสนามที่ต้องการเข้าถึงข้อมูลงานที่จำเป็นและอัปเดตสถานะได้อย่างง่ายดาย โดยเฉพาะบนอุปกรณ์พกพา  
* **ผู้จัดการ/QC (Manager/QC):** ผู้ใช้งานที่ต้องการดูภาพรวมของงานทั้งหมดเพื่อตรวจสอบและควบคุมคุณภาพ

#### **Usability Goals**

* **เรียนรู้ง่าย (Ease of learning):** ผู้ใช้งานใหม่สามารถเรียนรู้และทำงานหลักๆ ได้สำเร็จภายใน 15 นาทีแรก  
* **ใช้งานอย่างมีประสิทธิภาพ (Efficiency of use):** ผู้ใช้งานประจำสามารถทำงานที่ทำบ่อยๆ (เช่น อัปเดตสถานะงาน) ได้โดยใช้จำนวนคลิกน้อยที่สุด  
* **ลดความผิดพลาด (Error prevention):** ออกแบบให้ชัดเจนเพื่อป้องกันการกรอกข้อมูลผิดพลาด และมีข้อความยืนยันสำหรับการกระทำที่สำคัญ

#### **Design Principles**

1. **ความชัดเจนมาก่อน (Clarity First):** Interface ต้องสื่อสารข้อมูลและสถานะต่างๆ ได้อย่างชัดเจน ไม่คลุมเครือ  
2. **ความสม่ำเสมอคือกุญแจ (Consistency is Key):** รูปแบบการใช้งาน, ปุ่ม, และไอคอนต่างๆ ต้องมีความสม่ำเสมอทั่วทั้งแอปพลิเคชัน  
3. **ให้ข้อมูลที่จำเป็น (Progressive Disclosure):** แสดงเฉพาะข้อมูลและเครื่องมือที่จำเป็นสำหรับแต่ละหน้าจอ ไม่แสดงข้อมูลที่ไม่เกี่ยวข้องจนรกสายตา  
4. **ให้ความสำคัญกับมือถือ (Mobile-First):** ออกแบบโดยคำนึงถึงการใช้งานบนหน้าจอมือถือก่อน แล้วจึงขยายไปยังหน้าจอที่ใหญ่ขึ้น

### **1.2 Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 27 ก.ย. 2568 | 1.0 | Initial UI/UX Specification created. | Sally (UX Expert) |
| 27 ก.ย. 2568 | 1.1 | Added IA, User Flow, and Style Guide sections. | Sally (UX Expert) |
| 27 ก.ย. 2568 | 1.2 | Added Component Inventory and Responsiveness sections. | Sally (UX Expert) |

## **2\. สถาปัตยกรรมข้อมูล (Information Architecture \- IA)**

### **2.1 แผนที่แอปพลิเคชัน (Site Map)**

แผนภาพด้านล่างแสดงโครงสร้างหน้าทั้งหมดของระบบ CRM ในเวอร์ชัน MVP

graph TD  
    subgraph "Public Area"  
        Login\[Login Page\]  
    end

    subgraph "Protected Area (Main Layout)"  
        Dashboard\[Dashboard Overview\]  
        Jobs\[Jobs List\] \--\> JobDetail\[Job Detail View\]  
        Customers\[Customers List\] \--\> CustomerDetail\[Customer Detail View\]  
        Settings\[Settings\] \--\> ChecklistTemplates\[Checklist Templates\]  
    end

    Login \--\> Dashboard

### **2.2 โครงสร้างการนำทาง (Navigation Structure)**

* **แถบนำทางหลัก (Main Sidebar):** จะแสดงเมนูหลักเสมอเมื่อผู้ใช้ Login เข้ามาแล้ว ประกอบด้วย:  
  * Dashboard  
  * Jobs  
  * Customers  
  * Settings

## **3\. โฟลว์การใช้งาน (User Flows)**

### **3.1 Flow: แอดมินสร้างงานใหม่ (Admin Creates a New Job)**

* **เป้าหมายผู้ใช้:** แอดมินต้องการสร้างงานบริการใหม่ในระบบและมอบหมายให้ทีมปฏิบัติการได้อย่างรวดเร็ว  
* **จุดเริ่มต้น:** หน้า Job List Dashboard  
* **เกณฑ์ความสำเร็จ:** งานใหม่ถูกสร้างขึ้นในระบบ และทีมที่ได้รับมอบหมายสามารถมองเห็นงานนั้นได้

sequenceDiagram  
    participant Admin  
    participant System

    Admin-\>\>System: 1\. คลิกปุ่ม "Create New Job"  
    System--\>\>Admin: 2\. แสดงฟอร์มสร้างงาน (Modal)  
    Admin-\>\>System: 3\. ค้นหาและเลือก Customer  
    Admin-\>\>System: 4\. กรอกรายละเอียดงาน (Service Type, Date, Price)  
    Admin-\>\>System: 5\. เลือกทีม/บุคคลที่จะมอบหมายงาน (Assignee)  
    Admin-\>\>System: 6\. คลิกปุ่ม "Save Job"  
    System--\>\>Admin: 7\. บันทึกข้อมูล, ปิด Modal, แสดงข้อความยืนยัน  
    System--\>\>Admin: 8\. อัปเดตรายการงานใน Dashboard ทันที

## **4\. คู่มือสไตล์เบื้องต้น (Initial Style Guide)**

### **4.1 สี (Color Palette)**

เราจะใช้โทนสีที่ดูสะอาด, เป็นมืออาชีพ, และทันสมัย

| ประเภท | Hex Code | การใช้งาน |
| :---- | :---- | :---- |
| **Background** | \#FFFFFF / \#020817 (Dark) | สีพื้นหลังหลัก |
| **Text** | \#020817 / \#F8FAFC (Dark) | สีตัวอักษรหลัก |
| **Primary** | \#2563EB (Blue) | ปุ่มหลัก, ลิงก์, ส่วนที่เน้น |
| **Secondary** | \#64748B (Slate) | ตัวอักษรที่ไม่สำคัญ, เส้นขอบ |
| **Success** | \#16A34A (Green) | ข้อความยืนยัน, สถานะสำเร็จ |
| **Warning** | \#F59E0B (Amber) | ข้อความเตือน |
| **Destructive** | \#DC2626 (Red) | ปุ่มลบ, ข้อความแสดงข้อผิดพลาด |

### **4.2 รูปแบบตัวอักษร (Typography)**

* **Font Family:** Inter (เป็นฟอนต์มาตรฐานที่สะอาดตาและอ่านง่าย เหมาะสำหรับ UI)  
* **Body Text:** 14px  
* **Headings:** จะใช้ขนาดที่ใหญ่ขึ้นตามลำดับความสำคัญ (H1 \> H2 \> H3)

## **5\. คลังส่วนประกอบเบื้องต้น (Initial Component Inventory)**

รายการด้านล่างคือ "ชิ้นส่วน" หลักที่จะถูกสร้างขึ้นและนำไปใช้ซ้ำในหลายๆ หน้าของแอปพลิเคชัน

* **Page Header:** ส่วนหัวของแต่ละหน้า ประกอบด้วยชื่อหน้าและปุ่ม Action หลัก (เช่น ปุ่ม "Create New Job")  
* **Data Table:** ตารางสำหรับแสดงรายการข้อมูล (เช่น รายชื่อลูกค้า, รายการงาน) พร้อมฟังก์ชันค้นหา, จัดเรียง, และแบ่งหน้า  
* **Stat Card:** การ์ดสำหรับแสดงข้อมูลสรุปทางสถิติบนหน้า Dashboard (เช่น จำนวนงานใหม่, งานที่เสร็จสิ้นแล้ว)  
* **Status Badge:** ป้ายแสดงสถานะของงาน (เช่น New, In Progress, Done) ที่มีสีแตกต่างกันไป  
* **Form Controls:** ชุดฟอร์มพื้นฐาน (Input, Dropdown, Date Picker) ที่มีสไตล์สอดคล้องกัน

## **6\. การออกแบบเพื่อการตอบสนอง (Responsiveness)**

* **Mobile-First Approach:** การออกแบบจะเริ่มต้นจากหน้าจอมือถือเป็นหลัก  
* **Sidebar Navigation:** บนหน้าจอขนาดเล็กกว่า 768px แถบนำทางด้านข้างจะถูกซ่อนไว้และแสดงผลเป็น "Hamburger Menu" แทน  
* **Data Tables:** บนหน้าจอมือถือ ตารางข้อมูลจะถูกปรับเปลี่ยนรูปแบบการแสดงผลเป็นแบบ "Card List" เพื่อให้อ่านง่ายขึ้น  
* **Tap Targets:** ปุ่มและองค์ประกอบที่สามารถคลิกได้ทั้งหมดจะต้องมีขนาดใหญ่เพียงพอสำหรับการใช้งานด้วยนิ้วบนหน้าจอสัมผัส