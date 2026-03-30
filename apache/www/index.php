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
                            <small>Username</small>
                            <p class="mb-0 h5"><span id="username">Guest</span></p>
                        </div>
                        <div>
                            <small>Score</small>
                            <p class="mb-0 h5"><span id="score">0</span></p>
                        </div>
                        <div>
                            <small>Waifus</small>
                            <p class="mb-0 h5"><span id="waifus">0</span></p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-secondary btn-sm" id="logout">Log Out</button>
                </div>
            </div>
        </div>
    </header>
    <main class="container bg-dark py-5">
        <div class="text-center mb-5">
            <h1 class="display-4 fw-bold mb-4 text-light">Welcome to Anime Gamba!</h1>
            <p class="lead text-secondary mb-4">Your one-stop destination for all things anime. Explore our vast collection of anime series, movies, and manga. Join our community to share your love for anime and connect with fellow fans.</p>
            <script>
                if(!sessionStorage.getItem("sessionId")){
                    document.write('<a href="auth.php" class="btn btn-success btn-lg">Login or Sign Up</a>');
                }else{
                    document.write('<a href="list.php" class="btn btn-primary btn-lg">See your list</a>');
                }
            </script>
        </div>
        <div class="mt-5">
            <h3 class="mb-4 text-center fw-bold">Choose your game</h3>
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100 shadow-lg bg-dark text-white border-0 hover-lift">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0 fw-bold">🎡 Spin The Wheel</h5>
                            <a href="games/spin-the-wheel.php" class="btn btn-secondary btn-sm">Play</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100 shadow-lg bg-dark text-white border-0 hover-lift">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title mb-0 fw-bold">✨ Gacha</h5>
                                <small class="badge bg-warning text-dark">Recommended</small>
                            </div>
                            <a href="games/gacha.php" class="btn btn-secondary btn-sm">Play</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>