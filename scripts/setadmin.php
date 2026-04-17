<?php

require_once './db.php';

echo "Enter the user ID to set as admin: ";
$userId = trim(fgets(STDIN));

$stmt = $pdo->prepare("UPDATE users SET admin = TRUE WHERE id = :userId");
$stmt->execute(['userId' => $userId]);