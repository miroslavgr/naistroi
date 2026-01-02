<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");


// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

$url = $_GET['url'] ?? '';

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['error' => 'Invalid URL']);
    exit;
}

// 1. Fetch HTML content
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
// Pretend to be a real browser to avoid blocks
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$html = curl_exec($ch);
curl_close($ch);

if (!$html) {
    echo json_encode(['error' => 'Could not fetch page']);
    exit;
}

// 2. Parse HTML
$dom = new DOMDocument();
// Suppress warnings for malformed HTML (very common)
libxml_use_internal_errors(true);
@$dom->loadHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html);
libxml_clear_errors();

$xpath = new DOMXPath($dom);

// --- EXTRACTION LOGIC FOR ANGRO.BG ---

// A. TITLE
// Found in <h1 class="heading-title"> or <title>
$name = '';
$h1Nodes = $xpath->query('//h1');
if ($h1Nodes->length > 0) {
    $name = trim($h1Nodes->item(0)->nodeValue);
}

// B. PRICE (BGN)
$priceBGN = 0;
// Strategy 1: Look for the specific price container class in OpenCart
// Usually <ul class="list-unstyled price"> or similar
$priceNodes = $xpath->query('//*[contains(@class, "price-new")]'); // Sale price
if ($priceNodes->length == 0) {
    $priceNodes = $xpath->query('//*[contains(@class, "product-price")]'); // Regular price
}
if ($priceNodes->length == 0) {
    // Fallback: Look for any text containing "лв" inside a price container
    $priceNodes = $xpath->query('//*[contains(@class, "price")]');
}

if ($priceNodes->length > 0) {
    $priceText = $priceNodes->item(0)->nodeValue;
    // Extract numbers like "12.50" or "1 234,50"
    // Remove spaces, convert comma to dot
    $cleanPrice = preg_replace('/[^0-9,.]/', '', $priceText);
    $cleanPrice = str_replace(',', '.', $cleanPrice);
    $priceBGN = floatval($cleanPrice);
}

// C. IMAGE
$image = '';
// 1. Look for the main image with ID "image" or "zoom1"
$imgNodes = $xpath->query('//img[@id="image"] | //a[@id="zoom1"]/@href');
if ($imgNodes->length > 0) {
    $val = $imgNodes->item(0)->getAttribute('src') ?: $imgNodes->item(0)->nodeValue;
    if ($val) $image = $val;
}
// 2. Fallback to OpenGraph
if (!$image) {
    $ogImg = $xpath->query('//meta[@property="og:image"]/@content');
    if ($ogImg->length > 0) $image = $ogImg->item(0)->nodeValue;
}

// D. FULL DESCRIPTION
// The specific file you sent has content in a tab system.
// We target the ID "tab-description" which contains the full text.
$description = '';
$descNodes = $xpath->query('//*[@id="tab-description"]');

if ($descNodes->length > 0) {
    // Get HTML content to preserve line breaks, but strip dangerous tags
    $rawDesc = $dom->saveHTML($descNodes->item(0));
    
    // Clean up: Remove attributes, scripts, styles
    $cleanDesc = strip_tags($rawDesc, '<p><br><ul><li><b><strong><table><tr><td><th>');
    // Remove empty tags or excessive whitespace
    $description = trim(preg_replace('/\s+/', ' ', $cleanDesc));
} else {
    // Fallback: Meta description
    $metaDesc = $xpath->query('//meta[@name="description"]/@content');
    if ($metaDesc->length > 0) $description = $metaDesc->item(0)->nodeValue;
}

// E. CATEGORY (Breadcrumbs)
$category = 'General';
$crumbNodes = $xpath->query('//ul[contains(@class, "breadcrumb")]//a');
if ($crumbNodes->length > 1) {
    // The second to last link is usually the category
    $category = trim($crumbNodes->item($crumbNodes->length - 2)->nodeValue);
}

// F. BRAND
$brand = 'Angro'; // Default
$brandNodes = $xpath->query('//a[contains(@href, "manufacturer")]');
if ($brandNodes->length > 0) {
    $brand = trim($brandNodes->item(0)->nodeValue);
}

// CONVERT CURRENCY
// BGN to EUR (Fixed rate: 1.95583)
$priceEUR = $priceBGN > 0 ? round($priceBGN / 1.95583, 2) : 0;

// BUILD RESULT
$product = [
    'name' => $name,
    'price' => $priceEUR,     // Frontend expects EUR
    'price_bgn' => $priceBGN, // Optional: for reference
    'image' => $image,
    'category' => $category,
    'brand' => $brand,
    'stock' => 100,           // Default assumption
    'description' => $description // This now contains the FULL HTML description
];

echo json_encode([$product]);
?>