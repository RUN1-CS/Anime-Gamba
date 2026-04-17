<?php
// Home page for AnimeGamba
if(!isset($_COOKIE['session'])){
    header("Location: /auth.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime Gamba - Home</title>
    <script src="js/index.js"></script>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-white">
    <header class="bg-gradient border-bottom border-secondary py-4 mb-5">
        <div class="container bg-dark">
            <div class="row mb-3">
                <div class="col-md-8">
                    <div class="d-flex gap-5">
                        <div>
                            <small><i class="nf nf-fa-user"></i> Username</small>
                            <p class="mb-0 h5"><span id="username">Guest</span></p>
                        </div>
                        <div>
                            <small><i class="nf nf-fa-star"></i> Score</small>
                            <p class="mb-0 h5"><span id="score">0</span></p>
                        </div>
                        <div>
                            <small><i class="nf nf-fa-heart"></i> Waifus</small>
                            <p class="mb-0 h5"><span id="waifus">0</span></p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <script>
                        if(cookieStore.get("session") && cookieStore.get("userId")){
                            document.write('<button class="btn btn-secondary btn-sm" id="logout"><i class="nf nf-cod-sign_out"></i> Log Out</button>');
                            document.write('<a href="/account/settings.php" class="btn btn-secondary btn-sm"><i class="nf nf-fa-user"> Account</i></a>');
                        }
                    </script>
                </div>
            </div>
        </div>
    </header>
    <main class="container bg-dark py-5">
        <div class="text-center mb-5">
            <h1 class="display-4 fw-bold mb-4 text-light">Welcome to Anime Gamba!</h1>
            <p class="lead text-secondary mb-4">Your one-stop destination for all things anime. Explore our vast collection of anime series, movies, and manga. Join our community to share your love for anime and connect with fellow fans.</p>
            <script>
                if(!cookieStore.get("session") || !cookieStore.get("userId")){
                    document.write('<a href="auth.php" class="btn btn-success btn-lg"><i class="nf nf-cod-sign_in"></i> Login or Sign Up</a>');
                }else{
                    document.write('<a href="account/list.php" class="btn btn-primary btn-lg"><i class="nf nf-cod-sign_in"></i> See your list</a>');
                    document.write('<a href="account/friends.php" class="btn btn-secondary btn-lg ms-3"><i class="nf nf-fa-users"></i> See your friends</a>');
                }
            </script>
        </div>
        <div class="mt-5">
            <h3 class="mb-4 text-center fw-bold">Choose your game</h3>
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100 shadow-lg bg-dark text-white border-0 hover-lift">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title mb-0 fw-bold"><i class="nf nf-fa-gem"></i> Gacha</h5>
                                <small class="badge bg-warning text-dark"><i class="nf nf-fa-star"></i>Recommended<i class="nf nf-fa-star"></i></small>
                            </div>
                            <a href="games/gacha.php" class="btn btn-secondary btn-sm"><i class="nf nf-fa-play"></i> Play</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100 shadow-lg bg-dark text-white border-0 hover-lift">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0 fw-bold"><i class="nf nf-weather-stars"></i> Coming Soon!</h5>
                            <a href="games/spin.php" class="btn btn-secondary btn-sm"><i class="nf nf-fa-play"></i> Play</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>