<?php
$post_data = json_decode(file_get_contents('php://input'), true);
$sanitized_filename = preg_replace('/[^\da-z_]/i', '', $post_data['filename']);

$filetype = $post_data['filetype'];
$sanitized_filetype = '';
if ($filetype === 'json') {
    $sanitized_filetype = 'json';
} else if ($filetype === 'webm') {
    $sanitized_filetype = 'webm';
} else {
    die();
}

$name = '/output/' . $sanitized_filename . '.' .  $sanitized_filetype;
$data = $post_data['filedata'];
file_put_contents($name, $data);
?>