// ===== 义山创作工作台 =====
const PASSWORD = 'yisan2026';
let DATA = null;
const today = new Date().toISOString().slice(0,10);

// ===== Auth =====
function checkAuth() {
  if (localStorage.getItem('workbench_auth') === 'yes') return true;
  showAuth();
  return false;
}

function showAuth() {
  const overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 30px';
  overlay.innerHTML = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:28px;font-weight:700;color:var(--text);margin-bottom:4px">义山</div>
      <div style="font-size:13px;color:var(--gold-dark);letter-spacing:2px">创作工作台</div>
      <div style="width:32px;height:3px;background:var(--gold);border-radius:2px;margin:12px auto 0"></div>
    </div>
    <input id="authInput" type="password" placeholder="输入口令" style="width:100%;max-width:280px;padding:12px 16px;border:1.5px solid var(--border);border-radius:12px;font-size:15px;background:#fff;color:var(--text);outline:none;text-align:center;letter-spacing:2px" />
    <button id="authBtn" style="margin-top:12px;width:100%;max-width:280px;padding:12px;background:var(--gold);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600">进入</button>
    <p style="margin-top:16px;font-size:11px;color:var(--text-light)">仅限义山本人使用</p>
  `;
  document.body.appendChild(overlay);
  
  const input = overlay.querySelector('#authInput');
  const btn = overlay.querySelector('#authBtn');
  
  const tryAuth = () => {
    if (input.value === PASSWORD) {
      localStorage.setItem('workbench_auth', 'yes');
      overlay.remove();
      init();
    } else {
      input.value = '';
      input.placeholder = '口令错误，重试';
      input.style.borderColor = 'var(--red)';
      setTimeout(() => { input.placeholder = '输入口令'; input.style.borderColor = 'var(--border)'; }, 2000);
    }
  };
  
  btn.addEventListener('click', tryAuth);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') tryAuth(); });
  input.focus();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) init();
});

async function init() {
  try {
    const resp = await fetch('data.json?t=' + Date.now());
    DATA = await resp.json();
  } catch(e) {
    document.getElementById('updateTime').textContent = '数据加载失败';
    return;
  }
  renderDate();
  renderAll();
  bindNav();
  bindMenu();
}

// ===== Date =====
function renderDate() {
  const now = new Date();
  const days = ['日','一','二','三','四','五','六'];
  const dateStr = `${now.getMonth()+1}月${now.getDate()}日 周${days[now.getDay()]}`;
  document.getElementById('topDate').textContent = dateStr;
  document.getElementById('footerDate').textContent = DATA.lastUpdated;
  const ut = document.getElementById('updateTime');
  if (ut) ut.textContent = '数据最后更新：' + DATA.lastUpdated;
}

// ===== Navigation =====
function bindNav() {
  const items = document.querySelectorAll('.nav-item');
  const titles = { 'overview':'今日概览','products':'产品总览','tasks':'任务看板','auto':'定时任务','content':'内容线','links':'快捷入口','memo':'备忘录','inspiration':'灵感库','archive':'档案室' };
  items.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('pageTitle').textContent = titles[page] || '今日概览';
      document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById('page-' + page);
      if (target) target.classList.remove('hidden');
      closeSidebar();
    });
  });
}

function bindMenu() {
  document.getElementById('menuBtn').addEventListener('click', openSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);
}
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

// ===== Daily Plan State (localStorage) =====
function getPlanState() {
  const key = 'plan_' + today;
  return JSON.parse(localStorage.getItem(key) || '{}');
}
function savePlanState(state) {
  localStorage.setItem('plan_' + today, JSON.stringify(state));
}
function getCustomTasks() {
  const key = 'custom_tasks_' + today;
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveCustomTasks(tasks) {
  localStorage.setItem('custom_tasks_' + today, JSON.stringify(tasks));
}

// ===== Render All =====
function renderAll() {
  renderOverview();
  renderProducts();
  renderTasks();
  renderAuto();
  renderContent();
  renderLinks();
  renderMemo();
  renderInspirations();
  renderArchives();
  renderMemoir();
}

// ===== Overview =====
function renderOverview() {
  const onlineProducts = DATA.products.filter(p => p.status === 'online').length;
  const allTasks = DATA.tasks.inProgress.length + DATA.tasks.todo.length;
  const waitingCount = DATA.tasks.waiting.length;
  const autoOk = DATA.automatedTasks.filter(t => t.status === 'ok').length;

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card" onclick="navTo('products')" style="cursor:pointer"><div class="stat-num">${onlineProducts}</div><div class="stat-label">在线产品</div></div>
    <div class="stat-card" onclick="navTo('tasks')" style="cursor:pointer"><div class="stat-num">${allTasks}</div><div class="stat-label">待办任务</div></div>
    <div class="stat-card" onclick="navTo('tasks')" style="cursor:pointer"><div class="stat-num">${waitingCount}</div><div class="stat-label">待拍板</div></div>
    <div class="stat-card" onclick="navTo('auto')" style="cursor:pointer"><div class="stat-num">${autoOk}/${DATA.automatedTasks.length}</div><div class="stat-label">定时正常</div></div>
  `;

  // Daily Plan with checkboxes
  renderDailyPlan();

  // Tasks overview (inProgress + todo)
  const renderTaskItem = (t) => `
    <div class="task-board-item">
      <div class="priority-dot ${t.priority}"></div>
      <div class="task-board-content">
        <div class="task-board-title">${t.title}</div>
        <div class="task-board-detail">${t.detail}</div>
      </div>
    </div>
  `;
  document.getElementById('overviewTasks').innerHTML =
    DATA.tasks.inProgress.map(renderTaskItem).join('') +
    DATA.tasks.todo.map(renderTaskItem).join('');

  // Agent tasks (一三在做什么)
  if (DATA.tasks.agentTasks) {
    document.getElementById('overviewAgentTasks').innerHTML =
      DATA.tasks.agentTasks.map(renderTaskItem).join('') || '<div class="empty">暂无</div>';
  }

  // Products (first 5)
  document.getElementById('overviewProducts').innerHTML = DATA.products.slice(0,5).map(p => `
    <div class="product-card" onclick="window.open('${p.url}','_blank')">
      <div class="product-icon">${p.icon||'◆'}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta"><span class="product-ver">${p.ver}</span><span>${p.lastUpdate}</span><span>${p.note}</span></div>
      </div>
      <span class="badge ${p.status==='online'?'badge-online':'badge-shelved'}">${p.status==='online'?'在线':'搁置'}</span>
      <span class="product-arrow">›</span>
    </div>
  `).join('');

  // Waiting (expandable)
  document.getElementById('overviewWaiting').innerHTML = DATA.tasks.waiting.map(t => renderWaitingItem(t, true)).join('');

  // Auto tasks overview
  document.getElementById('overviewAuto').innerHTML = DATA.automatedTasks.map(t => `
    <div class="auto-row">
      <div class="auto-icon">${t.icon||'⚙'}</div>
      <div class="auto-info">
        <div class="auto-name">${t.name}</div>
        <div class="auto-meta">${t.schedule} · 上次：${t.lastRun}</div>
      </div>
      <span class="badge ${t.status==='ok'?'badge-ok':'badge-error'}">${t.status==='ok'?'正常':'异常'}</span>
    </div>
  `).join('');
}

function navTo(page) {
  const item = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (item) item.click();
}

// ===== Daily Plan (checkable) =====
function renderDailyPlan() {
  const state = getPlanState();
  const customTasks = getCustomTasks();
  const allTasks = [...DATA.dailyPlan, ...customTasks];
  const doneCount = allTasks.filter(t => state[t.id]).length;
  const total = allTasks.length;
  const pct = total > 0 ? Math.round(doneCount/total*100) : 0;

  document.getElementById('planCount').textContent = `${doneCount}/${total}`;
  
  let html = `
    <div class="plan-header">
      <h3>今日完成</h3>
      <p>把每天的日常与创作任务放一起，完成一项打勾。</p>
    </div>
    <div class="plan-progress">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="progress-text">${pct}%</span>
    </div>
  `;

  // Must-do tasks
  const mustTasks = allTasks.filter(t => t.tag === 'must');
  const createTasks = allTasks.filter(t => t.tag !== 'must');
  
  if (mustTasks.length) {
    html += mustTasks.map(t => renderTaskRow(t, state)).join('');
  }
  if (createTasks.length) {
    html += createTasks.map(t => renderTaskRow(t, state)).join('');
  }

  // Add task input
  html += `
    <div style="padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:8px">
      <input id="newTaskInput" type="text" placeholder="添加新任务..." style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--bg);color:var(--text);outline:none" />
      <button id="addTaskBtn" style="padding:8px 14px;background:var(--gold);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;white-space:nowrap">+ 添加</button>
    </div>
  `;

  document.getElementById('dailyPlan').innerHTML = html;

  // Bind checkboxes
  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const s = getPlanState();
      if (s[id]) delete s[id]; else s[id] = true;
      savePlanState(s);
      renderDailyPlan();
    });
  });

  // Bind add task
  const input = document.getElementById('newTaskInput');
  const addBtn = document.getElementById('addTaskBtn');
  const addTask = () => {
    const val = input.value.trim();
    if (!val) return;
    const tasks = getCustomTasks();
    tasks.push({ id: 'c' + Date.now(), label: val, tag: 'create', detail: '自定义任务' });
    saveCustomTasks(tasks);
    input.value = '';
    renderDailyPlan();
  };
  addBtn.addEventListener('click', addTask);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });
}

function renderTaskRow(task, state) {
  const done = state[task.id];
  const tagLabel = task.tag === 'must' ? '每日必做' : '创作任务';
  const tagClass = task.tag === 'must' ? 'must' : 'create';
  return `
    <div class="task-row">
      <div class="task-check ${done?'done':''}" data-id="${task.id}"></div>
      <div class="task-body">
        <div class="task-label ${done?'done':''}">${task.label}</div>
        <div class="task-sub">${task.detail}</div>
        <span class="task-tag ${tagClass}">${tagLabel}</span>
      </div>
    </div>
  `;
}

// ===== Products Page =====
function renderProducts() {
  document.getElementById('productsList').innerHTML = DATA.products.map(p => `
    <div class="product-card" onclick="window.open('${p.url}','_blank')">
      <div class="product-icon">${p.icon||'◆'}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta"><span class="product-ver">${p.ver}</span><span>更新：${p.lastUpdate}</span><span>${p.note}</span></div>
      </div>
      <span class="badge ${p.status==='online'?'badge-online':'badge-shelved'}">${p.status==='online'?'在线':'搁置'}</span>
      <span class="product-arrow">›</span>
    </div>
  `).join('');
}

// ===== Tasks Page =====
function renderTasks() {
  const render = (items) => items.map(t => `
    <div class="task-board-item">
      <div class="priority-dot ${t.priority}"></div>
      <div class="task-board-content">
        <div class="task-board-title">${t.title}</div>
        <div class="task-board-detail">${t.detail}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('tasksProgress').innerHTML = render(DATA.tasks.inProgress) || '<div class="empty">暂无</div>';
  document.getElementById('tasksTodo').innerHTML = render(DATA.tasks.todo) || '<div class="empty">暂无</div>';
  document.getElementById('tasksWaiting').innerHTML = DATA.tasks.waiting.map(t => renderWaitingItem(t, false)).join('') || '<div class="empty">暂无</div>';
}

// ===== Waiting Item (expandable) =====
function renderWaitingItem(t, inCard) {
  const hasExpand = !!t.expand;
  const dotColor = t.priority==='high'?'var(--red)':t.priority==='normal'?'#5A7A8E':'var(--text-light)';
  const wrapper = inCard 
    ? `class="task-row" style="border-top:1px solid var(--border);${hasExpand?'cursor:pointer':''}"`
    : `class="task-board-item" style="${hasExpand?'cursor:pointer':''}"`;
  const bodyClass = inCard ? 'task-body' : 'task-board-content';
  const labelClass = inCard ? 'task-label' : 'task-board-title';
  const subClass = inCard ? 'task-sub' : 'task-board-detail';
  
  return `
    <div ${wrapper} ${hasExpand ? 'onclick="toggleExpand(this)"' : ''}>
      <div style="width:7px;height:7px;border-radius:50%;background:${dotColor};margin-top:6px;flex-shrink:0"></div>
      <div class="${bodyClass}">
        <div class="${labelClass}">${t.title}</div>
        <div class="${subClass}">${t.detail}</div>
        ${hasExpand ? `<div class="expand-detail" style="display:none;margin-top:8px;padding:10px 12px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--text-mid);line-height:1.7;white-space:pre-line">${t.expand}</div>` : ''}
      </div>
      ${hasExpand ? '<span style="color:var(--text-light);font-size:11px;flex-shrink:0;margin-top:4px;transition:transform .2s" class="expand-arrow">展开 ▾</span>' : ''}
    </div>
  `;
}

function toggleExpand(el) {
  const detail = el.querySelector('.expand-detail');
  const arrow = el.querySelector('.expand-arrow');
  if (!detail) return;
  if (detail.style.display === 'none') {
    detail.style.display = 'block';
    if (arrow) { arrow.textContent = '收起 ▴'; arrow.style.color = 'var(--gold-dark)'; }
  } else {
    detail.style.display = 'none';
    if (arrow) { arrow.textContent = '展开 ▾'; arrow.style.color = 'var(--text-light)'; }
  }
}

// ===== Auto Tasks =====
function renderAuto() {
  document.getElementById('autoList').innerHTML = DATA.automatedTasks.map(t => `
    <div class="auto-row">
      <div class="auto-icon">${t.icon||'⚙'}</div>
      <div class="auto-info">
        <div class="auto-name">${t.name}</div>
        <div class="auto-meta">${t.schedule} · 上次：${t.lastRun} · ${t.detail}</div>
      </div>
      <span class="badge ${t.status==='ok'?'badge-ok':'badge-error'}">${t.status==='ok'?'正常':'异常'}</span>
    </div>
  `).join('');
}

// ===== Content =====
function renderContent() {
  const statusMap = { 'drafting':{label:'草稿中',cls:'badge-drafting'}, 'idle':{label:'待更新',cls:'badge-idle'} };
  document.getElementById('contentList').innerHTML = DATA.content.map(c => {
    const s = statusMap[c.status] || statusMap.idle;
    const fw = c.followers ? ` · ${c.followers}粉` : '';
    return `
      <div class="content-row">
        <div class="content-info">
          <div class="content-channel">${c.channel}</div>
          <div class="content-meta">上次：${c.lastPublish} · 下次：${c.nextPlan}${fw}</div>
        </div>
        <span class="badge ${s.cls}">${s.label}</span>
      </div>
    `;
  }).join('');
}

// ===== Links =====
function renderLinks() {
  document.getElementById('linksList').innerHTML = DATA.quickLinks.map(l => `
    <div class="link-card" onclick="window.open('${l.url}','_blank')">
      <span class="link-name">${l.name}</span>
      <span class="link-arrow">›</span>
    </div>
  `).join('');
}

// ===== Memo (localStorage) =====
function getMemos() {
  return JSON.parse(localStorage.getItem('memos') || '[]');
}
function saveMemos(memos) {
  localStorage.setItem('memos', JSON.stringify(memos));
}

function renderMemo() {
  // Create memo page if not exists
  let page = document.getElementById('page-memo');
  if (!page) {
    page = document.createElement('div');
    page.id = 'page-memo';
    page.className = 'page hidden';
    document.querySelector('.main').appendChild(page);
  }

  const localMemos = getMemos();
  const serverMemos = DATA.memos || [];
  let html = '';

  // Server memos (pinned, from data.json)
  if (serverMemos.length) {
    html += `<div class="section"><div class="section-title"><span class="dot" style="background:var(--gold)"></span>固定备忘 <span class="count">${serverMemos.length}</span></div>`;
    html += serverMemos.map(m => `
      <div class="card" style="padding:14px 16px;margin-bottom:12px;border-left:3px solid var(--gold)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:15px;font-weight:600;color:var(--text)">${escapeHtml(m.title)}</div>
          <span class="badge badge-drafting">${escapeHtml(m.tag||'备忘')}</span>
        </div>
        <div style="font-size:11px;color:var(--text-light);margin-bottom:8px">${m.date||''}</div>
        <div style="font-size:13px;color:var(--text-mid);line-height:1.8;white-space:pre-wrap">${escapeHtml(m.content)}</div>
      </div>
    `).join('');
    html += '</div>';
  }

  // Local memo input
  html += `
    <div class="section">
      <div class="section-title"><span class="dot" style="background:var(--text-light)"></span>随手记</div>
      <div class="card" style="padding:16px">
        <textarea id="memoInput" placeholder="记下想法、灵感、待办..." style="width:100%;min-height:80px;padding:12px;border:1px solid var(--border);border-radius:10px;font-size:14px;background:var(--bg);color:var(--text);outline:none;resize:vertical;font-family:inherit"></textarea>
        <button id="memoSaveBtn" style="margin-top:8px;padding:8px 16px;background:var(--gold);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600">保存</button>
      </div>
    </div>
  `;

  // Local memos
  html += `<div class="section"><div class="section-title"><span class="dot"></span>历史记录 <span class="count">${localMemos.length}</span></div>`;
  if (localMemos.length === 0) {
    html += '<div class="empty">还没有记录</div>';
  } else {
    html += localMemos.slice().reverse().map((m, i) => {
      const realIdx = localMemos.length - 1 - i;
      return `
        <div class="card" style="padding:14px 16px">
          <div style="font-size:14px;color:var(--text);line-height:1.6;white-space:pre-wrap">${escapeHtml(m.text)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <span style="font-size:11px;color:var(--text-light)">${m.time}</span>
            <button class="memo-del" data-idx="${realIdx}" style="font-size:12px;color:var(--red);padding:4px 8px">删除</button>
          </div>
        </div>
      `;
    }).join('');
  }
  html += '</div>';

  page.innerHTML = html;

  // Bind
  const input = page.querySelector('#memoInput');
  const saveBtn = page.querySelector('#memoSaveBtn');
  saveBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (!val) return;
    const memos = getMemos();
    memos.push({ text: val, time: new Date().toLocaleString('zh-CN', {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) });
    saveMemos(memos);
    input.value = '';
    renderMemo();
  });

  page.querySelectorAll('.memo-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const memos = getMemos();
      memos.splice(idx, 1);
      saveMemos(memos);
      renderMemo();
    });
  });
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== Inspirations =====
function renderInspirations() {
  const list = document.getElementById('inspirationList');
  if (!list) return;
  const items = DATA.inspirations || [];
  if (!items.length) { list.innerHTML = '<div class="empty">还没有灵感记录</div>'; return; }

  const statusMap = {
    'concept': { label: '构思中', cls: 'badge-drafting' },
    'paused':  { label: '暂缓',   cls: 'badge-idle' },
    'active':  { label: '已启动', cls: 'badge-ok' }
  };

  list.innerHTML = items.map(it => {
    const s = statusMap[it.status] || statusMap.concept;
    const trigger = it.trigger ? `<div style="font-size:11px;color:var(--text-light);margin-top:6px">触发：${it.trigger}</div>` : '';
    return `
      <div class="card" style="padding:14px 16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:15px;font-weight:600;color:var(--text)">💡 ${it.title}</div>
          <span class="badge ${s.cls}">${s.label}</span>
        </div>
        <div style="font-size:11px;color:var(--text-light);margin-bottom:8px">${it.date} · ${it.tag}</div>
        <div style="font-size:13px;color:var(--text-mid);line-height:1.7">${it.desc}</div>
        ${trigger}
      </div>
    `;
  }).join('');
}

function renderArchives() {
  const list = document.getElementById('archiveList');
  if (!list) return;
  const items = DATA.archives || [];
  if (!items.length) { list.innerHTML = '<div class="empty">还没有归档文档</div>'; return; }

  const catMap = {
    'plan': { label: '计划', cls: 'badge-drafting' },
    'report': { label: '报告', cls: 'badge-ok' },
    'analysis': { label: '分析', cls: 'badge-idle' },
    'note': { label: '笔记', cls: 'badge-drafting' }
  };

  list.innerHTML = items.map(it => {
    const c = catMap[it.cat] || catMap.note;
    return `
      <div class="card" style="padding:14px 16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <a href="${it.url}" target="_blank" style="font-size:15px;font-weight:600;color:var(--text);text-decoration:none">${it.icon || '📄'} ${it.title}</a>
          <span class="badge ${c.cls}">${c.label}</span>
        </div>
        <div style="font-size:11px;color:var(--text-light);margin-bottom:8px">${it.date} · ${it.tag || ''}</div>
        <div style="font-size:13px;color:var(--text-mid);line-height:1.7">${it.desc}</div>
        <a href="${it.url}" target="_blank" style="font-size:12px;color:var(--gold-dark);margin-top:8px;display:inline-block">查看文档 →</a>
      </div>
    `;
  }).join('');
}

function renderMemoir() {
  const list = document.getElementById('memoirList');
  if (!list) return;
  const items = DATA.memoirs || [];
  if (!items.length) { list.innerHTML = '<div class="empty">还没有回忆录项目</div>'; return; }

  const statusMap = {
    'done': { label: '已完成', cls: 'badge-ok' },
    'progress': { label: '进行中', cls: 'badge-drafting' },
    'planned': { label: '计划中', cls: 'badge-idle' }
  };

  list.innerHTML = items.map(it => {
    const s = statusMap[it.status] || statusMap.planned;
    return `
      <div class="product-card" onclick="window.open('${it.url}','_blank')" style="margin-bottom:10px">
        <div class="product-icon">${it.icon || '📖'}</div>
        <div class="product-info">
          <div class="product-name">${it.name}</div>
          <div class="product-meta">
            <span class="badge ${s.cls}">${s.label}</span>
            <span>${it.date}</span>
            <span>${it.note}</span>
          </div>
        </div>
        <span class="product-arrow">›</span>
      </div>
    `;
  }).join('');
}