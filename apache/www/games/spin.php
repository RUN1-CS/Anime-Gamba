<?php
/* Spin The Wheel game page
TODO:
- Add the wheel
- Loading pages for more anime waifus per API call (currently one by one)
*/
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
    <title>AnimeGamba - Spin The Wheel</title>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <header class="bg-dark text-white py-3 mb-4">
        <div class="container bg-dark">
            <a href="/" class="btn btn-outline-light"><i class="nf nf-md-keyboard_backspace"></i> Back to Home</a>
        </div>
    </header>
    <main>
        <h1>Under Construction <i class="nf nf-md-crane"></i></h1>
    </main>
</body>
</html>