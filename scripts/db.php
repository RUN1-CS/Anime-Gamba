<?php
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