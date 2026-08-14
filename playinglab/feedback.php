<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => '方法不允许']);
    exit;
}

$nickname = trim($_POST['nickname'] ?? '');
$content  = trim($_POST['content'] ?? '');

if ($nickname === '' || $content === '') {
    echo json_encode(['ok' => false, 'msg' => '昵称和内容都不能为空']);
    exit;
}
if (mb_strlen($content) > 1000) {
    echo json_encode(['ok' => false, 'msg' => '内容太长了，精简一下吧']);
    exit;
}

// 存储到JSON文件
$dataFile = __DIR__ . '/feedback-data.json';
$allData = [];
if (file_exists($dataFile)) {
    $raw = file_get_contents($dataFile);
    $allData = json_decode($raw, true) ?: [];
}

$entry = [
    'nickname' => mb_substr($nickname, 0, 20),
    'content'  => mb_substr($content, 0, 1000),
    'time'     => date('Y-m-d H:i:s'),
    'ip'       => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

$allData[] = $entry;
file_put_contents($dataFile, json_encode($allData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

echo json_encode(['ok' => true, 'msg' => '已收到，感谢你的反馈！']);
