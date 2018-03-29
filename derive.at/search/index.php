<?php
  define('VALID_SECTIONS', array('articles', 'authors', 'books', 'issues', 'programs'));

  header('Content-Type: application/json');

  if(!isset($_GET['query'])) {
    http_response_code(400);
    echo '{"error":"No query parameter supplied"}';
    return;
  } 

  if(!isset($_GET['sections'])) {
    http_response_code(400);
    echo '{"error":"No sections parameter supplied"}';
    return;
  }

  $query = $_GET['query'];
  $sections = explode(',', $_GET['sections']);

  $results = [];

  foreach($sections as $section) {

    if(!in_array($section, VALID_SECTIONS)) {
      http_response_code(400);
      echo "{\"error\":\"Invalid section '{$section}' supplied\"}";
      return;
    }

    $json = file_get_contents("./{$section}.json");
    $entries = json_decode($json, true);

    $boosted_matches = array();
    $regular_matches = array();

    foreach($entries as $entry) {
      if(preg_match("/{$query}/i", $entry['textBoosted'])) {
        $boosted_matches[] = (object) [
          'title' => $entry['title'],
          'route' => $entry['route']
        ];
      } else if(preg_match("/{$query}/i", $entry['textRegular'])) {
        $regular_matches[] = (object) [
          'title' => $entry['title'],
          'route' => $entry['route']
        ];
      }
    }

    $results[$section] = array_merge($boosted_matches, $regular_matches);
  }

  echo json_encode($results);

?>