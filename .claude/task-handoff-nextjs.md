# ⚙️ BACKEND INTEGRATION HANDOFF TO nextjs-developer

## Context
พัฒนา backend optimizations และ API integrations สำหรับ Tinedy CRM mobile app ที่จะทำงานเป็น PWA สำหรับ operations team

## Mobile Backend Requirements
### 1. **Mobile-Optimized API Endpoints**
- Lightweight data payloads สำหรับ mobile bandwidth
- Compressed responses (JSON + gzip)
- Efficient pagination for mobile lists
- Offline-first data structure

### 2. **Real-time Synchronization**
- WebSocket/Server-Sent Events สำหรับ real-time updates
- Job assignment notifications
- Status change broadcasts
- Background sync queue management

### 3. **PWA Backend Support**
- Service Worker cache strategies
- Background sync API endpoints
- Push notification server integration
- Manifest.json dynamic generation

## API Optimizations for Mobile
### **Jobs API Mobile Endpoints**
```typescript
// Lightweight job list for mobile
GET /api/mobile/jobs
Response: {
  jobs: [{
    id: string,
    customerName: string,
    serviceType: string,
    status: JobStatus,
    address: string,
    scheduledDate: string,
    assigneeId?: string
  }],
  total: number,
  hasMore: boolean
}

// Job details with mobile-specific data
GET /api/mobile/jobs/[id]
Response: {
  job: JobDetails,
  customerContact: CustomerContact,
  checklistItems: ChecklistItem[],
  photos: JobPhoto[],
  location: GeoLocation
}
```

### **Offline Sync API**
```typescript
// Bulk sync for offline data
POST /api/mobile/sync
Request: {
  pendingUpdates: StatusUpdate[],
  photos: PhotoUpload[],
  checkIns: LocationCheckin[]
}
Response: {
  conflicts: ConflictResolution[],
  synced: string[],
  failed: ErrorDetail[]
}
```

### **Real-time Updates**
```typescript
// WebSocket endpoint for live updates
WS /api/mobile/live-updates
Events: {
  'job-assigned': JobAssignment,
  'status-updated': StatusChange,
  'priority-alert': PriorityJob,
  'team-update': TeamStatus
}
```

## Performance Optimizations
1. **Database Query Optimization**
   - Mobile-specific indexes
   - Efficient joins for job lists
   - Pagination with cursor-based approach
   - Data prefetching strategies

2. **Response Optimization**
   - JSON payload compression
   - Image optimization and resizing
   - CDN integration for static assets
   - Caching headers for PWA

3. **Background Processing**
   - Queue system for heavy operations
   - Batch photo processing
   - Automatic sync conflict resolution
   - Performance monitoring

## Mobile-Specific Backend Features
### 1. **Photo Upload & Processing**
```typescript
// Mobile photo upload with compression
POST /api/mobile/jobs/[id]/photos
- Accept compressed images from mobile
- Automatic image optimization
- EXIF data extraction (GPS, timestamp)
- Storage in optimized formats
```

### 2. **GPS & Location Services**
```typescript
// Location check-in/check-out
POST /api/mobile/jobs/[id]/checkin
Request: {
  location: GeoLocation,
  timestamp: string,
  accuracy: number
}
```

### 3. **Push Notification Backend**
```typescript
// Push notification service
POST /api/mobile/notifications/send
- FCM/APNs integration
- User device registration
- Notification scheduling
- Delivery tracking
```

## Existing Backend Integration Points
- **Database**: Prisma + Vercel Postgres
- **Authentication**: NextAuth.js v5
- **API Framework**: Next.js API routes
- **File Storage**: Vercel Blob storage
- **Real-time**: Potential WebSocket upgrade

## Security Considerations for Mobile
- API rate limiting for mobile endpoints
- Device authentication tokens
- Secure photo upload with signed URLs
- Location data privacy compliance
- Offline data encryption

## Testing Requirements
- Mobile API endpoint testing
- Real-time synchronization testing
- Offline sync conflict resolution
- Performance testing under mobile conditions
- Security testing for mobile-specific endpoints

## Success Criteria
✅ Mobile-optimized API endpoints implemented
✅ Real-time synchronization working
✅ Offline sync functionality completed
✅ Push notification backend integrated
✅ Photo upload & processing optimized
✅ Performance targets met (< 200ms API response)
✅ Security requirements satisfied

## File Locations
- API Routes: apps\crm-app\app\api\
- Database Schema: apps\crm-app\prisma\schema.prisma
- Lib Functions: apps\crm-app\lib\
- Middleware: apps\crm-app\middleware.ts

## Collaboration with
- **mobile-developer**: PWA service worker integration
- **ux-ui-designer**: API data structure for mobile UI
- **qa-engineer**: Mobile API testing strategy

กรุณาพัฒนา mobile backend optimizations ตามข้อกำหนดข้างต้น