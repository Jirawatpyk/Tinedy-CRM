# 🎨 UI/UX TASK HANDOFF TO ux-ui-designer

## Context
ออกแบบ mobile-first responsive UI สำหรับ Tinedy CRM operations team ที่จะทำงานเป็น PWA บนอุปกรณ์มือถือ

## Mobile UI Design Requirements
- **Mobile-First Design** - ออกแบบสำหรับ mobile ก่อน แล้วขยายไป desktop
- **Touch-Friendly Interface** - Touch targets ขนาดอย่างน้อย 44px
- **Progressive Web App (PWA)** - Interface ที่รองรับการติดตั้งเป็น app
- **Responsive Design** - ทำงานได้ทุกขนาดหน้าจอ (320px - 1440px+)

## Target Mobile Users
1. **Operations Team** - ทีมปฏิบัติการภาคสนาม
   - ต้องการ quick access ข้อมูลงาน
   - การอัปเดตสถานะแบบ one-tap
   - รูปแบบ card-based layout

2. **Service Technicians** - ช่างเทคนิค
   - Photo capture interface
   - GPS check-in/check-out
   - Real-time job updates

3. **Supervisors** - หัวหน้าทีม
   - Dashboard overview
   - Team status monitoring
   - Quick assignment tools

## Key Mobile Interface Components
### 1. **Mobile Job Card**
```
┌─────────────────────────────┐
│ [Photo] Customer Name       │
│         Job Type | Status   │
│         📍 Address          │
│ [Start] [Navigate] [Photos] │
└─────────────────────────────┘
```

### 2. **Bottom Navigation**
```
┌─────────────────────────────┐
│ [🏠] [📋] [👥] [⚙️] [👤]    │
│ Home Jobs Customers Settings │
└─────────────────────────────┘
```

### 3. **Mobile Data Tables → Card Lists**
```
Desktop Table:
| Name | Status | Date | Action |

Mobile Cards:
┌─────────────────┐
│ Customer Name   │
│ Status: Active  │
│ Date: Today     │
│ [Action Button] │
└─────────────────┘
```

## Mobile Navigation Patterns
- **Bottom Tab Navigation** - Primary navigation
- **Hamburger Menu** - Secondary/settings
- **Floating Action Button** - Primary actions (Add Job)
- **Swipe Gestures** - Card actions, back navigation
- **Pull-to-Refresh** - Data refresh

## Touch Interaction Design
- **44px minimum touch targets**
- **8px spacing** between interactive elements
- **Haptic feedback** for confirmations
- **Loading states** with skeleton screens
- **Error states** with retry buttons

## Mobile-Specific Features to Design
1. **Photo Capture Interface**
   - Camera overlay with guidelines
   - Before/after photo comparison
   - Photo annotation tools

2. **GPS Check-in/Check-out**
   - Location verification UI
   - Check-in confirmation screen
   - Location accuracy indicator

3. **Offline Mode UI**
   - Offline indicator
   - Cached data visualization
   - Sync status indicators

4. **Push Notification Design**
   - In-app notification banners
   - Notification action buttons
   - Priority level indicators

## Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## Existing UI Foundation
- **Design System**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Color Palette**:
  - Primary: #2563EB (Blue)
  - Success: #16A34A (Green)
  - Warning: #F59E0B (Amber)
  - Destructive: #DC2626 (Red)
- **Typography**: Inter font family

## Success Criteria
✅ Mobile-first responsive design completed
✅ Touch targets meet 44px minimum requirement
✅ Navigation patterns optimized for mobile
✅ Data tables converted to mobile-friendly cards
✅ PWA-ready interface with installation prompts
✅ Accessibility compliance (WCAG 2.1 AA)
✅ Performance optimization (minimal layout shifts)

## File Locations
- UI Specifications: docs\UI-UX Specification.md
- Component Library: apps\crm-app\components\ui\
- Mobile Epic: docs\Epic 4 Specialized Workflows & Mobile UI.md

## Collaboration with
- **mobile-developer**: PWA implementation & device APIs
- **nextjs-developer**: Component integration & API optimization

กรุณาออกแบบ mobile-first responsive UI ตามข้อกำหนดข้างต้น