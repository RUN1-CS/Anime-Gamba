<?php
// LeaderBoard: Displays top 10 Users with the highest scores.
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
    <title>Animge Gamba - Leaderboard</title>
    <script src="js/leaderboard.js"></script>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
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
                    <button class="btn btn-secondary btn-sm" id="logout"><i class="nf nf-cod-sign_out"></i> Log Out</button>
                    <a href="/account/settings.php" class="btn btn-secondary btn-sm"><i class="nf nf-fa-user"> Account</i></a>
                    <div class="m-3"></div>
                    <a class="btn btn-outline-light" href="/"><i class="nf nf-md-keyboard_backspace"></i> Back to Home</a>
                </div>
            </div>
        </div>
    </header>
    <div id="leaderboard" class="d-flex flex-column gap-3 align-items-center"></div>
</body>
</html>