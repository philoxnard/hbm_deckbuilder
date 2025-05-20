<?php


if (isset($_POST)) {
        $data = json_decode(file_get_contents("php://input"), true);

        $json_obj = $data["data"];
        $test = $json_obj["command"];
        $response = array(
                "command" => $test,
                "result" => $json_obj["test_data"] . " returned successfully",
        );

        echo json_encode($response);
}

?>
