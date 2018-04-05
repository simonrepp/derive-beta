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

  $boosted_results = array();
  $regular_results = array();

  foreach($sections as $section) {

    if(!in_array($section, VALID_SECTIONS)) {
      http_response_code(400);
      echo "{\"error\":\"Invalid section '{$section}' supplied\"}";
      return;
    }

    $json = file_get_contents("./{$section}.json");
    $entries = json_decode($json, true);

    foreach($entries as $entry) {
      if(preg_match("/{$query}/i", $entry['textBoosted'])) {

        if($section == 'articles') {
          $boosted_results[] = (object) [ 'article' => $entry['article'] ];
        } else if($section == 'authors') {
          $boosted_results[] = (object) [ 'author' => $entry['author'] ];
        } else if($section == 'books') {
          $boosted_results[] = (object) [ 'book' => $entry['book'] ];
        } else if($section == 'issues') {
          $boosted_results[] = (object) [ 'issue' => $entry['issue'] ];
        } else if($section == 'programs') {
          $boosted_results[] = (object) [ 'program' => $entry['program'] ];
        }

      } else if(preg_match("/{$query}/i", $entry['textRegular'])) {

        if($section == 'articles') {
          $regular_results[] = (object) [ 'article' => $entry['article'] ];
        } else if($section == 'authors') {
          $regular_results[] = (object) [ 'author' => $entry['author'] ];
        } else if($section == 'books') {
          $regular_results[] = (object) [ 'book' => $entry['book'] ];
        } else if($section == 'issues') {
          $regular_results[] = (object) [ 'issue' => $entry['issue'] ];
        } else if($section == 'programs') {
          $regular_results[] = (object) [ 'program' => $entry['program'] ];
        }

      }
    }
  }

  $results = array_merge($boosted_results, $regular_results);

  echo json_encode($results);

?>
