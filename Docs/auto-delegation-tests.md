# Auto-Delegation System Tests

## 🧪 Test Scenarios สำหรับ AUTO-DELEGATION SYSTEM

### Test 1: Database Schema Request
**Input**: "ต้องการเพิ่ม table สำหรับ service history ลูกค้า"

**Expected Delegation**: `database-architect`
**Keywords Detected**: table, service, history
**Confidence**: 95%

**Expected Response**:
```markdown
## 🎭 AUTO-DELEGATION INITIATED

**Task**: สร้าง service history table
**Analysis**: Database schema design task
**Selected Agent**: database-architect
**Reasoning**: Keywords "table", "service history" indicate database schema work
**Expected Outcome**: Schema design และ migration files

Delegating to: /BMad:agents:database-architect
```

---

### Test 2: Component Development
**Input**: "สร้าง customer dashboard component ใหม่"

**Expected Delegation**: `nextjs` → `ux-ui-designer` (multi-agent)
**Keywords Detected**: component, dashboard, customer
**Confidence**: 85%

**Expected Response**:
```markdown
## 🔄 MULTI-AGENT WORKFLOW INITIATED

**Workflow Pattern**: component-development
**Participants**: [ux-ui-designer, nextjs]
**Sequence**: Design → Implementation
**Current Phase**: UX/UI design for dashboard layout
**Next Steps**: NextJS component implementation

Current: /BMad:agents:ux-ui-designer
```

---

### Test 3: N8N Webhook Issue
**Input**: "N8N webhook ไม่ส่งข้อมูลมา"

**Expected Delegation**: `api-integration`
**Keywords Detected**: N8N, webhook
**Confidence**: 90%

**Expected Response**:
```markdown
## 🎭 AUTO-DELEGATION INITIATED

**Task**: แก้ไขปัญหา N8N webhook integration
**Analysis**: API integration และ webhook troubleshooting
**Selected Agent**: api-integration
**Reasoning**: N8N webhook เป็น external integration task
**Expected Outcome**: Webhook connectivity restoration

Delegating to: /BMad:agents:api-integration
```

---

### Test 4: Deployment Failure
**Input**: "deploy ไม่ผ่าน build error ใน Vercel"

**Expected Delegation**: `deployment-specialist`
**Keywords Detected**: deploy, build, error, Vercel
**Confidence**: 95%

**Expected Response**:
```markdown
## 🎭 AUTO-DELEGATION INITIATED

**Task**: แก้ไขปัญหา Vercel deployment build error
**Analysis**: Deployment และ CI/CD troubleshooting
**Selected Agent**: deployment-specialist
**Reasoning**: Build errors และ Vercel deployment issues
**Expected Outcome**: Successful deployment resolution

Delegating to: /BMad:agents:deployment-specialist
```

---

### Test 5: Complex Feature Request
**Input**: "ต้องการ feature ใหม่สำหรับ tracking customer satisfaction"

**Expected Delegation**: Multi-agent workflow
**Keywords Detected**: feature, tracking, customer, satisfaction
**Confidence**: 80% (complex task)

**Expected Response**:
```markdown
## 🔄 MULTI-AGENT WORKFLOW INITIATED

**Workflow Pattern**: feature-development
**Participants**: [product-manager, business-analyst, ux-ui-designer, database-architect, nextjs, qa-engineer, deployment-specialist]
**Sequence**: Strategy → Requirements → Design → Database → Development → Testing → Deployment
**Current Phase**: Product strategy และ feature specification
**Next Steps**: Requirements analysis

Current: /BMad:agents:product-manager
```

---

### Test 6: Ambiguous Request
**Input**: "ระบบช้า"

**Expected Delegation**: `auto-coordinator` (escalation)
**Keywords Detected**: ระบบ, ช้า
**Confidence**: <70% (needs clarification)

**Expected Response**:
```markdown
## ⚠️ CLARIFICATION NEEDED

**Issue**: Task requires more specific information
**Analysis**: "ระบบช้า" could involve multiple domains
**Possible Agents**:
- database-architect (database performance)
- nextjs (frontend performance)
- deployment-specialist (infrastructure performance)
- data-engineer (analytics performance)

**Please specify**:
1. Which part of the system is slow?
2. When does the slowness occur?
3. Any specific error messages?

Would you like me to start with performance analysis? /BMad:agents:auto-coordinator
```

---

### Test 7: Testing Request
**Input**: "ต้องการสร้าง automated test สำหรับ customer API"

**Expected Delegation**: `testing-specialist`
**Keywords Detected**: automated, test, API
**Confidence**: 90%

**Expected Response**:
```markdown
## 🎭 AUTO-DELEGATION INITIATED

**Task**: สร้าง automated tests สำหรับ customer API
**Analysis**: Test automation task
**Selected Agent**: testing-specialist
**Reasoning**: "automated test" และ "API" indicate test automation
**Expected Outcome**: API test suite implementation

Delegating to: /BMad:agents:testing-specialist
```

---

### Test 8: UI/UX Design Request
**Input**: "หน้า login ไม่ user-friendly ต้องการปรับปรุง UX"

**Expected Delegation**: `ux-ui-designer`
**Keywords Detected**: login, user-friendly, UX
**Confidence**: 95%

**Expected Response**:
```markdown
## 🎭 AUTO-DELEGATION INITIATED

**Task**: ปรับปรุง login page UX
**Analysis**: User experience และ interface design
**Selected Agent**: ux-ui-designer
**Reasoning**: "user-friendly" และ "UX" เป็น design task
**Expected Outcome**: Improved login interface design

Delegating to: /BMad:agents:ux-ui-designer
```

---

## 🔧 Manual Testing Commands

### Test Delegation Logic
```bash
# Test single agent delegation
*analyze-task "ต้องการเพิ่ม index ใน customer table"
# Expected: database-architect

# Test multi-agent workflow
*analyze-task "สร้าง feature tracking customer feedback"
# Expected: multi-agent workflow

# Test ambiguous request
*analyze-task "มีปัญหา"
# Expected: clarification request
```

### Test Agent Integration
```bash
# Test handoff between agents
/BMad:agents:database-architect
# Add schema change
# Check if suggests handoff to nextjs for implementation

# Test collaboration
/BMad:agents:ux-ui-designer
# Design component
# Check if mentions need for nextjs implementation
```

### Test Workflow Patterns
```bash
# Test feature development workflow
*multi-workflow feature-development
# Check sequence: PM → BA → UX → DB → Dev → QA → Deploy

# Test integration workflow
*multi-workflow integration-project
# Check sequence: BA → API → DB → Dev → Test → Deploy
```

---

## 📊 Success Criteria

### ✅ **Pass Criteria**:
1. **Correct Agent Selection**: 8/8 tests delegate to expected agents
2. **Confidence Scoring**: Confidence scores match expected ranges
3. **Multi-Agent Detection**: Complex tasks trigger workflow patterns
4. **Ambiguous Handling**: Low-confidence tasks request clarification
5. **Handoff Integration**: Agents properly suggest collaboration

### ❌ **Fail Criteria**:
- Wrong agent selection for clear single-domain tasks
- High confidence on ambiguous requests
- Missing multi-agent workflows for complex tasks
- Agents don't suggest collaboration when needed

---

## 🚀 Next Steps After Testing

1. **Refinement**: Adjust keyword matching based on test results
2. **Documentation**: Update delegation rules based on findings
3. **Training**: Brief team on how to use auto-delegation
4. **Monitoring**: Set up success metrics tracking
5. **Iteration**: Continuously improve based on usage patterns

---

## 📝 Test Results Log

| Test | Expected Agent | Actual Agent | Confidence | Status | Notes |
|------|---------------|--------------|------------|--------|-------|
| 1    | database-architect | _pending_ | _pending_ | ⏳ | Database schema |
| 2    | Multi-agent | _pending_ | _pending_ | ⏳ | Component dev |
| 3    | api-integration | _pending_ | _pending_ | ⏳ | N8N webhook |
| 4    | deployment-specialist | _pending_ | _pending_ | ⏳ | Deploy issue |
| 5    | Multi-agent | _pending_ | _pending_ | ⏳ | Feature request |
| 6    | auto-coordinator | _pending_ | _pending_ | ⏳ | Ambiguous |
| 7    | testing-specialist | _pending_ | _pending_ | ⏳ | Test automation |
| 8    | ux-ui-designer | _pending_ | _pending_ | ⏳ | UX improvement |

**Overall Score**: _pending_ / 8 tests passed