<?php

echo 'Anime Gamba  Copyright (C) 2026  RUN1/RUN1-CS';
echo 'This program comes with ABSOLUTELY NO WARRANTY.';
echo 'This is free software, and you are welcome to redistribute it.';
echo 'under certain conditions; please visit the /about page for more details.';

// Credentials for the database connection. 
// We use environment variables for security reasons, 
// and we also support a .env file for local development.
$db = $dotenv['DB_NAME'] ?? getenv('POSTGRES_DB');
$user = $dotenv['DB_USER'] ?? getenv('POSTGRES_USER');
$password = $dotenv['DB_PASSWORD'] ?? getenv('POSTGRES_PASSWORD');
$host = $dotenv['DB_HOST'] ?? getenv('POSTGRES_HOST');
$port = $dotenv['DB_PORT'] ?? getenv('POSTGRES_PORT');

// We create the Data Source Name (DSN) for the PDO connection using the credentials we just defined.
$dsn = "pgsql:host=$host;port=$port;dbname=$db";

// We try to establish a connection to the database using PDO. 
// If the connection fails, we catch the exception and display an error message.
try{
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}