USE master
USE ACCOUNTS
CREATE DATABASE ACCOUNTS
-- CREATE TABLE Users (
--   ID INT PRIMARY KEY IDENTITY(1,1),
--   Name NVARCHAR(255),
--   Email NVARCHAR(255),
--   Password NVARCHAR(255)
-- );
SELECT * FROM Users;
INSERT INTO Users (Name, Email, Password) VALUES ('John Doe', 'john.doe@example.com', 'mysecretpassword');
DELETE FROM users WHERE ID BETWEEN 1 and 7;