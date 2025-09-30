# Debug Network Error - Story 2.6

## วิธีตรวจสอบ Network Error บน Production

### 1. เปิด Browser DevTools
- กด F12 หรือ Right-click → Inspect
- ไปที่ Tab **Network**
- Refresh หน้าเว็บ

### 2. ทดสอบเปลี่ยนสถานะงาน
- เลือกงานที่ต้องการเปลี่ยนสถานะ
- เปิด dropdown เลือกสถานะใหม่
- กด Confirm

### 3. ดู Request ที่ล้มเหลว
ใน Network tab จะเห็น request สีแดง ให้คลิกที่ request นั้น แล้วดู:

**ข้อมูลที่ต้องดู:**
- **Request URL**: จะเป็น `/api/jobs/[id]` (PATCH)
- **Status Code**: เช่น 400, 401, 403, 500
- **Response Tab**: Error message จาก API
- **Payload Tab**: ข้อมูลที่ส่งไป (status, assignedUserId, etc.)

### 4. Error Types ที่เป็นไปได้

#### Error 401 - Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**สาเหตุ:** Session หมดอายุ
**แก้:** Login ใหม่

#### Error 403 - Forbidden
```json
{
  "error": "Forbidden - Only Admin or assigned team member can update this job"
}
```
**สาเหตุ:** User ไม่มีสิทธิ์แก้ไขงานนี้
**แก้:** ต้องเป็น Admin หรือคนที่ถูก assign งานนี้

#### Error 400 - Invalid Transition
```json
{
  "error": "Invalid status transition",
  "message": "Cannot transition from COMPLETED to IN_PROGRESS",
  "currentStatus": "COMPLETED",
  "attemptedStatus": "IN_PROGRESS"
}
```
**สาเหตุ:** พยายามเปลี่ยนสถานะที่ไม่ถูกต้องตาม state machine
**แก้:** เลือกสถานะที่ valid เท่านั้น

#### Error 500 - Internal Server Error
```json
{
  "error": "Internal server error"
}
```
**สาเหตุ:** Database connection, Prisma error, หรือ server issue
**แก้:** ต้องดู server logs

## API Endpoints ที่ใช้ใน Story 2.6

### PATCH /api/jobs/[id]
**Purpose:** อัปเดตสถานะงาน

**Request:**
```json
{
  "status": "ASSIGNED"
}
```

**Authorization Rules:**
1. ✅ ADMIN - แก้ไขงานได้ทุกงาน
2. ✅ OPERATIONS/TRAINING/QC_MANAGER - แก้ไขได้เฉพาะงานที่ถูก assign
3. ❌ Other roles - ไม่สามารถแก้ไขได้

**State Machine Transitions:**
```
NEW → ASSIGNED, CANCELLED
ASSIGNED → IN_PROGRESS, CANCELLED
IN_PROGRESS → COMPLETED, ON_HOLD, CANCELLED
ON_HOLD → IN_PROGRESS, CANCELLED
COMPLETED → (terminal state)
CANCELLED → (terminal state)
```

## กรุณาส่งข้อมูลนี้มาให้ผมตรวจสอบ:
1. Request URL
2. Status Code
3. Response body (error message)
4. Request payload (ข้อมูลที่ส่งไป)
