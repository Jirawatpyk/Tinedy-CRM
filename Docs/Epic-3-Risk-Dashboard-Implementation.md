# **Epic 3: การใช้งาน Risk Dashboard และ Monitoring Tools**

<!-- Powered by BMAD™ Core -->

## **ภาพรวม Risk Dashboard Implementation**

### **วัตถุประสงค์**
- สร้างระบบติดตามความเสี่ยงแบบ Real-time ที่สามารถใช้งานได้จริง
- ให้ทีมงานสามารถตรวจสอบสถานะความเสี่ยงและตัวชี้วัดได้อย่างต่อเนื่อง
- สร้างกลไกการแจ้งเตือนอัตโนมัติเมื่อความเสี่ยงเกิดขึ้น

## **🎯 Risk Monitoring Dashboard Structure**

### **1. Executive Risk Summary (สำหรับ Management)**

```html
<!-- Executive Dashboard Layout -->
<div class="risk-executive-dashboard">
  <div class="risk-score-card">
    <h2>Overall Project Risk Score</h2>
    <div class="score-display">
      <span class="score">75/100</span>
      <span class="trend up">↗ +15 from last week</span>
    </div>
  </div>

  <div class="critical-risks">
    <h3>Critical Risks Requiring Attention</h3>
    <ul>
      <li class="risk-item high">
        <span class="risk-name">N8N Integration</span>
        <span class="risk-status">Monitor</span>
        <span class="owner">Backend Team</span>
      </li>
      <li class="risk-item medium">
        <span class="risk-name">User Adoption</span>
        <span class="risk-status">On Track</span>
        <span class="owner">BA Team</span>
      </li>
    </ul>
  </div>
</div>
```

### **2. Technical Risk Dashboard (สำหรับ Development Team)**

#### **Performance Monitoring Panel**
```javascript
// Real-time Performance Metrics
const performanceMetrics = {
  apiResponseTime: {
    current: 250,
    threshold: 500,
    unit: 'ms',
    status: 'GREEN',
    trend: 'stable'
  },
  pageLoadTime: {
    current: 1.2,
    threshold: 2.0,
    unit: 'seconds',
    status: 'GREEN',
    trend: 'improving'
  },
  errorRate: {
    current: 0.3,
    threshold: 1.0,
    unit: '%',
    status: 'GREEN',
    trend: 'stable'
  },
  concurrentUsers: {
    current: 12,
    maximum: 25,
    unit: 'users',
    status: 'GREEN',
    trend: 'increasing'
  }
};

// Display Function
function updatePerformanceDashboard() {
  Object.keys(performanceMetrics).forEach(metric => {
    const data = performanceMetrics[metric];
    const element = document.getElementById(`metric-${metric}`);

    element.querySelector('.value').textContent = `${data.current} ${data.unit}`;
    element.querySelector('.status').className = `status ${data.status.toLowerCase()}`;
    element.querySelector('.trend').textContent = data.trend;

    // Update progress bar
    const progress = (data.current / data.threshold) * 100;
    element.querySelector('.progress-bar').style.width = `${Math.min(progress, 100)}%`;
  });
}
```

#### **Integration Health Monitor**
```javascript
// N8N Integration Status Tracking
const integrationStatus = {
  webhookEndpoint: {
    name: 'N8N Webhook Receiver',
    status: 'ACTIVE',
    lastSuccess: '2025-09-28T10:30:00Z',
    successRate: 98.5,
    avgResponseTime: 180,
    dailyRequests: 45
  },
  dataValidation: {
    name: 'Data Validation Service',
    status: 'ACTIVE',
    accuracy: 99.2,
    rejectedRecords: 2,
    totalProcessed: 250
  }
};

// Integration Dashboard Component
function renderIntegrationDashboard() {
  return `
    <div class="integration-dashboard">
      <h3>Integration Health Status</h3>

      <div class="integration-item">
        <div class="service-info">
          <h4>${integrationStatus.webhookEndpoint.name}</h4>
          <span class="status ${integrationStatus.webhookEndpoint.status.toLowerCase()}">
            ${integrationStatus.webhookEndpoint.status}
          </span>
        </div>
        <div class="metrics">
          <div class="metric">
            <label>Success Rate:</label>
            <span>${integrationStatus.webhookEndpoint.successRate}%</span>
          </div>
          <div class="metric">
            <label>Avg Response:</label>
            <span>${integrationStatus.webhookEndpoint.avgResponseTime}ms</span>
          </div>
          <div class="metric">
            <label>Daily Requests:</label>
            <span>${integrationStatus.webhookEndpoint.dailyRequests}</span>
          </div>
        </div>
      </div>

      <div class="integration-item">
        <div class="service-info">
          <h4>${integrationStatus.dataValidation.name}</h4>
          <span class="status active">ACTIVE</span>
        </div>
        <div class="metrics">
          <div class="metric">
            <label>Data Accuracy:</label>
            <span>${integrationStatus.dataValidation.accuracy}%</span>
          </div>
          <div class="metric">
            <label>Rejected:</label>
            <span>${integrationStatus.dataValidation.rejectedRecords}</span>
          </div>
          <div class="metric">
            <label>Processed:</label>
            <span>${integrationStatus.dataValidation.totalProcessed}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
```

### **3. User Adoption Dashboard (สำหรับ Business Team)**

#### **Adoption Metrics Tracking**
```javascript
// User Adoption Tracking
const adoptionMetrics = {
  totalUsers: 13,
  activeUsers: {
    daily: 11,
    weekly: 13,
    target: 13
  },
  userSatisfaction: {
    currentScore: 4.2,
    targetScore: 4.0,
    responseCount: 8
  },
  taskCompletion: {
    averageTime: 7.5,
    baselineTime: 10.0,
    improvementPercent: 25
  },
  supportTickets: {
    daily: 2,
    weekly: 12,
    resolved: 11,
    pending: 1
  }
};

// Adoption Dashboard Component
function renderAdoptionDashboard() {
  const adoptionRate = (adoptionMetrics.activeUsers.daily / adoptionMetrics.totalUsers * 100).toFixed(1);

  return `
    <div class="adoption-dashboard">
      <h3>User Adoption Status</h3>

      <div class="adoption-overview">
        <div class="stat-card">
          <h4>Daily Active Users</h4>
          <div class="stat-value">${adoptionMetrics.activeUsers.daily}/${adoptionMetrics.totalUsers}</div>
          <div class="stat-percentage">${adoptionRate}%</div>
        </div>

        <div class="stat-card">
          <h4>User Satisfaction</h4>
          <div class="stat-value">${adoptionMetrics.userSatisfaction.currentScore}/5.0</div>
          <div class="stat-trend positive">Above Target</div>
        </div>

        <div class="stat-card">
          <h4>Task Efficiency</h4>
          <div class="stat-value">${adoptionMetrics.taskCompletion.averageTime} min</div>
          <div class="stat-improvement">↓${adoptionMetrics.taskCompletion.improvementPercent}% vs baseline</div>
        </div>
      </div>

      <div class="support-summary">
        <h4>Support Activity</h4>
        <div class="support-stats">
          <span>Pending: ${adoptionMetrics.supportTickets.pending}</span>
          <span>Resolved: ${adoptionMetrics.supportTickets.resolved}</span>
          <span>Daily Average: ${adoptionMetrics.supportTickets.daily}</span>
        </div>
      </div>
    </div>
  `;
}
```

## **🚨 Automated Alert System Implementation**

### **Alert Configuration**
```javascript
// Alert Thresholds and Configuration
const alertConfig = {
  critical: {
    apiResponseTime: 2000, // 2 seconds
    errorRate: 5, // 5%
    webhookFailureRate: 10, // 10%
    systemDowntime: 300 // 5 minutes
  },
  warning: {
    apiResponseTime: 1000, // 1 second
    errorRate: 2, // 2%
    userAdoptionRate: 70, // 70%
    supportTicketIncrease: 200 // 200% increase
  },
  info: {
    performanceImprovement: 10, // 10% improvement
    userSatisfactionIncrease: 0.5, // 0.5 point increase
    successfulDeployment: true
  }
};

// Alert Processing System
class RiskAlertSystem {
  constructor() {
    this.alertQueue = [];
    this.notificationChannels = ['email', 'slack', 'dashboard'];
  }

  checkMetrics() {
    // API Response Time Check
    if (performanceMetrics.apiResponseTime.current > alertConfig.critical.apiResponseTime) {
      this.triggerAlert('CRITICAL', 'API Response Time',
        `Response time ${performanceMetrics.apiResponseTime.current}ms exceeds critical threshold`);
    }

    // Error Rate Check
    if (performanceMetrics.errorRate.current > alertConfig.critical.errorRate) {
      this.triggerAlert('CRITICAL', 'High Error Rate',
        `Error rate ${performanceMetrics.errorRate.current}% is above acceptable limit`);
    }

    // User Adoption Check
    const adoptionRate = (adoptionMetrics.activeUsers.daily / adoptionMetrics.totalUsers) * 100;
    if (adoptionRate < alertConfig.warning.userAdoptionRate) {
      this.triggerAlert('WARNING', 'Low User Adoption',
        `User adoption rate ${adoptionRate}% is below target`);
    }
  }

  triggerAlert(severity, type, message) {
    const alert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      severity,
      type,
      message,
      acknowledged: false
    };

    this.alertQueue.push(alert);
    this.sendNotifications(alert);
    this.updateDashboard(alert);
  }

  sendNotifications(alert) {
    // Email notification for critical alerts
    if (alert.severity === 'CRITICAL') {
      this.sendEmail(alert);
    }

    // Slack notification for all alerts
    this.sendSlackMessage(alert);
  }

  sendEmail(alert) {
    // Email implementation
    console.log(`📧 Sending critical alert email: ${alert.message}`);
  }

  sendSlackMessage(alert) {
    // Slack implementation
    const emoji = alert.severity === 'CRITICAL' ? '🚨' :
                  alert.severity === 'WARNING' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} Slack Alert: [${alert.severity}] ${alert.type} - ${alert.message}`);
  }

  updateDashboard(alert) {
    // Update dashboard with new alert
    const alertElement = document.getElementById('alerts-panel');
    if (alertElement) {
      alertElement.innerHTML = this.renderAlerts();
    }
  }

  renderAlerts() {
    return this.alertQueue
      .filter(alert => !alert.acknowledged)
      .map(alert => `
        <div class="alert ${alert.severity.toLowerCase()}">
          <div class="alert-header">
            <span class="alert-type">${alert.type}</span>
            <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="alert-message">${alert.message}</div>
          <button onclick="acknowledgeAlert(${alert.id})">Acknowledge</button>
        </div>
      `).join('');
  }
}
```

## **📊 Risk Reporting Templates**

### **Daily Risk Report Template**
```markdown
# Daily Risk Status Report - Epic 3
**Date**: ${new Date().toLocaleDateString()}
**Report Period**: Last 24 hours

## Executive Summary
- Overall Risk Score: ${riskScore}/100
- Critical Issues: ${criticalCount}
- New Risks Identified: ${newRisksCount}

## Technical Metrics
- API Performance: ${performanceMetrics.apiResponseTime.current}ms (Target: <500ms)
- Error Rate: ${performanceMetrics.errorRate.current}% (Target: <1%)
- System Uptime: ${systemUptime}% (Target: >99.5%)

## Integration Status
- N8N Webhook Success Rate: ${integrationStatus.webhookEndpoint.successRate}%
- Data Processing Accuracy: ${integrationStatus.dataValidation.accuracy}%

## User Adoption Progress
- Daily Active Users: ${adoptionMetrics.activeUsers.daily}/${adoptionMetrics.totalUsers}
- User Satisfaction: ${adoptionMetrics.userSatisfaction.currentScore}/5.0
- Support Tickets: ${adoptionMetrics.supportTickets.daily} new today

## Action Items
${generateActionItems()}

## Next Review: ${getNextReviewDate()}
```

### **Weekly Risk Assessment Template**
```javascript
// Weekly Risk Assessment Generator
function generateWeeklyRiskReport() {
  const weeklyData = {
    riskTrends: calculateRiskTrends(),
    mitigationEffectiveness: assessMitigationEffectiveness(),
    stakeholderFeedback: collectStakeholderFeedback(),
    recommendedActions: generateRecommendations()
  };

  return `
    # Weekly Risk Assessment - Epic 3
    **Week Ending**: ${new Date().toLocaleDateString()}

    ## Risk Trend Analysis
    ${weeklyData.riskTrends.map(trend => `
    - **${trend.riskName}**: ${trend.direction} (${trend.change}% change)
      - Current Score: ${trend.currentScore}/10
      - Previous Score: ${trend.previousScore}/10
      - Trend: ${trend.analysis}
    `).join('')}

    ## Mitigation Effectiveness Review
    ${weeklyData.mitigationEffectiveness.map(mitigation => `
    - **${mitigation.strategy}**: ${mitigation.effectiveness}%
      - Implemented: ${mitigation.implemented ? 'Yes' : 'No'}
      - Impact: ${mitigation.impact}
      - Recommendation: ${mitigation.recommendation}
    `).join('')}

    ## Stakeholder Feedback Summary
    ${weeklyData.stakeholderFeedback}

    ## Recommended Actions for Next Week
    ${weeklyData.recommendedActions.map((action, index) => `
    ${index + 1}. **${action.title}**
       - Priority: ${action.priority}
       - Owner: ${action.owner}
       - Timeline: ${action.timeline}
       - Resources: ${action.resources}
    `).join('')}
  `;
}
```

## **🔧 Risk Dashboard Implementation Guide**

### **Step 1: Technical Setup**
```bash
# Install required monitoring dependencies
npm install --save-dev @types/node-cron express-rate-limit helmet

# Create monitoring endpoints
mkdir -p apps/crm-app/app/api/monitoring
touch apps/crm-app/app/api/monitoring/health/route.ts
touch apps/crm-app/app/api/monitoring/metrics/route.ts
touch apps/crm-app/app/api/monitoring/alerts/route.ts
```

### **Step 2: Health Check Endpoint**
```typescript
// apps/crm-app/app/api/monitoring/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const healthChecks = {
      timestamp: new Date().toISOString(),
      database: await checkDatabaseHealth(),
      api: await checkApiHealth(),
      integration: await checkIntegrationHealth()
    };

    const overallHealth = Object.values(healthChecks)
      .filter(check => typeof check === 'object' && check !== null)
      .every(check => (check as any).status === 'healthy');

    return NextResponse.json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      checks: healthChecks
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'healthy', responseTime: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function checkApiHealth() {
  const startTime = Date.now();
  try {
    // Test basic API functionality
    await db.user.count();
    const responseTime = Date.now() - startTime;
    return {
      status: 'healthy',
      responseTime,
      performance: responseTime < 500 ? 'good' : 'degraded'
    };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function checkIntegrationHealth() {
  // Mock integration check - replace with actual N8N health check
  return {
    status: 'healthy',
    webhookEndpoint: 'active',
    lastSuccessfulRequest: new Date().toISOString()
  };
}
```

### **Step 3: Metrics Collection Endpoint**
```typescript
// apps/crm-app/app/api/monitoring/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      performance: await getPerformanceMetrics(),
      usage: await getUsageMetrics(),
      business: await getBusinessMetrics()
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getPerformanceMetrics() {
  // Collect performance data
  return {
    apiResponseTime: Math.random() * 500 + 100, // Mock data
    errorRate: Math.random() * 2,
    throughput: Math.floor(Math.random() * 100 + 50)
  };
}

async function getUsageMetrics() {
  const totalUsers = await db.user.count();
  const activeUsersToday = await db.user.count({
    where: {
      lastLoginAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  });

  return {
    totalUsers,
    activeUsersToday,
    adoptionRate: totalUsers > 0 ? (activeUsersToday / totalUsers) * 100 : 0
  };
}

async function getBusinessMetrics() {
  const totalJobs = await db.job.count();
  const completedJobs = await db.job.count({
    where: { status: 'COMPLETED' }
  });

  return {
    totalJobs,
    completedJobs,
    completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
  };
}
```

### **Step 4: Frontend Dashboard Component**
```tsx
// apps/crm-app/components/RiskDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HealthCheck {
  status: string;
  checks: {
    database: { status: string; responseTime?: number };
    api: { status: string; responseTime?: number; performance?: string };
    integration: { status: string; webhookEndpoint?: string };
  };
}

interface Metrics {
  performance: {
    apiResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  usage: {
    totalUsers: number;
    activeUsersToday: number;
    adoptionRate: number;
  };
  business: {
    totalJobs: number;
    completedJobs: number;
    completionRate: number;
  };
}

export default function RiskDashboard() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthResponse, metricsResponse] = await Promise.all([
          fetch('/api/monitoring/health'),
          fetch('/api/monitoring/metrics')
        ]);

        const healthData = await healthResponse.json();
        const metricsData = await metricsResponse.json();

        setHealth(healthData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* System Health Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          {health && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${
                health.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-medium">{health.status.toUpperCase()}</span>
              </div>

              <div className="text-sm space-y-1">
                <div>Database: {health.checks.database.status}</div>
                <div>API: {health.checks.api.status}
                  {health.checks.api.responseTime &&
                    ` (${health.checks.api.responseTime}ms)`}
                </div>
                <div>Integration: {health.checks.integration.status}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between">
                  <span>API Response</span>
                  <span className={
                    metrics.performance.apiResponseTime < 500
                      ? 'text-green-600' : 'text-yellow-600'
                  }>
                    {Math.round(metrics.performance.apiResponseTime)}ms
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className={
                    metrics.performance.errorRate < 1
                      ? 'text-green-600' : 'text-red-600'
                  }>
                    {metrics.performance.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span>Throughput</span>
                  <span>{Math.round(metrics.performance.throughput)} req/min</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Adoption Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Adoption</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span>{metrics.usage.totalUsers}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span>Active Today</span>
                  <span>{metrics.usage.activeUsersToday}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span>Adoption Rate</span>
                  <span className={
                    metrics.usage.adoptionRate > 80
                      ? 'text-green-600' : 'text-yellow-600'
                  }>
                    {Math.round(metrics.usage.adoptionRate)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Metrics Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Business Impact</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.business.totalJobs}</div>
                <div className="text-sm text-gray-600">Total Jobs</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.business.completedJobs}</div>
                <div className="text-sm text-gray-600">Completed Jobs</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(metrics.business.completionRate)}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## **📋 การใช้งาน Dashboard ในทีมงาน**

### **สำหรับ Project Manager**
1. ตรวจสอบ Executive Summary ทุกเช้า
2. Review Critical Risks weekly
3. Monitor KPI trends และ progress

### **สำหรับ Development Team**
1. ติดตาม Performance Metrics real-time
2. ตอบสนอง Technical Alerts ทันที
3. Update Mitigation Status เมื่อแก้ไขปัญหา

### **สำหรับ Business Analyst**
1. Monitor User Adoption trends
2. Collect และ analyze Stakeholder Feedback
3. Update Business Risk assessments

### **สำหรับ QA Team**
1. ติดตาม Error Rates และ Quality Metrics
2. Validate Mitigation Effectiveness
3. Report Quality-related Risks

---

**Risk Dashboard และ Monitoring Tools นี้** ให้ทีมงาน Epic 3 มีเครื่องมือที่จำเป็นในการติดตามและจัดการความเสี่ยงอย่างมีประสิทธิภาพ ช่วยให้สามารถตอบสนองต่อปัญหาได้อย่างรวดเร็วและมีข้อมูลสนับสนุนการตัดสินใจที่ถูกต้อง