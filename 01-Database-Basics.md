# Database Basics

## Table

The core object that stores data in rows and columns.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);
```

## View

A virtual table based on the result of a query.

```sql
CREATE VIEW active_users AS
SELECT id, name FROM users WHERE active = TRUE;
```

## Schema

A logical namespace for organizing tables, views, functions, etc. It helps group related objects and manage permissions.

```sql
CREATE SCHEMA finance;
CREATE TABLE finance.transactions (...);
```

## Procedure

Executes a sequence of SQL statements; can take input and return output. e.g. a procedure to activate a user account.

```sql
CREATE PROCEDURE activate_user(IN user_id INT)
BEGIN
  UPDATE users
  SET active = TRUE
  WHERE id = user_id;
END;

-- usage:
CALL activate_user(101);
```

## Function

Returns a value (can be used inside a SELECT or WHERE clause), e.g., a function to calculate the age of a user based on their birthdate.

```sql
CREATE FUNCTION calculate_age(birthdate DATE)
RETURNS INT
DETERMINISTIC
BEGIN
  RETURN TIMESTAMPDIFF(YEAR, birthdate, CURDATE());
END;

-- usage:
SELECT name, calculate_age(birthdate) AS age FROM users;
```

## Trigger

Automatically executes in response to certain events on a table (like INSERT, UPDATE, DELETE), e.g., a trigger to log when a user is updated.

```sql
CREATE TRIGGER log_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  INSERT INTO user_audit_log(user_id, changed_at)
  VALUES (OLD.id, NOW());
END;
```
