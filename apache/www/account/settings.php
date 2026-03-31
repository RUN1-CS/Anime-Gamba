<?php
/* TODO:
- Implement account settings page (currently just a placeholder)
- Add ability to change username, email, and password
- Add profile customization options (avatar, bio, etc.)
- Add favorites management (favorite waifus, anime, etc.)
- Add QR Code generation for user profiles to easily share with friends
- Add account deletion option with confirmation step
- Encrypt exported data to prevent cheating when exporting user data (currently just a JSON dump)
*/  
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime Gamba - Settings</title>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="/js/settings.js"></script>
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
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-secondary btn-sm" id="logout"><i class="nf nf-cod-sign_out"></i> Log Out</button>
                    <a class="btn btn-outline-light" href="/"><i class="nf nf-md-keyboard_backspace"></i> Back to Home</a>
                </div>
            </div>
        </div>
    </header>
    <main>
        <div class="container mt-5">
            <h1 class="mb-4">Account Settings</h1>
            <ul class="nav nav-tabs mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">Settings</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab">Profile</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="favorites-tab" data-bs-toggle="tab" data-bs-target="#favorites" type="button" role="tab">Favorites</button>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="settings" role="tabpanel">
                    <div class="card">
                        <div class="card-body" id="settings-content">
                            <form>
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="username" name="username" value="yuki">
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" name="email" value="yuki@suou.com">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <button class="btn btn-primary" id="reset-password" type="button">Reset Password</button>
                                </div>
                                <button class="btn btn-success" type="submit">Save Changes</button>
                            </form>
                            <div class="m-3"></div>
                            <button class="btn btn-danger" type="button" id="export">Export Data</button>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="profile" role="tabpanel">
                    <div class="card">
                        <div class="card-body">
                            <form>
                                <div class="mb-3">
                                    <label for="avatar" class="form-label">Avatar (Won't work for a while)</label>
                                    <input type="file" class="form-control" id="avatar" name="avatar">
                                </div>
                                <div class="mb-3">
                                    <label for="bio" class="form-label">Bio (WIP)</label>
                                    <textarea class="form-control" id="bio" name="bio" rows="4">Hello, I'm Yuki!</textarea>
                                </div>
                                <button class="btn btn-success" type="submit">Save Changes</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="favorites" role="tabpanel">
                    <div class="card">
                        <div class="card-body">
                            <p>Favorites to be implemented</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>