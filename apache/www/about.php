<?php

/**
 * About page for Anime Gamba.
 * Just a simple page that explains what the website is about and who made it.
 * Also License stuff.
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Anime Gamba</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <header class="bg-gradient border-bottom border-secondary py-4 mb-5">
        <div class="container bg-dark">
            <div class="row mb-3 text-end"></div>
                <a class="btn btn-outline-light" href="/"><i class="nf nf-md-keyboard_backspace"></i> Back to Home</a>
            </div>
        </div>
    </header>
    <main>
        <section class="container py-5 bg-dark" id="about">
            <h1 class="display-4 fw-bold mb-4 text-light"><i class="nf nf-cod-sign_out"></i> About Anime Gamba</h1>
            <p class="lead text-light mb-4">
                Anime Gamba is a joke project that has been made just for fun.
                It includes gambling mechanics like gacha that lets users collect (female) anime characters and compete with each other.
                The project was made in 2026 by RUN1, a student in the IT field.
            </p>
        </section>
        <section class="container py-5 bg-dark" id="author">
            <h2 class="display-5 fw-bold mb-4 text-light"><i class="nf nf-oct-person"></i> Author</h2>
            <p class="lead text-light mb-4">
                Anime Gamba was created by RUN1, also known as RUN1-CS or Mysterio, a student in the IT field. 
                He's a student who totally no joke works hard on his projects and is always looking for ways to improve his skills.
            </p>
        </section>
        <section class="container py-5 bg-dark" id="license">
            <h2 class="display-5 fw-bold mb-4 text-light"><i class="nf nf-fa-clipboard_list"></i> License</h2>
            <p class="lead text-light mb-4">
                Anime Gamba is licensed under the GNU General Public License v3.0. This means that you are free to use, modify, and distribute this software as long as you comply with the terms of the license. For more information, please see the <a href="https://www.gnu.org/licenses/" class="text-light">LICENSE</a> file.</p>
        </section>
        <section class="container py-5 bg-dark" id="distributon">
            <h2 class="display-5 fw-bold mb-4 text-light"><i class="nf nf-md-recycle"></i> Distribution</h2>
            <p class="lead text-light mb-4">
                You can distribute this software as long as you comply with the terms of the GNU General Public License v3.0. This means that you must include the LICENSE file and give credit to the original author (RUN1) when distributing the software. You can also modify the software and distribute your modified version, but you must also include the LICENSE file and give credit to the original author.
            </p>
        </section>
    </main>
</body>
</html>