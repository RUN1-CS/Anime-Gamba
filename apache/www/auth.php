<?php
// Authentication page for AnimeGamba
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime Gamba - Auth</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="js/auth.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar navbar-dark bg-dark">
        <div class="container-fluid bg-dark">
            <span class="navbar-brand mb-0 h1">Anime Gamba</span>
            <a href="/" class="btn btn-outline-light"><i class="nf nf-md-keyboard_backspace"></i> Back</a>
        </div>
    </nav>
    <main class="my-5">
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="card bg-dark mb-4 text-white">
                    <div class="card-header bg-primary">
                        <h5 class="mb-0">Login</h5>
                    </div>
                    <div class="card-body">
                        <form id="login" method="POST">
                            <input type="hidden" name="login" id="login" value="1">
                            <div class="mb-3">
                                <label for="username" class="form-label"><i class="nf nf-fa-user"></i> Username:</label>
                                <input type="text" class="form-control" id="username" name="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label"><i class="nf nf-fa-lock"></i> Password:</label>
                                <input type="password" class="form-control" id="password" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                        </form>
                    </div>
                </div>
                <div class="card bg-dark text-white">
                    <div class="card-header bg-success">
                        <h5 class="mb-0">Register</h5>
                    </div>
                    <div class="card-body">
                        <form id="register" method="POST">
                            <input type="hidden" name="register" id="register" value="1">
                            <div class="mb-3">
                                <label for="username" class="form-label"><i class="nf nf-fa-user"></i> Username:</label>
                                <input type="text" class="form-control" id="username" name="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label"><i class="nf nf-fa-lock"></i> Password:</label>
                                <input type="password" class="form-control" id="password" name="password" required>
                            </div>
                            <div class="mb-3">
                                <label for="rep_password" class="form-label"><i class="nf nf-fa-lock"></i> Repeat Password:</label>
                                <input type="password" class="form-control" id="rep_password" name="rep_password" required>
                            </div>
                            <button type="submit" class="btn btn-success w-100">Register</button>
                        </form>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <button id="logout" class="btn btn-danger"><i class="nf nf-cod-sign_out"></i> Log Out</button>
                </div>
            </div>
        </div>
    </main>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>