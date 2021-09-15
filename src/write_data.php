<?php

$post_data = json_decode(file_get_contents('php://input'), true);
$filename_no_newlines = str_replace(array("\n", "\r"), '', $post_data['filename']);
$sanitized_filename = preg_replace('/[^\da-z_]/i', '', $filename_no_newlines);

$filetype = $post_data['filetype'];
$sanitized_filetype = '';
if ($filetype === 'json' || $filetype === 'csv') {
    $data = $post_data['filedata'];
    $sanitized_filetype = $filetype;
} else if ($filetype === 'webm') {
    $data = base64_decode(explode(',', $post_data['filedata'])[1], true);
    $sanitized_filetype = 'webm';
} else {
    http_response_code(400);
    die();
}


$name = '/var/www/data/' . $sanitized_filename . '.' .  $sanitized_filetype;

while (file_exists($name)) {
    $name = $name . '-' . time() . '-' . uniqid();
}

if (!file_put_contents($name, $data)) {
    http_response_code(500);
}
?>