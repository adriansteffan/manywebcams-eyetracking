<?php

function sanitize($content){
    $no_newlines = str_replace(array("\n", "\r"), '', $content);
    return preg_replace('/[^\dA-Za-z_]/i', '', $no_newlines);
}

$rootpath = '/var/www/data/';

$post_data = json_decode(file_get_contents('php://input'), true);
$sanitized_filename = sanitize($post_data['filename']);

$user_dir = $rootpath;

if ($post_data["username"] !== ""){
    $sanitized_username = sanitize($post_data["username"]);
    $user_dir = $rootpath . "encrypted/" . $sanitized_username . "/";
    if(!is_dir($user_dir)){
       if(!mkdir($user_dir, 0755, true)){
           http_response_code(500);
           die();
       };
    }
}

$filetype = $post_data['filetype'];
$sanitized_filetype = '';
if ($filetype === 'json' || $filetype === 'json.enc' || $filetype === 'csv' || $filetype === 'csv.enc' || $filetype === 'webm.enc') {
    $data = $post_data['filedata'];
    $sanitized_filetype = $filetype;
} else if ($filetype === 'webm') {
    $data = base64_decode(explode(',', $post_data['filedata'])[1], true);
    $sanitized_filetype = 'webm';
} else {
    http_response_code(400);
    die();
}


$name = $user_dir . $sanitized_filename . '.' .  $sanitized_filetype;

while (file_exists($name)) {
    $name = $name . '-' . time() . '-' . uniqid();
}

if (!file_put_contents($name, $data)) {
    http_response_code(500);
}
?>