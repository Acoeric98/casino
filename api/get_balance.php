<?php
session_start();
if (!isset($_SESSION["user"])) die("Not logged in");

$userFile = "../users/" . $_SESSION["user"] . ".json";
$data = json_decode(file_get_contents($userFile), true);
echo $data["balance"];
?>