<?php
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

if (empty($_COOKIE['session'])) {
    http_response_code(403);
    echo "Unauthorized";
    exit();
}

$stmt = $pdo->prepare(
    "SELECT u.admin, s.token
     FROM sessions s
     JOIN users u ON u.id = s.user_id"
);
$stmt->execute();

$adminValue = false;
while ($session = $stmt->fetch(PDO::FETCH_ASSOC)) {
    if (password_verify($_COOKIE['session'], $session['token'])) {
        $adminValue = is_bool($session['admin'])
            ? $session['admin']
            : in_array(strtolower((string) $session['admin']), ['1', 't', 'true'], true);
        break;
    }
}

if (!$adminValue) {
    http_response_code(403);
    echo "Unauthorized";
    exit();
}

define('ADMINACCESS', true);