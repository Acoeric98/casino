<?php
session_start();
if (!isset($_SESSION["user"])) die("Not logged in");

$userFile = "../users/" . $_SESSION["user"] . ".json";
$data = json_decode(file_get_contents($userFile), true);

$input = json_decode(file_get_contents("php://input"), true);
$delta = intval($input["delta"]);
$data["balance"] += $delta;

file_put_contents($userFile, json_encode($data));
echo $data["balance"];
?>