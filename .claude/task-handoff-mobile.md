# 📱 MOBILE TASK HANDOFF TO mobile-developer

## Context
สร้าง mobile app สำหรับ Tinedy CRM operations team ที่มี responsive design, touch-friendly interface และ PWA capabilities สำหรับการทำงานในพื้นที่ของทีมปฏิบัติการ

## Mobile Features Implemented (Target)
- [x] PWA architecture analysis
- [ ] Service Worker implementation
- [ ] Web App Manifest configuration
- [ ] Offline capabilities for field work
- [ ] Touch-optimized mobile interface
- [ ] Device API integration (Camera, GPS)
- [ ] Push notification system

## Performance Considerations
- Mobile-first responsive design approach
- < 3s load time on mobile networks
- 60fps smooth animations and transitions
- Optimized bundle size for mobile
- Battery usage optimization
- Offline-first data strategy

## Device Integration Requirements
1. **Camera API** - Photo capture for job documentation
2. **Geolocation** - GPS tracking for check-in/check-out
3. **Push Notifications** - Real-time job assignments
4. **Local Storage** - Offline job data caching
5. **Background Sync** - Queue status updates when offline

## Target Mobile Users
- **Operations Team** - Field workers needing mobile access
- **Service Technicians** - Real-time job updates and documentation
- **Supervisors** - Mobile oversight of team activities

## Technical Foundation
- **Frontend**: Next.js 14+ with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS (Mobile-first)
- **State Management**: Zustand for mobile state
- **PWA Features**: Service Worker + Web App Manifest
- **Database**: Prisma + Vercel Postgres
- **Testing**: Lighthouse PWA audits + Mobile testing

## Collaboration Needs
- **ux-ui-designer**: Mobile interface design and user experience
- **nextjs-developer**: Backend API optimizations for mobile
- **qa-engineer**: Mobile testing strategy and PWA compliance

## Success Criteria
✅ PWA installable on mobile devices
✅ Responsive design works on all screen sizes
✅ Touch-friendly interface with min 44px tap targets
✅ Offline functionality for core features
✅ Device API integration working
✅ < 3s load time on mobile networks
✅ PWA Lighthouse score > 90

## Next Steps for mobile-developer
1. Implement PWA service worker and manifest
2. Create mobile-first responsive components
3. Develop offline data synchronization
4. Integrate device APIs (Camera, GPS, Push)
5. Optimize mobile performance and battery usage

## File Locations
- Project Root: C:\Users\Jiraw\OneDrive\Documents\Tinedy_CRM
- Agent Config: .claude\agents\mobile-developer.md
- Architecture Docs: docs\architecture\tech-stack.md
- Mobile Epic: docs\Epic 4 Specialized Workflows & Mobile UI.md
- UI Specs: docs\UI-UX Specification.md

กรุณาเริ่มพัฒนา PWA สำหรับ Tinedy CRM operations team ตามข้อกำหนดข้างต้น