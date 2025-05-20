<?php


if (isset($_POST)) {
	$data = file_get_contents("php://input");

	$json_obj = json_decode($data, true);

	$response = array(
		"command" => $json_obj["command"],
		"result" => $json_obj["test_data"] . " returned successfully",
	);

	echo $response;
}

?>