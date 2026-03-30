<?php
/* Gacha game page
TODO:
- Add gacha animation
- Maybe add more cards per pack (currently 1 card per pack)
*/
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnimeGamba - Gacha</title>
    <script src="/js/gacha.js"></script>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <header class="bg-dark text-white py-3 mb-4">
        <div class="container bg-dark">
            <a href="/" class="btn btn-outline-light"><i class="nf nf-md-keyboard_backspace"></i> Back to Home</a>
        </div>
    </header>
    <main class="container bg-dark py-5 text-white">
        <div class="row mb-5">
            <div class="col-lg-8 mx-auto">
                <h1 class="display-4 mb-4">Gacha Game</h1>
                <p class="lead">Welcome to the Gacha game! Here you can spend your points to get random waifus. Each waifu has a different rarity and point cost. Try your luck and see which waifu you get!</p>
            </div>
        </div>
        <div id="gacha-result" class="d-flex flex-column justify-content-center align-items-center">
            <button id="gacha-button" class="btn btn-primary btn-lg mb-3">Open the Card-pack!</button>
            <span id="gacha-message" class="h5 text-muted">Open the Card-pack!</span>
            <!-- Next Update: Package opening animation -->
            <img src="" alt="Waifu Image" id="waifu-image" class="img-fluid mt-4" style="max-width: 400px;">
        </div>
    </main>
</body>
</html>