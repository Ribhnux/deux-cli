<?php
#!/bin/php

$config_name = $argv[1];
$config_path = $argv[2];

include $config_path;

$json = json_encode( ${ $config_name } );
echo $json;

