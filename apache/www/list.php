<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnimeGamba - Waifu List</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="js/list.js"></script>
</head>
<body>
    <header>
        <a href="/">Back to Home</a>
    </header>
    <main>
        <h1>Your Waifu List</h1>
        <p>Here are all the waifus you've collected so far. Each waifu's score is based on their popularity on AniList, which can give you an idea of how rare they are!</p>
        <div id="waifu-carousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner" id="waifu-list">
                
            </div>
            <button id="back" class="carousel-control-prev" type="button" data-bs-target="#waifu-carousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button id="next" class="carousel-control-next" type="button" data-bs-target="#waifu-carousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
        <h3>Full list (names only)</h3>
        <ul id="waifu-name-list"></ul>
    </main>
</body>
</html>