<?php
define('ADMINACCESS', true);
include 'admin-tools.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime Gamba - Admin Panel</title>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <header>
    </header>
    <main>
        <div class="container bg-dark">
            <form action="index.php" method="post">
                <label for="search-bar">Search:</label>
                <input type="text" id="search-bar" name="search-bar">
                <button type="submit">Search</button>
            </form>
            <div class="container bg-dark">
                <?php
                    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['search-bar'])) {
                        $searchTerm = $_POST['search-bar'];
                        $stmt = $pdo->prepare("SELECT id, username, waifus FROM users WHERE username ILIKE :search OR waifus::text ILIKE :search");
                        $stmt->execute(['search' => "%$searchTerm%"]);
                        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($results as $user) {
                            echo "<div class='user-result'>";
                            echo "<p>ID: " . htmlspecialchars($user['id']) . "</p>";
                            echo "<p>Username: " . htmlspecialchars($user['username']) . "</p>";
                            //echo "<p>Email: " . htmlspecialchars($user['email']) . "</p>";
                            echo "<p>Waifus: " . htmlspecialchars($user['waifus']) . "</p>";
                            echo "</div><hr>";
                        }
                    }else{
                        echo "<p>No search term entered.</p>";
                    }
                ?>
            </div>
        </div>
    </main>
</body>
</html>