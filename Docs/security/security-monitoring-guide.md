# 🔍 Security Monitoring & Alerting Guide

**Date:** 2024-01-27
**Author:** Database Agent (Alex)
**System:** Tinedy CRM Security Monitoring

## 📋 Overview

ระบบ Security Monitoring & Alerting ของ Tinedy CRM ถูกออกแบบมาเพื่อตรวจจับและตอบสนองต่อภัยคุกคามด้านความปลอดภัยแบบ real-time

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│ Security Monitor │───▶│ Alert Channels  │
│   Components    │    │    (Central)     │    │ (Email/Slack)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Event Buffer  │    │   Database Log   │    │  Security Logs  │
│   (In-Memory)   │    │  (Persistent)    │    │   (External)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Components

### 1. Security Monitor (`lib/monitoring/security-monitor.ts`)

**หน้าที่หลัก:**
- บันทึกและวิเคราะห์ security events
- ตรวจจับ threat patterns แบบ real-time
- ส่ง alerts เมื่อเกิดเหตุการณ์ผิดปกติ
- จัดเก็บ audit trails ใน database

**Event Types ที่ monitor:**
```typescript
- auth_failures          // ความล้มเหลวในการ authentication
- sql_injection_attempts  // ความพยายาม SQL injection
- xss_attempts           // ความพยายาม XSS attacks
- rate_limit_exceeded    // การเข้าถึงเกิน rate limit
- unauthorized_access    // การเข้าถึงที่ไม่ได้รับอนุญาต
- data_access_anomaly    // รูปแบบการเข้าถึงข้อมูลผิดปกติ
- privilege_escalation   // การยกระดับสิทธิ์ที่ผิดปกติ
```

### 2. Security Dashboard (`lib/monitoring/security-dashboard.ts`)

**หน้าที่:**
- รวบรวมและวิเคราะห์ security metrics
- สร้าง reports และ visualizations
- ติดตาม threat trends
- วิเคราะห์ user behavior patterns

**Dashboard Sections:**
- **Overview**: สถานะรวมของระบบ
- **Recent Events**: เหตุการณ์ล่าสุด
- **Threat Trends**: แนวโน้มภัยคุกคาม
- **User Activity**: กิจกรรมผู้ใช้ที่น่าสงสัย
- **System Metrics**: performance และ availability

### 3. Alert Channels

**Supported Channels:**
- **Email**: สำหรับ critical alerts
- **Slack**: สำหรับ team notifications
- **Webhook**: สำหรับ integration กับ external systems

## 🚨 Alert Configuration

### Alert Thresholds

```typescript
const SECURITY_ALERTS = {
  'auth_failures': {
    threshold: 5,              // 5 attempts
    timeWindow: 15 * 60 * 1000, // 15 minutes
    channels: ['email', 'slack']
  },

  'sql_injection_attempts': {
    threshold: 1,              // Any attempt
    timeWindow: 60 * 1000,     // 1 minute
    channels: ['email', 'slack', 'webhook']
  },

  // ... other configurations
};
```

### Severity Levels

- **🟢 LOW**: Informational events, ไม่ต้องการ immediate action
- **🟡 MEDIUM**: Events ที่ต้องการ attention ภายใน 24 ชั่วโมง
- **🟠 HIGH**: Events ที่ต้องการ immediate attention
- **🔴 CRITICAL**: Events ที่ต้องการ emergency response

## 📊 Monitoring Setup

### 1. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Alert Channels
SECURITY_ALERT_EMAIL="security@tinedy.com"
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
SECURITY_WEBHOOK_URL="https://external-siem.com/webhook"
SECURITY_WEBHOOK_TOKEN="secure_token_here"

# Monitoring Configuration
NODE_ENV="production"
SECURITY_MONITORING_ENABLED="true"
```

### 2. Automatic Event Recording

```typescript
// ตัวอย่างการใช้งานใน API endpoints
import { securityMonitor } from '@/lib/monitoring/security-monitor';

// บันทึก authentication failure
await securityMonitor.recordEvent({
  type: 'auth_failures',
  severity: 'MEDIUM',
  source: 'login_api',
  details: { email, ip },
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

### 3. Manual Security Scan

```typescript
// Run comprehensive security scan
const issues = await securityMonitor.runSecurityScan();

console.log(`Found ${issues.length} security issues:`, issues);
```

## 🔧 API Endpoints

### Security Dashboard
```
GET /api/security/dashboard?timeRange=24
- Get complete dashboard data
- timeRange: hours (1-168)
```

### Security Status
```
GET /api/security/status
- Get real-time security status
- Returns threat level and recommendations
```

### Security Metrics
```
GET /api/security/metrics?hours=24
- Get detailed security metrics
- hours: time range for metrics
```

### Manual Security Scan
```
POST /api/security/dashboard/scan
- Trigger manual security scan
- Returns found issues and recommendations
```

## 🔍 Detection Patterns

### 1. Brute Force Detection
```typescript
// Multiple failed logins from same IP
const suspiciousLogins = await this.checkSuspiciousLogins();
// Threshold: 5+ failures in 15 minutes
```

### 2. Data Access Anomaly
```typescript
// Unusual volume of data access
const dataAnomalies = await this.checkDataAccessAnomalies();
// Threshold: 100+ read operations in 1 hour
```

### 3. Privilege Escalation
```typescript
// Admin actions by non-admin users
const adminActions = await this.checkUnauthorizedAdminActions();
// Any admin action by non-admin role
```

### 4. SQL Injection Detection
```typescript
// Suspicious patterns in request content
const suspiciousPatterns = [
  /\b(union|select|insert|delete|drop)\b/i,
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /__proto__/gi
];
```

## 📈 Monitoring Best Practices

### 1. Real-time Monitoring
- ใช้ in-memory buffer สำหรับ event correlation
- Set up automated alerting สำหรับ critical events
- Monitor system performance metrics

### 2. Data Retention
```sql
-- Audit logs retention (1 year)
DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '365 days';

-- Security events retention (2 years for compliance)
DELETE FROM audit_logs
WHERE entity_type = 'SecurityEvent'
AND timestamp < NOW() - INTERVAL '730 days';
```

### 3. Performance Considerations
- ใช้ database indexes สำหรับ timestamp queries
- Batch process events เพื่อลด database load
- Clean up old events จาก memory buffer

### 4. Alert Fatigue Prevention
- Set appropriate thresholds เพื่อลด false positives
- Group related events together
- Implement alert suppression สำหรับ known issues

## 🚀 Deployment Checklist

### Production Setup
- [ ] Configure environment variables
- [ ] Set up email/Slack alerting
- [ ] Test all alert channels
- [ ] Configure log retention policies
- [ ] Set up monitoring dashboards
- [ ] Test security scan functionality

### Monitoring Health Checks
- [ ] Verify events are being recorded
- [ ] Check alert delivery
- [ ] Monitor system performance impact
- [ ] Validate data retention cleanup
- [ ] Test emergency response procedures

## 🔧 Troubleshooting

### Common Issues

**1. Alerts not being sent**
```bash
# Check environment variables
echo $SLACK_WEBHOOK_URL
echo $SECURITY_ALERT_EMAIL

# Check logs for delivery errors
grep "alert.*failed" /var/log/app.log
```

**2. High memory usage**
```typescript
// Check event buffer size
console.log('Event buffer size:', securityMonitor.eventBuffer.length);

// Manual cleanup
securityMonitor.cleanEventBuffer();
```

**3. Database performance issues**
```sql
-- Check audit log size
SELECT COUNT(*) FROM audit_logs WHERE entity_type = 'SecurityEvent';

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours';
```

### Performance Optimization
```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_security_timestamp
ON audit_logs(timestamp)
WHERE entity_type = 'SecurityEvent';

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp
ON audit_logs(user_id, timestamp);
```

## 📋 Security Incident Response

### Incident Severity Matrix

| Severity | Response Time | Actions Required |
|----------|---------------|------------------|
| CRITICAL | Immediate (< 5 min) | Emergency response, system lockdown if needed |
| HIGH | < 30 minutes | Investigation, containment measures |
| MEDIUM | < 2 hours | Analysis, security review |
| LOW | < 24 hours | Documentation, trend analysis |

### Response Procedures

**1. Critical Security Event**
1. Automatic alert sent to security team
2. Check security dashboard for context
3. Run manual security scan
4. Implement containment measures
5. Document incident and response

**2. Regular Security Review**
1. Weekly security dashboard review
2. Monthly threat trend analysis
3. Quarterly security scan and assessment
4. Annual security policy review

## 📊 Reporting

### Daily Security Report
```typescript
// Generate daily summary
const report = await securityDashboard.getDashboardData(24);
console.log('Daily Security Summary:', {
  totalEvents: report.overview.totalEvents,
  criticalEvents: report.overview.criticalEvents,
  systemHealth: report.overview.systemHealth
});
```

### Weekly Threat Analysis
```typescript
// Weekly threat trends
const trends = await securityDashboard.getThreatTrends(168); // 7 days
console.log('Weekly Threat Trends:', trends);
```

---

**Next Steps:**
1. Deploy security monitoring system
2. Configure alerting channels
3. Set up automated reporting
4. Train security team on response procedures
5. Schedule regular security reviews