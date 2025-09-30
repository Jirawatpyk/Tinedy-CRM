# 🧪 Comprehensive Test Checklist - Tinedy CRM

## 🎯 **วัตถุประสงค์**: ป้องกันการแก้ไขและทดสอบไม่ถี่ถ้วน

---

## ✅ **Test Checklist ก่อน Deploy ทุกครั้ง**

### **🔐 1. Authentication & Security**
- [ ] ✅ Login/Logout ทำงานปกติ
- [ ] ✅ Session management ไม่หลุด
- [ ] ✅ Role-based access (Admin vs Operations)
- [ ] ✅ Unauthorized access ถูกป้องกัน

### **👥 2. Customer Management (/customers)**
- [ ] ✅ **CRITICAL**: Pagination - กดหน้า 2,3,4 ไม่เด้งกลับหน้า 1
- [ ] ✅ Customer search ด้วยชื่อ/เบอร์โทร
- [ ] ✅ Add Customer - form validation
- [ ] ✅ Edit Customer - บันทึกและ update list
- [ ] ✅ View Customer details
- [ ] ✅ Delete Customer (ถ้ามี)

### **💼 3. Job Management (/jobs)**
- [ ] ✅ **CRITICAL**: Job form ไม่มี Select empty string error
- [ ] ✅ Create Job - ทุก field รวมถึง "ไม่มอบหมาย"
- [ ] ✅ Job assignment dropdown ทำงาน
- [ ] ✅ Job status management
- [ ] ✅ Job details view (Story 2.4)
- [ ] ✅ Job search และ filtering
- [ ] ✅ Job list pagination

### **⚙️ 4. UI/UX Components**
- [ ] ✅ **CRITICAL**: ไม่มี Select components ที่ใช้ `value=""`
- [ ] ✅ Loading states ทำงาน
- [ ] ✅ Error messages แสดงถูกต้อง
- [ ] ✅ Success notifications
- [ ] ✅ Form validation messages
- [ ] ✅ Responsive design บน mobile

### **🚀 5. Performance & API**
- [ ] ✅ API response time < 500ms
- [ ] ✅ Database queries optimized
- [ ] ✅ No memory leaks
- [ ] ✅ Caching ทำงานถูกต้อง
- [ ] ✅ Error handling ครอบคลุม

---

## 🛡️ **Quality Gates - ห้าม Deploy ถ้า**

### **🚫 BLOCKING Issues:**
1. **Pagination เด้งกลับหน้า 1**
2. **Select component มี empty string value**
3. **Form submission ล้มเหลว**
4. **Authentication bypass ได้**
5. **Critical API errors**

### **⚠️ WARNING Issues (แก้ก่อน deploy):**
1. **Loading เกิน 2 วินาที**
2. **Console errors/warnings**
3. **Mobile UI ผิดพลาด**
4. **Accessibility issues**

---

## 🔄 **Test Automation Strategy**

### **📋 Manual Testing (บังคับทุกครั้ง):**
```bash
# 1. Start dev server
npm run dev

# 2. Test key flows:
1. Login → Customer List → หน้า 2,3,4 → ไม่เด้งกลับ
2. Create Customer → List updates
3. Edit Customer → Changes saved
4. Create Job → No Select errors → Success
5. Job Assignment → "ไม่มอบหมาย" works
6. Job Details → All data shows
7. Create Job → List updates
8. Job Filter → ประเภทบริการและสถานะ ทำงานถูกต้อง
9. dashborad page → ข้อมูล sync ทุกหน้า
```

### **🤖 Automated Testing:**
```bash
# Run before every commit
npm run test
npm run e2e

# Check build
npm run build

# Lint check
npm run lint
```

---

## 📊 **Test Evidence Required**

### **🎥 การบันทึกหลักฐาน:**
1. **Screenshot** ทุกหน้าสำคัญ
2. **Screen recording** pagination test
3. **Browser console** ไม่มี errors
4. **Performance metrics** load time
5. **API response logs** success cases

### **📝 Test Report Template:**
```markdown
## Test Report - [Date]

### ✅ PASSED
- Customer pagination: ✅
- Job form: ✅
- Performance: ✅

### ❌ FAILED
- [List any failures]

### 📊 Metrics
- Load time: XXXms
- API response: XXXms
- Console errors: 0

### 🎯 Ready for Deploy: YES/NO
```

---

## 🛠️ **Debug Tools & Commands**

### **Development:**
```bash
# Check running processes
npm run dev -- --debug

# Database inspection
npx prisma studio

# Performance monitoring
npm run analyze

# Type checking
npm run type-check
```

### **Production Verification:**
```bash
# Build test
npm run build
npm run start

# Deployment check
vercel --prod --confirm
```

---

## 🎯 **Success Criteria**

**✅ DEPLOY READY เมื่อ:**
1. ✅ ทุก checkbox ใน checklist ผ่าน
2. ✅ ไม่มี BLOCKING issues
3. ✅ Performance เป็นไปตามเกณฑ์
4. ✅ มี Test Evidence ครบถ้วน
5. ✅ QA sign-off

**🚀 โดย:** [Tester Name]
**📅 วันที่:** [Date]
**✍️ ลายเซ็น:** [Signature]

---

> **💡 หลัก**: "ทดสอบไม่ถี่ถ้วน = โปรเจ็คไม่ไปไหน"
> **🎯 เป้าหมาย**: Zero Production Bugs