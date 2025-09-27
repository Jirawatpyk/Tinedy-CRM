# Webhook Data Modeling Task

## Objective
Design data models and processing logic for N8N webhook integration to receive LINE OA booking data into Tinedy CRM.

## Prerequisites
- [ ] N8N webhook payload structure documented
- [ ] LINE OA data format understood
- [ ] CRM core schema designed

## Task Steps

### 1. Analyze Webhook Payload Structure

**Expected N8N Webhook Data Format:**
```typescript
interface N8NWebhookPayload {
  // Workflow metadata
  workflowId: string;
  executionId: string;
  timestamp: string;

  // Customer data from LINE OA
  customer: {
    lineUserId: string;
    displayName: string;
    phone?: string;
    email?: string;
  };

  // Booking/Service data
  booking: {
    serviceType: string;
    description: string;
    preferredDate?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location?: string;
    specialRequirements?: string;
  };

  // Additional metadata
  metadata: {
    source: 'LINE_OA';
    channel: string;
    messageId?: string;
    conversationContext?: any;
  };
}
```

### 2. Design Webhook Processing Models

#### Webhook Log Model
```prisma
model WebhookLog {
  id            String           @id @default(cuid())
  source        String           // 'N8N', 'LINE_OA'
  workflowId    String?
  executionId   String?
  payload       Json             // Raw webhook payload
  status        WebhookStatus    @default(RECEIVED)
  processedAt   DateTime?
  errorMessage  String?
  createdJobId  String?          // Reference to created job
  retryCount    Int              @default(0)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  // Relations
  createdJob    Job?             @relation(fields: [createdJobId], references: [id])

  @@map("webhook_logs")
}

enum WebhookStatus {
  RECEIVED
  PROCESSING
  PROCESSED
  FAILED
  RETRY_NEEDED
}
```

#### Webhook Processing Service Interface
```typescript
interface WebhookProcessor {
  process(payload: N8NWebhookPayload): Promise<ProcessingResult>;
  validatePayload(payload: unknown): boolean;
  transformToJob(payload: N8NWebhookPayload): JobCreateInput;
  handleCustomer(customerData: any): Promise<Customer>;
}

interface ProcessingResult {
  success: boolean;
  jobId?: string;
  customerId?: string;
  errors?: string[];
  warnings?: string[];
}
```

### 3. Design Data Transformation Logic

#### Customer Handling
```typescript
async function handleCustomerFromWebhook(
  customerData: N8NWebhookPayload['customer']
): Promise<Customer> {
  // 1. Check if customer exists by LINE User ID
  let customer = await prisma.customer.findUnique({
    where: { lineUserId: customerData.lineUserId }
  });

  if (!customer) {
    // 2. Create new customer
    customer = await prisma.customer.create({
      data: {
        lineUserId: customerData.lineUserId,
        name: customerData.displayName,
        phone: customerData.phone,
        email: customerData.email,
        status: 'ACTIVE'
      }
    });
  } else {
    // 3. Update existing customer if new info available
    if (customerData.phone || customerData.email) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          phone: customerData.phone || customer.phone,
          email: customerData.email || customer.email,
          name: customerData.displayName || customer.name,
          updatedAt: new Date()
        }
      });
    }
  }

  return customer;
}
```

#### Job Creation from Webhook
```typescript
async function createJobFromWebhook(
  payload: N8NWebhookPayload,
  customer: Customer
): Promise<Job> {
  return await prisma.job.create({
    data: {
      customerId: customer.id,
      serviceType: payload.booking.serviceType,
      description: payload.booking.description,
      priority: payload.booking.priority,
      scheduledAt: payload.booking.preferredDate
        ? new Date(payload.booking.preferredDate)
        : null,
      n8nWorkflowId: payload.workflowId,
      webhookData: payload, // Store raw webhook data
      status: 'NEW'
    }
  });
}
```

### 4. Design Webhook API Endpoint

#### API Route Structure
```typescript
// app/api/webhook/n8n/route.ts
export async function POST(request: Request) {
  try {
    // 1. Validate webhook authentication
    const isValid = await validateWebhookAuth(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate payload
    const payload = await request.json();
    const validatedPayload = validateN8NPayload(payload);

    // 3. Log incoming webhook
    const webhookLog = await logWebhook({
      source: 'N8N',
      payload: validatedPayload,
      status: 'RECEIVED'
    });

    // 4. Process webhook
    const result = await processN8NWebhook(validatedPayload, webhookLog.id);

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      customerId: result.customerId
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### 5. Design Error Handling & Retry Logic

#### Webhook Retry Strategy
```typescript
interface RetryConfig {
  maxRetries: number;
  retryDelays: number[]; // milliseconds
  retryableErrors: string[];
}

const WEBHOOK_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelays: [1000, 5000, 15000], // 1s, 5s, 15s
  retryableErrors: [
    'CUSTOMER_CREATION_FAILED',
    'DATABASE_CONNECTION_ERROR',
    'TEMPORARY_SERVICE_UNAVAILABLE'
  ]
};
```

#### Dead Letter Queue Model
```prisma
model FailedWebhook {
  id            String    @id @default(cuid())
  originalLogId String
  payload       Json
  errorDetails  String
  failedAt      DateTime  @default(now())
  retryAfter    DateTime?
  manualReview  Boolean   @default(false)

  @@map("failed_webhooks")
}
```

### 6. Design Webhook Security

#### Authentication Strategy
```typescript
// Webhook signature validation
async function validateWebhookAuth(request: Request): Promise<boolean> {
  const signature = request.headers.get('x-n8n-signature');
  const timestamp = request.headers.get('x-timestamp');
  const body = await request.text();

  // Validate timestamp (prevent replay attacks)
  if (!timestamp || Math.abs(Date.now() - parseInt(timestamp)) > 300000) {
    return false; // 5 minute window
  }

  // Validate signature
  const expectedSignature = await generateWebhookSignature(body, timestamp);
  return signature === expectedSignature;
}
```

## Validation Steps
- [ ] Test webhook endpoint with sample N8N payloads
- [ ] Verify customer deduplication logic
- [ ] Test error handling and retry mechanisms
- [ ] Validate webhook authentication
- [ ] Check data transformation accuracy

## Deliverables
1. Webhook processing models (Prisma schema additions)
2. API endpoint implementation
3. Data transformation services
4. Error handling and retry logic
5. Security and authentication layer
6. Testing data and scenarios

## Success Criteria
- Webhooks processed reliably without data loss
- Customer deduplication works correctly
- Error handling prevents system crashes
- Security prevents unauthorized access
- Performance handles expected webhook volume