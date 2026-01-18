<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usersDir = realpath(__DIR__ . '/../users/') . '/';
    $username = $_POST["username"];
    $password = $_POST["password"];

    if (!preg_match("/^[a-zA-Z0-9_]+$/", $username)) {
        die("Invalid username");
    }

    $userFile = $usersDir . $username . ".json";
    if (file_exists($userFile)) {
        die("User already exists");
    }

    $data = [
        "username" => $username,
        "password" => password_hash($password, PASSWORD_DEFAULT),
        "balance" => 500
    ];

    if (!file_put_contents($userFile, json_encode($data))) {
        die("Nem sikerült létrehozni a fájlt.");
    }

    session_start();
    $_SESSION["user"] = $username;
    echo "Registered and logged in";
}
?>
