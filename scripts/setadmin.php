<?php
// Aaaa scripts

// This script is used to set a user as an admin. It takes the user ID as input and updates the database accordingly.
require_once './db.php';

// We ask the user to enter the ID of the user they want to set as admin.
echo "Enter the user ID to set as admin: ";
$userId = trim(fgets(STDIN));

// We prepare and execute the SQL statement to update the user's admin status in the database.
$stmt = $pdo->prepare("UPDATE users SET admin = TRUE WHERE id = :userId");
$stmt->execute(['userId' => $userId]);