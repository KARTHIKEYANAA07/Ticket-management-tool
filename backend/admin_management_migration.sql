-- DairyCare 360 Admin Management migration
-- Run this once in MySQL Workbench if the users table lacks is_active.
USE ticket_tracker;

ALTER TABLE users
    ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role;

-- Optional: grant admin access to an existing account. Replace the email if needed.
-- UPDATE users SET role = 'admin' WHERE email = 'karthi@gmail.com';

SELECT id, name, email, role, is_active, created_at
FROM users
ORDER BY id;
