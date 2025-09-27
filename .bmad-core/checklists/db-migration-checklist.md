# Database Migration Checklist

## Pre-Migration Phase

### Planning & Design
- [ ] **Schema changes reviewed and approved**
  - Business requirements validated
  - Breaking changes identified
  - Performance impact assessed
  - Security implications reviewed

- [ ] **Migration strategy defined**
  - Migration approach decided (all-at-once vs phased)
  - Downtime window planned
  - Rollback strategy documented
  - Communication plan for stakeholders

- [ ] **Dependencies mapped**
  - Related systems identified
  - API compatibility checked
  - Frontend/backend impacts assessed
  - Third-party integrations verified

### Environment Preparation
- [ ] **Development environment ready**
  - Latest code pulled
  - Dependencies updated
  - Development database clean

- [ ] **Staging environment prepared**
  - Production data copied (anonymized)
  - Same Postgres version as production
  - Resource allocation matches production

- [ ] **Production backup created**
  - Full database backup completed
  - Backup verified and tested
  - Recovery time estimated
  - Backup retention policy followed

### Testing Preparation
- [ ] **Test data prepared**
  - Realistic test datasets ready
  - Edge cases covered
  - Performance test data available
  - Data validation scripts prepared

## Migration Development Phase

### Schema Development
- [ ] **Prisma schema updated**
  - Models properly defined
  - Relationships correctly specified
  - Enums and types validated
  - Naming conventions followed

- [ ] **Migration generated**
  - Descriptive migration name used
  - Generated SQL reviewed
  - No syntax errors found
  - Breaking changes documented

- [ ] **Data migration scripts**
  - Data transformation logic written
  - Batch processing for large tables
  - Error handling implemented
  - Progress tracking included

### Local Testing
- [ ] **Migration tested locally**
  - Clean migration successful
  - Seed data works correctly
  - All tests pass
  - No foreign key violations

- [ ] **Performance testing**
  - Migration time measured
  - Index creation time assessed
  - Query performance validated
  - Memory usage monitored

- [ ] **Rollback testing**
  - Rollback scripts prepared
  - Rollback tested locally
  - Data integrity after rollback verified
  - Recovery time measured

## Pre-Production Testing

### Staging Environment Testing
- [ ] **Staging migration successful**
  - Migration applied without errors
  - Data integrity verified
  - Performance acceptable
  - All application features work

- [ ] **Integration testing**
  - API endpoints tested
  - Webhook processing verified
  - N8N integration validated
  - LINE OA data flow confirmed

- [ ] **User acceptance testing**
  - Key user workflows tested
  - Performance meets requirements
  - UI/UX functionality verified
  - Error scenarios handled

### Security & Compliance
- [ ] **Security review completed**
  - Access controls verified
  - Data encryption maintained
  - Audit trails preserved
  - Compliance requirements met

- [ ] **Permissions validated**
  - Database user permissions correct
  - Application service accounts updated
  - API key access verified
  - Role-based access working

## Production Migration Phase

### Pre-Migration Checks
- [ ] **Final preparation complete**
  - Maintenance window scheduled
  - Stakeholders notified
  - Monitoring tools prepared
  - Support team alerted

- [ ] **Environment validation**
  - Production database accessible
  - Backup completed and verified
  - Resource utilization normal
  - No active incidents

- [ ] **Application preparation**
  - Application in maintenance mode
  - Active connections drained
  - Background jobs paused
  - Cache cleared if needed

### Migration Execution
- [ ] **Migration applied**
  - Migration command executed
  - No errors during execution
  - Execution time within expected range
  - Progress monitored throughout

- [ ] **Immediate validation**
  - Database structure verified
  - Key indexes created
  - Foreign keys working
  - Data types correct

- [ ] **Data integrity check**
  - Row counts match expectations
  - Critical data relationships intact
  - Business logic constraints working
  - No orphaned records

### Application Startup
- [ ] **Application deployment**
  - New code deployed
  - Application started successfully
  - Health checks passing
  - No startup errors

- [ ] **Functional testing**
  - Core features operational
  - Database connections working
  - API responses normal
  - Error handling functional

## Post-Migration Phase

### Monitoring & Validation
- [ ] **Performance monitoring**
  - Response times normal
  - Database performance acceptable
  - Query execution times good
  - No unusual errors

- [ ] **Business validation**
  - Key business processes working
  - Data accuracy verified
  - User workflows functional
  - Reporting systems operational

- [ ] **Integration validation**
  - N8N webhooks processing
  - LINE OA integration working
  - External API calls successful
  - Data synchronization normal

### Documentation & Cleanup
- [ ] **Documentation updated**
  - Migration documented
  - Schema changes recorded
  - Rollback procedures updated
  - Lessons learned captured

- [ ] **Cleanup completed**
  - Temporary scripts removed
  - Old backup files archived
  - Development environments updated
  - Test data cleaned up

### Monitoring Setup
- [ ] **Ongoing monitoring**
  - Performance alerts configured
  - Error rate monitoring enabled
  - Data quality checks scheduled
  - Backup verification automated

## Emergency Procedures

### Rollback Criteria
- [ ] **Rollback triggers defined**
  - Performance degradation > 50%
  - Data corruption detected
  - Critical features not working
  - User-reported issues > threshold

### Rollback Execution
- [ ] **Rollback procedure ready**
  - Rollback scripts tested
  - Execution steps documented
  - Recovery time estimated
  - Communication plan prepared

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

## Notes Section

**Migration Name:** _________________________________

**Scheduled Date/Time:** ____________________________

**Estimated Downtime:** _____________________________

**Special Considerations:**
_____________________________________________________
_____________________________________________________
_____________________________________________________

**Emergency Contacts:**
- Database Admin: ___________________________________
- DevOps Lead: _____________________________________
- Product Owner: ___________________________________