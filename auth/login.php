<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usersDir = "../users/";
    $username = $_POST["username"];
    $password = $_POST["password"];
    $userFile = $usersDir . $username . ".json";

    if (!file_exists($userFile)) {
        die("User not found");
    }

    $data = json_decode(file_get_contents($userFile), true);
    if (!password_verify($password, $data["password"])) {
        die("Wrong password");
    }

    $_SESSION["user"] = $username;
    echo "Logged in";
}
?>