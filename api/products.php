<?php
require 'cors.php';
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch all products
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
}

// POST: Add new product
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $stmt = $pdo->prepare("INSERT INTO products (name, category_name, brand_name, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'], 
        $data['category'], // Frontend sends 'category' but we map to category_name
        $data['brand'],    // Frontend sends 'brand'
        $data['price'], 
        $data['stock'], 
        $data['image'], 
        $data['description']
    ]);
    
    echo json_encode(["message" => "Product added", "id" => $pdo->lastInsertId()]);
}

// PUT: Update product
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $stmt = $pdo->prepare("UPDATE products SET name=?, category_name=?, brand_name=?,SF price=?, stock=?, image=?, description=? WHERE id=?");
    $stmt->execute([
        $data['name'], 
        $data['category'], 
        $data['brand'], 
        $data['price'], 
        $data['stock'], 
        $data['image'], 
        $data['description'],
        $data['id']
    ]);
    
    echo json_encode(["message" => "Product updated"]);
}

// DELETE: Remove product
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Product deleted"]);
    }
}
?>