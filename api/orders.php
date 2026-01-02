<?php
require 'cors.php';
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch orders
// GET: Fetch orders with their items
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = $stmt->fetchAll();

    // Loop through orders to attach their items
    foreach ($orders as &$order) {
        $stmtItems = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $stmtItems->execute([$order['id']]);
        $order['items'] = $stmtItems->fetchAll();
    }
    
    echo json_encode($orders);
}

// POST: Place Order
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    try {
        $pdo->beginTransaction();

        // 1. Create Order
        $stmt = $pdo->prepare("INSERT INTO orders (customer_name, phone, address, total, status) VALUES (?, ?, ?, ?, 'pending')");
        $stmt->execute([
            $data['customerName'],
            $data['phone'],
            $data['address'],
            $data['total']
        ]);
        $orderId = $pdo->lastInsertId();

        // 2. Add Items & Update Stock
        $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)");
        $stmtStock = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

        foreach ($data['items'] as $item) {
            $stmtItem->execute([
                $orderId,
                $item['id'],
                $item['name'],
                $item['quantity'],
                $item['price']
            ]);
            
            // Deduct stock
            $stmtStock->execute([$item['quantity'], $item['id']]);
        }

        $pdo->commit();
        echo json_encode(["message" => "Order placed", "id" => $orderId]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// PUT: Update Status
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$data['status'], $data['id']]);
    echo json_encode(["message" => "Status updated"]);
}
?>