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
    <nav class="navbar navbar-dark bg-dark mb-4">
        <div class="container-fluid bg-dark text-white">
            <span class="navbar-brand mb-0 h1">AnimeGamba</span>
            <a class="btn btn-outline-light" href="/">← Back to Home</a>
        </div>
    </nav>
    <main class="container bg-dark py-5 text-white">
        <div class="row mb-5">
            <div class="col-lg-8 mx-auto">
                <h1 class="display-4 mb-3">Your Waifu List</h1>
                <p class="lead text-muted">Here are all the waifus you've collected so far. Each waifu's score is based on their popularity on AniList, which can give you an idea of how rare they are!</p>
            </div>
        </div>
        <div class="row mb-5">
            <div class="col-lg-10 mx-auto">
                <div id="waifu-carousel" class="carousel slide shadow-lg rounded" data-bs-ride="carousel">
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
            </div>
        </div>
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <h3 class="mb-3 border-bottom pb-2">Full list (names only)</h3>
                <ul id="waifu-name-list" class="list-group" style="max-height: 400px; overflow-y: auto;"></ul>
            </div>
        </div>
    </main>
</body>
</html>