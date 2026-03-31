<?php

if(!defined('ADMINACCESS')) {
    die('Unauthorized access');
}

$db = $dotenv['DB_NAME'] ?? getenv('POSTGRES_DB');
$user = $dotenv['DB_USER'] ?? getenv('POSTGRES_USER');
$password = $dotenv['DB_PASSWORD'] ?? getenv('POSTGRES_PASSWORD');
$host = $dotenv['DB_HOST'] ?? getenv('POSTGRES_HOST');
$port = $dotenv['DB_PORT'] ?? getenv('POSTGRES_PORT');

$dsn = "pgsql:host=$host;port=$port;dbname=$db";

try{
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}