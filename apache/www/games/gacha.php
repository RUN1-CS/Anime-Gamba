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
    <header>
        <a href="/">Back to Home</a>
    </header>
    <main>
        <h1>Gacha Game</h1>
        <p>Welcome to the Gacha game! Here you can spend your points to get random waifus. Each waifu has a different rarity and point cost. Try your luck and see which waifu you get!</p>
        <div id="gacha-result" class="d-flex flex-column justify-content-center">
        <button id="gacha-button">Open the Card-pack!</button>
        <span id="gacha-message">Open the Card-pack!</span>
            <!-- Next Update: Package opening animation -->
            <img src="" alt="Waifu Image" id="waifu-image">
        </div>
    </main>
</body>
</html>