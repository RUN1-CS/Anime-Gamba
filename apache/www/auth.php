<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime Gamba - Auth</title>
    <script src="js/auth.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Anime Gamba</h1>
        <a href="/">Back</a>
    </header>
    <main>
        <form id="login" method="POST">
            <input type="hidden" name="login" id="login" value="1">
            <table>
                <tr>
                    <td><label for="username">Username:</label></td>
                    <td><input type="text" id="username" name="username"></td>
                </tr>
                <tr>
                    <td><label for="password">Password:</label></td>
                    <td><input type="password" id="password" name="password"></td>
                </tr>
                <tr>
                    <td colspan="2"><button type="submit">Login</button></td>
                </tr>
            </table>
        </form>
        <br>
        <form id="register" method="POST">
            <input type="hidden" name="register" id="register" value="1">
            <table>
                <tr>
                    <td><label for="username">Username:</label></td>
                    <td><input type="text" id="username" name="username"></td>
                </tr>
                <tr>
                    <td><label for="password">Password:</label></td>
                    <td><input type="password" id="password" name="password"></td>
                </tr>
                <tr>
                    <td><label for="rep_password">Repeat Password:</label></td>
                    <td><input type="password" id="rep_password" name="rep_password"></td>
                </tr>
                <tr>
                    <td colspan="2"><button type="submit">Register</button></td>
                </tr>
            </table>
        </form>
        <button id="logout">Log Out</button>
    </main>
</body>
</html>