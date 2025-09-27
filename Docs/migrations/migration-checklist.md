# 🚀 Migration Deployment Checklist

## Pre-Migration Phase

### 📋 Planning & Preparation
- [ ] **Migration reviewed and approved by team**
- [ ] **Staging environment deployed and tested**
- [ ] **Performance impact assessed**
- [ ] **Rollback strategy documented and tested**
- [ ] **Maintenance window scheduled**
- [ ] **Stakeholders notified**

### 🔒 Backup & Security
- [ ] **Full database backup completed**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] **Backup integrity verified**
- [ ] **Backup stored in secure location**
- [ ] **Access permissions reviewed**

### 🧪 Testing
- [ ] **Migration validated on development environment**
- [ ] **Migration validation script executed**
  ```bash
  node scripts/validate-migration.js
  ```
- [ ] **All unit tests passing**
- [ ] **Integration tests passing**
- [ ] **Performance tests completed**

## Migration Execution

### 🔍 Pre-Execution Checks
- [ ] **Database connection verified**
- [ ] **No active user sessions (if required)**
- [ ] **System monitoring enabled**
- [ ] **Emergency contacts available**

### ⚡ Execute Migration
- [ ] **Set maintenance mode (if applicable)**
  ```bash
  # Application maintenance mode
  ```
- [ ] **Run Prisma migration**
  ```bash
  npx prisma migrate deploy
  ```
- [ ] **Monitor execution progress**
- [ ] **Check for errors in logs**

### ✅ Post-Execution Validation
- [ ] **Schema validation completed**
  ```bash
  npx prisma db pull
  npx prisma validate
  ```
- [ ] **Run validation script**
  ```bash
  node scripts/validate-migration.js
  ```
- [ ] **Sample data operations tested**
- [ ] **Performance benchmarks verified**

## Application Deployment

### 🚀 Code Deployment
- [ ] **New application code deployed**
- [ ] **Environment variables updated**
- [ ] **Application started successfully**
- [ ] **Health checks passing**

### 🔗 Integration Testing
- [ ] **API endpoints responding correctly**
- [ ] **N8N webhook integration tested**
- [ ] **Database connections verified**
- [ ] **Authentication system working**

## Post-Migration Phase

### 📊 Monitoring & Verification
- [ ] **System performance monitored**
- [ ] **Error rates within normal range**
- [ ] **Database query performance acceptable**
- [ ] **No data corruption detected**

### 👥 User Acceptance
- [ ] **Key stakeholders notified of completion**
- [ ] **Basic user workflows tested**
- [ ] **Training documentation updated**
- [ ] **Support team briefed**

### 📝 Documentation
- [ ] **Migration results documented**
- [ ] **Performance metrics recorded**
- [ ] **Lessons learned captured**
- [ ] **Troubleshooting guide updated**

## Emergency Procedures

### 🚨 Rollback Criteria
Execute rollback if any of the following occur:
- [ ] Migration fails with critical errors
- [ ] Data corruption detected
- [ ] Performance degradation > 50%
- [ ] Critical application features not working
- [ ] Unrecoverable system errors

### 🔄 Rollback Execution
- [ ] **Stop application services**
- [ ] **Execute rollback script**
  ```bash
  psql $DATABASE_URL -f prisma/migrations/rollback_init_tinedy_crm_schema.sql
  ```
- [ ] **Restore from backup if needed**
  ```bash
  psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
  ```
- [ ] **Restart application with previous version**
- [ ] **Verify system functionality**
- [ ] **Notify stakeholders of rollback**

## Sign-off

### Technical Approval
- [ ] **Database Administrator** - _________________ Date: _______
- [ ] **Lead Developer** - _________________ Date: _______
- [ ] **DevOps Engineer** - _________________ Date: _______

### Business Approval
- [ ] **Product Owner** - _________________ Date: _______
- [ ] **Operations Manager** - _________________ Date: _______

### Final Approval
- [ ] **Technical Lead** - _________________ Date: _______

---

## Emergency Contacts

**Database Admin:** _________________________________
**DevOps Lead:** ___________________________________
**Product Owner:** _________________________________

## Migration Information

**Migration ID:** `20241227060000_init_tinedy_crm_schema`
**Scheduled Date:** ________________________________
**Estimated Duration:** ____________________________
**Rollback Window:** _______________________________

## Notes

_________________________________________________
_________________________________________________
_________________________________________________