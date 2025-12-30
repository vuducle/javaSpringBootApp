# Flyway Migration Management Guide

## Current Issue

Your application failed to start because Flyway detected a checksum mismatch in migration V3:

- Database checksum: -1981718328
- Local file checksum: -108703863

This happens when a migration file is modified after it's been applied to the database.

## Immediate Fix (Development Environment)

### Option 1: SQL Repair (Recommended for Quick Fix)

1. Connect to your PostgreSQL database:

   ```bash
   psql -h localhost -U nachweise_user -d nachweise_db
   ```

2. Update the checksum in the flyway_schema_history table:

   ```sql
   UPDATE flyway_schema_history
   SET checksum = -108703863
   WHERE version = '3';
   ```

3. Verify the update:
   ```sql
   SELECT version, checksum FROM flyway_schema_history WHERE version = '3';
   ```

### Option 2: Use Development Profile with Lenient Validation

Run your application with the dev profile:

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

Or if using IntelliJ/IDE, add VM option:

```
-Dspring.profiles.active=dev
```

The `application-dev.properties` now has `spring.flyway.validate-on-migrate=false` which will skip checksum validation.

## Environment Configuration

### Development (`application-dev.properties`)

- ✅ Lenient validation (`validate-on-migrate=false`)
- ✅ Allows migration modifications
- ✅ More verbose logging
- ⚠️ Use only in local development

### Production (`application-prod.properties`)

- ✅ Strict validation (`validate-on-migrate=true`)
- ✅ No automatic repairs
- ✅ Fail-fast on issues
- ✅ Clean operations disabled for safety

## Running the Application

### Development Mode

```bash
# Method 1: Gradle with profile
./gradlew bootRun --args='--spring.profiles.active=dev'

# Method 2: Environment variable
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun

# Method 3: Java command
java -jar build/libs/javaMusicApp-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

### Production Mode

```bash
./gradlew bootRun --args='--spring.profiles.active=prod'
# Or
java -jar build/libs/javaMusicApp-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Best Practices

### ✅ DO

1. **Never modify applied migrations** - Create new migration files instead
2. **Use versioned migrations** - V4, V5, V6, etc. for new changes
3. **Test migrations** - Always test in dev before applying to production
4. **Review migration scripts** - Before applying, review the SQL
5. **Backup before migrations** - Always backup production data first

### ❌ DON'T

1. **Don't modify existing migrations** that have been applied
2. **Don't use clean or repair** in production automatically
3. **Don't skip validation** in production
4. **Don't commit local database dumps** to version control

## Creating New Migrations

When you need to make database changes:

```bash
# Create a new migration file
touch src/main/resources/db/migration/V4__your_description.sql
```

Example V4 file:

```sql
-- V4__add_new_feature.sql
ALTER TABLE app_user
ADD COLUMN new_field VARCHAR(255);

CREATE INDEX idx_user_new_field ON app_user(new_field);
```

## Troubleshooting

### Checksum Mismatch

**Cause**: Migration file was modified after being applied

**Solution**:

1. In dev: Update checksum in database or use dev profile
2. In prod: Revert the migration file to original state, create V4 instead

### Migration Failed

**Cause**: SQL error in migration script

**Solution**:

1. Check the error message
2. Fix the SQL in a new migration
3. Or manually fix the database and repair Flyway history

### "Flyway baseline" Issues

**Cause**: Flyway history table doesn't match migrations

**Solution**:

```bash
# For development only - this can reset Flyway
# WARNING: Only use in dev!
# Connect to psql and run:
DROP TABLE flyway_schema_history CASCADE;
# Then restart app with spring.flyway.baseline-on-migrate=true
```

## Useful SQL Commands

```sql
-- View all migrations
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Check specific migration
SELECT version, description, checksum, installed_on, success
FROM flyway_schema_history
WHERE version = '3';

-- Remove failed migration (dev only!)
DELETE FROM flyway_schema_history WHERE version = '4' AND success = false;
```

## Additional Resources

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Spring Boot Flyway Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)
