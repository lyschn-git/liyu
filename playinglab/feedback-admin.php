<?php
session_start();

// 密码设置
$PASSWORD = 'yisan2026';

// 登录处理
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['password'] === $PASSWORD) {
        $_SESSION['admin'] = true;
    } else {
        $error = '密码错误';
    }
}

// 退出
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: feedback-admin.php');
    exit;
}

// 未登录显示登录页
if (empty($_SESSION['admin'])) {
    ?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>留言管理 · 玩意儿Lab</title>
<style>
body{background:#FAF9F6;font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;}
.box{background:#fff;padding:40px;border-radius:16px;box-shadow:0 2px 20px rgba(0,0,0,0.06);width:320px;text-align:center;}
h1{font-size:18px;color:#1A1A2E;margin:0 0 24px;}
input{width:100%;padding:12px 16px;border:1px solid #ECEAE4;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:16px;outline:none;}
input:focus{border-color:#FF6B35;}
button{width:100%;padding:12px;background:#FF6B35;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer;}
.error{color:#FF6B35;font-size:13px;margin-bottom:12px;}
</style>
</head>
<body>
<div class="box">
<h1>玩意儿Lab 留言管理</h1>
<?php if(!empty($error)) echo '<p class="error">'.$error.'</p>'; ?>
<form method="POST">
<input type="password" name="password" placeholder="输入管理密码" autofocus>
<input type="hidden" name="login" value="1">
<button type="submit">进入</button>
</form>
</div>
</body>
</html>
    <?php
    exit;
}

// 已登录，显示留言列表
$dataFile = __DIR__ . '/feedback-data.json';
$allData = [];
if (file_exists($dataFile)) {
    $raw = file_get_contents($dataFile);
    $allData = json_decode($raw, true) ?: [];
}
// 倒序（最新在上）
$allData = array_reverse($allData);
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>留言管理 · 玩意儿Lab</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
body{background:#FAF9F6;font-family:'Noto Sans SC',sans-serif;color:#1A1A2E;margin:0;padding:20px;}
.wrap{max-width:680px;margin:0 auto;}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #ECEAE4;}
.header h1{font-size:18px;margin:0;}
.header a{font-size:13px;color:#9A9AAE;text-decoration:none;}
.count{font-size:13px;color:#9A9AAE;margin-bottom:20px;}
.card{background:#fff;border:1px solid #ECEAE4;border-radius:14px;padding:24px;margin-bottom:16px;}
.card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.card-name{font-weight:600;font-size:15px;color:#FF6B35;}
.card-time{font-size:12px;color:#9A9AAE;}
.card-body{font-size:14px;line-height:1.8;color:#1A1A2E;white-space:pre-wrap;}
.card-ip{font-size:11px;color:#ccc;margin-top:8px;}
.empty{text-align:center;padding:60px 20px;color:#9A9AAE;font-size:14px;}
</style>
</head>
<body>
<div class="wrap">
<div class="header">
<h1>留言管理</h1>
<a href="?logout=1">退出</a>
</div>
<div class="count">共 <?php echo count($allData); ?> 条留言</div>
<?php if(empty($allData)): ?>
<div class="empty">还没有留言</div>
<?php else: foreach($allData as $item): ?>
<div class="card">
<div class="card-head">
<span class="card-name"><?php echo htmlspecialchars($item['nickname']); ?></span>
<span class="card-time"><?php echo $item['time']; ?></span>
</div>
<div class="card-body"><?php echo htmlspecialchars($item['content']); ?></div>
<div class="card-ip">IP: <?php echo htmlspecialchars($item['ip']); ?></div>
</div>
<?php endforeach; endif; ?>
</div>
</body>
</html>
