1. After setting up MySQL, you need to install the mysql2 package to interact with your MySQL database from the Node.js application.

npm install mysql2

npm install express

npm install cors

2. Database Setup

You need to create a database and tables to store user data and issue reports.
a) Create a MySQL database and tables:

You can create the database and necessary tables using the following SQL commands:

-- Create the database
CREATE DATABASE voice_up;

-- Use the newly created database
USE voice_up;

-- Create a table to store issues
CREATE TABLE issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    anonymous BOOLEAN DEFAULT false,
    crmNumber VARCHAR(100) UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for users (authorities/community members)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'authority') NOT NULL
);


- The issues table stores the details of issues reported by citizens.
- The users table stores login credentials and user roles (citizen/authority).


3. Install Necessary Packages

In the Node.js project, install the following packages:

    bcrypt for password hashing
    jsonwebtoken for generating JSON Web Tokens (JWT) to manage authentication
    express-validator for validating user input

    using the command
    
    npm install bcrypt jsonwebtoken express-validator

