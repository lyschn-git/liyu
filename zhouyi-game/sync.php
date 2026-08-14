<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');

$DATA_DIR = __DIR__ . '/sync_data/';
if (!is_dir($DATA_DIR)) { @mkdir($DATA_DIR, 0755, true); }

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
$code = isset($_REQUEST['code']) ? strtoupper(trim($_REQUEST['code'])) : '';

// 验证码格式：6位字母数字
if ($code && !preg_match('/^[A-Z0-9]{6}$/', $code)) {
    echo json_encode(['success' => false, 'error' => '无效的同步码格式']);
    exit;
}

$file = $DATA_DIR . $code . '.json';

if ($action === 'save') {
    $data = isset($_REQUEST['data']) ? $_REQUEST['data'] : '';
    if (!$code || !$data) {
        echo json_encode(['success' => false, 'error' => '缺少参数']);
        exit;
    }
    // 解码并验证数据
    $decoded = json_decode($data, true);
    if (!is_array($decoded)) {
        echo json_encode(['success' => false, 'error' => '数据格式错误']);
        exit;
    }
    // 限制数据大小
    $dataStr = json_encode($decoded);
    if (strlen($dataStr) > 10000) {
        echo json_encode(['success' => false, 'error' => '数据过大']);
        exit;
    }
    // 添加时间戳
    $decoded['syncTime'] = date('Y-m-d H:i:s');
    $result = @file_put_contents($file, json_encode($decoded));
    if ($result === false) {
        echo json_encode(['success' => false, 'error' => '保存失败']);
        exit;
    }
    echo json_encode(['success' => true, 'syncTime' => $decoded['syncTime']]);
    exit;
}

if ($action === 'load') {
    if (!$code) {
        echo json_encode(['success' => false, 'error' => '缺少同步码']);
        exit;
    }
    if (!file_exists($file)) {
        echo json_encode(['success' => false, 'error' => '未找到该同步码的记录']);
        exit;
    }
    $content = @file_get_contents($file);
    if ($content === false) {
        echo json_encode(['success' => false, 'error' => '读取失败']);
        exit;
    }
    $data = json_decode($content, true);
    if (!is_array($data)) {
        echo json_encode(['success' => false, 'error' => '数据损坏']);
        exit;
    }
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

echo json_encode(['success' => false, 'error' => '未知操作']);
