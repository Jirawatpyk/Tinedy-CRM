# 🔍 Schema Validation Guide - Tinedy CRM

**Date:** 2024-01-27
**Author:** Database Agent (Alex)
**Purpose:** Comprehensive guide for database schema validation and data integrity

## 📋 Overview

ระบบ Schema Validation ของ Tinedy CRM ถูกออกแบบมาเพื่อรักษาความถูกต้องและความสมบูรณ์ของข้อมูลในทุกระดับ ตั้งแต่ data types จนถึง business logic validation

## 🏗️ Validation Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Request   │───▶│ Validation Layer │───▶│   Database      │
│   (User Input)  │    │   (Multi-tier)   │    │   (Validated)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Validation Layers                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Data Types    │   Constraints   │      Business Logic         │
│                 │                 │                             │
│ • Field Types   │ • Required      │ • Status Transitions        │
│ • Enums         │ • Lengths       │ • Assignment Rules          │
│ • Patterns      │ • Foreign Keys  │ • Date Logic               │
│ • Formats       │ • Unique        │ • Completion Rules          │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## 🔧 Validation Components

### 1. **Schema Validator** (`lib/validation/schema-validator.ts`)

**หน้าที่หลัก:**
- ตรวจสอบ schema consistency
- วิเคราะห์ data integrity
- ตรวจจับ orphaned records
- สร้าง validation reports

**Key Features:**
```typescript
// Comprehensive schema validation
const validation = await runSchemaValidation();

// Business logic validation
const businessCheck = await BusinessValidation.validateDataConsistency();

// Entity validation with Zod schemas
const result = validateEntity('customer', customerData);
```

### 2. **Database Constraints** (`lib/validation/database-constraints.ts`)

**หน้าที่:**
- ตรวจสอบ foreign key constraints
- วิเคราะห์ referential integrity
- ตรวจสอบ field constraints
- ตรวจสอบ business rules

**Constraint Types:**
```typescript
// Required fields validation
const required = validateRequired('job', jobData);

// Field length validation
const lengths = validateLengths('customer', customerData);

// Pattern validation (phone, email, etc.)
const patterns = validatePatterns('customer', customerData);

// Foreign key validation
const fkValidation = await validateForeignKeys('job', jobData);
```

### 3. **Data Type Validator** (`lib/validation/data-type-validator.ts`)

**หน้าที่:**
- ตรวจสอบ data types และ formats
- ตรวจสอบ enum values และ transitions
- ตรวจสอบ Thai-specific formats
- ตรวจสอบ business logic rules

**Supported Data Types:**
```typescript
// Thai-specific validators
DataTypeValidators.thaiPhone      // Thai phone format
DataTypeValidators.lineUserId     // LINE User ID format
DataTypeValidators.thaiName       // Thai name validation
DataTypeValidators.thaiAddress    // Thai address format

// Standard validators
DataTypeValidators.email          // Email validation
DataTypeValidators.id             // CUID validation
DataTypeValidators.jsonData       // JSON validation
```

### 4. **Validation Middleware** (`lib/validation/validation-middleware.ts`)

**หน้าที่:**
- API request validation
- Automatic validation decorators
- Batch validation
- Response sanitization

**Usage Examples:**
```typescript
// Request validation decorator
@validateRequest('customer', {
  checkConstraints: true,
  checkTransitions: true
})
export async function POST(request: NextRequest) {
  // Validated data available in request.validatedData
}

// Enum transition validation
@validateEnumTransition('job', 'status')
export async function PATCH(request: NextRequest) {
  // Status transitions automatically validated
}

// Batch validation
@validateBatch('customer', 50)
export async function POST(request: NextRequest) {
  // Batch operations validated
}
```

## 📊 Validation Rules

### **Customer Validation**

```typescript
const customerValidation = {
  required: ['name'],
  unique: ['lineUserId'],
  patterns: {
    lineUserId: /^U[a-fA-F0-9]{32}$/,
    phone: /^(\+66|0)[0-9]{8,9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    name: /^[\u0E00-\u0E7Fa-zA-Z\s\-\.]+$/
  },
  maxLengths: {
    name: 255,
    phone: 20,
    email: 255,
    address: 1000,
    notes: 2000
  },
  statusTransitions: {
    'ACTIVE': ['INACTIVE', 'BLOCKED'],
    'INACTIVE': ['ACTIVE', 'BLOCKED'],
    'BLOCKED': ['ACTIVE', 'INACTIVE']
  }
};
```

### **Job Validation**

```typescript
const jobValidation = {
  required: ['customerId', 'serviceType'],
  foreignKeys: {
    customerId: 'customers.id',
    assignedToId: 'users.id'
  },
  statusTransitions: {
    'NEW': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
    'ON_HOLD': ['IN_PROGRESS', 'CANCELLED'],
    'COMPLETED': [], // Final state
    'CANCELLED': []  // Final state
  },
  businessRules: {
    assignmentRules: {
      'TRAINING': ['ฝึกอบรม', 'Training', 'อบรม'],
      'QC_MANAGER': ['ตรวจสอบคุณภาพ', 'Quality Check'],
      'OPERATIONS': ['*'] // Can handle any service type
    },
    dateLogic: {
      completedAt: 'Required when status is COMPLETED',
      scheduledAt: 'Cannot be in the past for NEW jobs'
    }
  }
};
```

### **Quality Check Validation**

```typescript
const qualityCheckValidation = {
  required: ['jobId', 'checklistId'],
  statusTransitions: {
    'PENDING': ['IN_PROGRESS', 'PASSED', 'FAILED'],
    'IN_PROGRESS': ['PASSED', 'FAILED', 'NEEDS_REVIEW'],
    'PASSED': [], // Final state
    'FAILED': ['NEEDS_REVIEW'],
    'NEEDS_REVIEW': ['PASSED', 'FAILED']
  },
  completionRules: {
    requiredForPassed: ['completedBy', 'completedAt'],
    requiredForFailed: ['completedBy', 'completedAt', 'notes']
  }
};
```

## 🚨 Common Validation Scenarios

### **1. Customer Creation**
```typescript
// Validate new customer data
const customerData = {
  name: 'สมชาย ใจดี',
  phone: '+66812345678',
  email: 'somchai@example.com',
  lineUserId: 'U1234567890abcdef1234567890abcdef',
  status: 'ACTIVE'
};

const validation = await validateRequestData('customer', customerData, {
  checkConstraints: true
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### **2. Job Status Update**
```typescript
// Validate job status transition
const currentJob = { status: 'NEW' };
const updateData = { status: 'IN_PROGRESS' };

const validation = await DataTypeValidator.validateComplete('job', updateData, {
  checkTransitions: true,
  currentData: currentJob
});

if (!validation.valid) {
  console.error('Invalid status transition:', validation.errors);
}
```

### **3. Quality Check Completion**
```typescript
// Validate quality check completion
const qcData = {
  status: 'PASSED',
  completedBy: 'user123',
  completedAt: new Date(),
  notes: 'All checks passed successfully'
};

const validation = await validateRequestData('qualityCheck', qcData, {
  checkConstraints: true,
  checkTransitions: true
});
```

## 📈 API Endpoints

### **Schema Validation API**
```bash
# Run comprehensive schema validation
GET /api/validation/schema

# Validate specific entity
POST /api/validation/schema/entity
{
  "entityType": "customer",
  "data": { ... },
  "options": {
    "checkTransitions": true,
    "checkBusinessLogic": true
  }
}
```

### **Constraints Validation API**
```bash
# Check database constraints
GET /api/validation/constraints?type=referential

# Validate entity constraints
POST /api/validation/constraints/entity
{
  "entityType": "job",
  "data": { ... },
  "context": {
    "currentData": { ... },
    "operation": "UPDATE"
  }
}
```

## 🔍 Validation Reports

### **Schema Validation Report**
```typescript
{
  "timestamp": "2024-01-27T10:00:00Z",
  "schema": {
    "valid": true,
    "summary": {
      "dataConsistencyIssues": 0,
      "foreignKeyIssues": 0
    },
    "details": {
      "dataConsistency": {
        "valid": true,
        "issues": []
      },
      "recommendations": [
        "✅ Schema validation passed - database is in good health"
      ]
    }
  }
}
```

### **Constraint Validation Report**
```typescript
{
  "timestamp": "2024-01-27T10:00:00Z",
  "referentialIntegrity": {
    "valid": true,
    "issues": []
  },
  "summary": {
    "totalTables": 9,
    "constraintViolations": 0,
    "referentialIntegrityIssues": 0
  }
}
```

## ⚠️ Error Handling

### **Validation Error Types**
```typescript
// Data type errors
{
  "dataType": [
    "name: Name contains invalid characters",
    "phone: Invalid Thai phone number format"
  ]
}

// Constraint errors
{
  "required": ["name", "serviceType"],
  "foreignKeys": [
    {
      "field": "customerId",
      "value": "invalid_id",
      "table": "customers"
    }
  ]
}

// Business logic errors
{
  "businessLogic": [
    "Invalid status transition from NEW to COMPLETED",
    "Training jobs must be assigned to TRAINING role users"
  ]
}
```

### **Error Response Format**
```typescript
{
  "error": "Validation failed",
  "details": {
    "dataType": [...],
    "constraints": {...},
    "businessLogic": [...]
  },
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## 🛠️ Implementation Examples

### **Custom Validation Rule**
```typescript
// Add custom business rule
export function validateCustomBusinessRule(data: any): boolean {
  // Example: Thai company registration number validation
  if (data.companyRegistration) {
    const pattern = /^[0-9]{13}$/;
    return pattern.test(data.companyRegistration);
  }
  return true;
}
```

### **API Integration**
```typescript
// API route with validation
import { validateRequest } from '@/lib/validation/validation-middleware';

@validateRequest('customer', {
  checkConstraints: true,
  checkTransitions: true
})
export async function POST(request: NextRequest) {
  const validatedData = (request as any).validatedData;

  // Data is guaranteed to be valid
  const customer = await prisma.customer.create({
    data: validatedData
  });

  return NextResponse.json(customer);
}
```

### **Batch Validation**
```typescript
// Validate multiple entities
const customers = [
  { name: 'Customer 1', phone: '+66812345678' },
  { name: 'Customer 2', phone: '+66887654321' }
];

const batchValidation = validateBatch(
  customers.map(customer => ({
    entityType: 'customer',
    data: customer
  }))
);

if (!batchValidation.valid) {
  console.error('Batch validation failed:', batchValidation.results);
}
```

## 📊 Performance Considerations

### **Validation Performance Tips**
1. **Use validation middleware** to avoid manual validation in each endpoint
2. **Cache validation results** for frequently validated data
3. **Skip unnecessary validations** for internal operations
4. **Use partial validation** for PATCH operations
5. **Batch validate** when processing multiple entities

### **Optimization Examples**
```typescript
// Skip validation for internal operations
const validation = await validateRequestData('job', data, {
  checkConstraints: false // Skip for internal updates
});

// Partial validation for PATCH
const partialData = { status: 'IN_PROGRESS' };
const validation = await validateEntity('job', partialData, {
  partial: true
});
```

## 🔄 Automated Validation

### **CI/CD Integration**
```bash
# Run schema validation in CI/CD pipeline
npm run validate:schema

# Check for validation issues before deployment
npm run validate:constraints

# Generate validation report
npm run validate:report
```

### **Scheduled Validation**
```typescript
// Schedule daily validation checks
cron.schedule('0 2 * * *', async () => {
  console.log('🔍 Running daily schema validation...');

  const validation = await runSchemaValidation();

  if (!validation.valid) {
    // Send alert to monitoring system
    await sendAlert('Schema validation failed', validation);
  }
});
```

## 📋 Best Practices

### **Development Best Practices**
1. **Always validate** at API boundaries
2. **Use TypeScript** for compile-time validation
3. **Test validation rules** with unit tests
4. **Document validation requirements** for API consumers
5. **Monitor validation failures** in production

### **Production Best Practices**
1. **Enable all validations** in production
2. **Log validation failures** for debugging
3. **Set up alerts** for validation rule violations
4. **Regular validation audits** to ensure data integrity
5. **Performance monitoring** for validation overhead

---

## 🎯 Next Steps

1. **Deploy validation system** to production
2. **Set up monitoring** for validation failures
3. **Create validation tests** for all entities
4. **Document API validation** requirements
5. **Schedule regular** validation audits

**Schema validation system is ready for production deployment! 🚀**