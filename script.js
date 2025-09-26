document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. データ定義 (アプリのデータベースの代わり) ----
    const masterInventory = [
        { id: 'item1', category: 'クレンジング', name: 'シュウ ウエムラ', price: 5720, startDate: '2025-08-10', usageHistory: [90], isFavorite: true, runningLow: false, wontUse: false, details: 'オイルは3-4プッシュ。しっかり乳化させるのが大事。', routine: ['evening_makeup'] },
        { id: 'item2', category: '洗顔', name: 'B.A ウォッシュ N', price: 11000, startDate: '2025-09-01', usageHistory: [60], isFavorite: false, runningLow: false, wontUse: false, details: '1cmほどをネットで泡立てる。泡を転がすように優しく洗う。', routine: ['morning', 'evening'] },
        { id: 'item3', category: '酵素洗顔', name: 'スイサイ ビューティクリア', price: 1980, startDate: '2025-07-20', usageHistory: [120], isFavorite: true, runningLow: true, wontUse: false, details: '週2回のスペシャルケア。Tゾーンを中心に。', schedule: { type: 'weekly', days: [2, 5] }, routine: [] },
        { id: 'item4', category: '化粧水', name: 'オルビスユー', price: 2970, startDate: '2025-09-15', usageHistory: [50], isFavorite: true, runningLow: false, wontUse: false, details: '500円玉大を手に取り、ハンドプレスで馴染ませる。', routine: ['morning', 'evening'] },
        { id: 'item5', category: '美容液', name: 'ランコム ジェニフィック', price: 11990, startDate: '2025-09-20', usageHistory: [], isFavorite: false, runningLow: false, wontUse: false, details: 'スポイト1回分。化粧水の後、乳液の前に使用。', routine: ['morning_bad', 'evening_bad'] },
        { id: 'item6', category: '乳液', name: 'SK-II スキンパワー', price: 14850, startDate: '2025-08-05', usageHistory: [75], isFavorite: false, runningLow: true, wontUse: false, details: '大きめのパール粒大を顔全体に馴染ませる。', routine: ['morning', 'evening'] },
        { id: 'item7', category: '日焼け止め', name: 'アネッサ パーフェクトUV', price: 3300, startDate: '2025-05-01', usageHistory: [120], isFavorite: true, runningLow: false, wontUse: true, details: 'スキンケアの最後に使用。2-3時間おきに塗り直すのが理想。', routine: ['morning'] },
    ];
    // ... 他のデータ ...

    // ---- 2. アプリの状態管理 ----
    const state = {
        currentScreen: 'main',
        inventoryFilter: 'all',
        dailyConditions: { skin: 'normal', makeup: 'no', outing: 'no' },
        completedTasks: JSON.parse(localStorage.getItem('completedTasks')) || {},
        skinHistory: { '2025-9-20': 'good', '2025-9-21': 'good', '2025-9-22': 'normal', '2025-9-23': 'bad', '2025-9-24': 'normal', '2025-9-25': 'normal', '2025-9-26': 'good' },
    };

    // ---- 3. DOM要素 ----
    const dom = {
        headerTitle: document.getElementById('header-title'),
        dateElement: document.getElementById('current-date'),
        nav: document.querySelector('nav'),
        mainScreen: document.getElementById('main-screen'),
        scheduleScreen: document.getElementById('schedule-screen'),
        inventoryScreen: document.getElementById('inventory-screen'),
        routinesScreen: document.getElementById('routines-screen'),
        accountScreen: document.getElementById('account-screen'),
    };

    // ---- 4. 初期化 ----
    function initialize() {
        displayDate();
        dom.nav.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                state.currentScreen = e.target.closest('button').dataset.screen;
                renderCurrentScreen();
            }
        });
        renderCurrentScreen();
    }

    // ---- 5. 画面管理（ルーター） ----
    function renderCurrentScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        const activeScreen = document.getElementById(`${state.currentScreen}-screen`);
        const activeButton = document.querySelector(`nav button[data-screen="${state.currentScreen}"]`);
        activeScreen.classList.add('active');
        activeButton.classList.add('active');
        dom.headerTitle.textContent = { main: '今日のスキンケア', schedule: 'スケジュール', inventory: 'コスメ一覧', routines: 'ルーティン一覧', account: 'アカウント情報' }[state.currentScreen];
        
        const renderFunction = {
            main: renderMainScreen, schedule: renderScheduleScreen, inventory: renderInventoryScreen,
            routines: renderRoutinesScreen, account: renderAccountScreen
        }[state.currentScreen];
        renderFunction();
    }

    // ---- 6. 各画面の描画 兼 イベント設定関数 ----
    function renderMainScreen() {
        dom.mainScreen.innerHTML = `
            <section class="card">
                <h2>今日の状態</h2>
                <div class="condition-group"><label>肌の調子:</label><div class="radio-buttons" data-group="skin"><button data-value="good">良い</button><button data-value="normal">普通</button><button data-value="bad" title="ニキビ、肌荒れなど">荒れている</button></div></div>
                <div class="condition-group"><label>メイクや日焼け止め:</label><div class="radio-buttons" data-group="makeup"><button data-value="yes">した/する</button><button data-value="no">してない</button></div></div>
                <div class="condition-group"><label>外出:</label><div class="radio-buttons" data-group="outing"><button data-value="yes">した/する</button><button data-value="no">してない</button></div></div>
                <button id="regenerate-manual" class="primary-action">今日のマニュアルを生成</button>
            </section>
            <section class="card"><h2>ルーティンから選択</h2><button class="secondary-action">ルーティンを自分で選んで表示する</button></section>
            <main id="manual-container"></main>`;
        
        dom.mainScreen.querySelectorAll('.radio-buttons').forEach(div => {
            div.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    state.dailyConditions[e.currentTarget.dataset.group] = e.target.dataset.value;
                    updateConditionUI();
                }
            });
        });
        dom.mainScreen.querySelector('#regenerate-manual').addEventListener('click', renderManual);
        
        const manualContainer = dom.mainScreen.querySelector('#manual-container');
        manualContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if(!button) return;
            if (button.classList.contains('complete-all-btn')) {
                const time = button.dataset.routineTime;
                const items = getRoutineItemsFor(time);
                const allCompleted = items.every(item => state.completedTasks[getTodayString()]?.includes(item.id));
                items.forEach(item => toggleTaskCompletion(item.id, !allCompleted));
            }
            if (button.classList.contains('details-btn')) {
                const item = masterInventory.find(i => i.id === button.dataset.itemId);
                alert(item.details);
            }
        });
        manualContainer.addEventListener('change', e => {
            if(e.target.classList.contains('task-checkbox')) {
                toggleTaskCompletion(e.target.dataset.itemId, e.target.checked);
            }
        });

        updateConditionUI();
        renderManual();
    }

    function renderScheduleScreen() { /* ...変更なし... */ }
    function renderInventoryScreen() { /* ...変更なし... */ }
    function renderRoutinesScreen() { /* ...変更なし... */ }
    function renderAccountScreen() { /* ...変更なし... */ }

    // ---- 7. コンポーネント描画（画面の部品） ----
    function renderManual() { /* ...変更なし... */ }
    function renderInventoryList() { /* ...変更なし... */ }
    function renderSkinConditionChart() { /* ...変更なし... */ }
    function renderWeeklySchedule() { /* ...変更なし... */ }

    // ---- 8. HTML生成ヘルパー ----
    function createRoutineSectionHTML(time, title, items) { /* ...変更なし... */ }
    
    // ★★★★★ 修正点 ★★★★★
    function createTaskItemHTML(item) {
        return `
            <li class="task-item" id="task-${item.id}">
                <div class="item-image-placeholder">画像</div>
                <input type="checkbox" class="task-checkbox" data-item-id="${item.id}">
                <div class="task-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category}</div>
                    <div class="item-days">使用 ${calculateDays(item.startDate)} 日目</div>
                </div>
                <button class="details-btn" data-item-id="${item.id}">詳細</button>
            </li>`;
    }
    // ★★★★★ ここまで ★★★★★

    function createInventoryItemHTML(item) { /* ...変更なし... */ }

    // ---- 9. 状態更新 & UI反映 ----
    function updateConditionUI() { /* ...変更なし... */ }
    function toggleTaskCompletion(itemId, shouldBeCompleted) { /* ...変更なし... */ }
    function updateAllTaskCheckboxes() { /* ...変更なし... */ }
    function toggleItemStatus(itemId, statusKey) { /* ...変更なし... */ }
    function getRoutineItemsFor(timeOfDay) { /* ...変更なし... */ }

    // ---- 10. ヘルパー関数 ----
    function displayDate() { /* ...変更なし... */ }
    function getTodayString() { /* ...変更なし... */ }
    function calculateDays(startDateStr) { /* ...変更なし... */ }

    initialize();
    
    // ---- (ここより下は、前回から大きな変更のない関数群です) ----
    function renderScheduleScreen() { dom.scheduleScreen.innerHTML = `<section class="card"><h2>肌コンディション履歴</h2><div id="skin-condition-chart"></div></section><section class="card"><h2>週間スケジュール</h2><div id="schedule-view"></div></section>`; renderSkinConditionChart(); renderWeeklySchedule(); }
    function renderInventoryScreen() { dom.inventoryScreen.innerHTML = `<section class="card"><h2>コスメ管理</h2><button class="primary-action">新しいコスメを追加する</button><div class="inventory-filters"><button data-filter="all">すべて</button><button data-filter="favorites">お気に入り</button><button data-filter="running_low">もうすぐなくなる</button></div><div id="inventory-list-container"></div></section>`; dom.inventoryScreen.querySelector('.inventory-filters').addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') { state.inventoryFilter = e.target.dataset.filter; renderInventoryList(); } }); dom.inventoryScreen.querySelector('#inventory-list-container').addEventListener('click', (e) => { const button = e.target.closest('button'); if(!button || !button.dataset.itemId) return; if (button.classList.contains('running-low-btn')) toggleItemStatus(button.dataset.itemId, 'runningLow'); if (button.classList.contains('wont-use-btn')) toggleItemStatus(button.dataset.itemId, 'wontUse'); }); renderInventoryList(); }
    function renderRoutinesScreen() { dom.routinesScreen.innerHTML = `<section class="card"><h2>ルーティン一覧</h2><p>開発中です。</p></section>`; }
    function renderAccountScreen() { dom.accountScreen.innerHTML = `<section class="card"><h2>アカウント情報</h2><div class="form-group"><label>メールアドレス</label><input type="email" value="user@example.com" disabled></div><div class="form-group"><label>パスワード</label><input type="password" value="********" disabled></div><button>パスワードを変更</button></section>`; }
    function renderManual() { const container = dom.mainScreen.querySelector('#manual-container'); if (!container) return; const morningItems = getRoutineItemsFor('morning'); const eveningItems = getRoutineItemsFor('evening'); container.innerHTML = createRoutineSectionHTML('morning', '☀️ 朝のルーティン', morningItems) + createRoutineSectionHTML('evening', '🌙 夜のルーティン', eveningItems); updateAllTaskCheckboxes(); }
    function renderInventoryList() { const container = dom.inventoryScreen.querySelector('#inventory-list-container'); if (!container) return; const filters = { all: item => true, favorites: item => item.isFavorite, running_low: item => item.runningLow && !item.wontUse }; const grouped = masterInventory.filter(filters[state.inventoryFilter]).reduce((acc, item) => { (acc[item.category] = acc[item.category] || []).push(item); return acc; }, {}); container.innerHTML = Object.entries(grouped).map(([category, items]) => `<div class="category-group"><h3 class="category-title">${category}</h3>${items.map(createInventoryItemHTML).join('')}</div>`).join(''); dom.inventoryScreen.querySelectorAll('.inventory-filters button').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === state.inventoryFilter)); }
    function renderSkinConditionChart() { const container = document.getElementById('skin-condition-chart'); if (!container) return; let html = ''; for (let i = -6; i <= 0; i++) { const date = new Date(); date.setDate(new Date().getDate() + i); const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; const condition = state.skinHistory[dateKey] || 'normal'; const height = { good: 100, normal: 60, bad: 25 }[condition]; html += `<div class="chart-bar-container"><div class="chart-bar ${condition}" style="height: ${height}%;"></div><div class="chart-label">${date.getDate()}日</div></div>`; } container.innerHTML = html; }
    function renderWeeklySchedule() { const container = document.getElementById('schedule-view'); if (!container) return; let html = ''; for (let i = -7; i < 8; i++) { const date = new Date(); date.setDate(new Date().getDate() + i); const scheduledItems = masterInventory.filter(item => item.schedule?.days.includes(date.getDay()) && !item.wontUse); html += `<div class="schedule-day ${i < 0 ? 'is-past' : ''}"><div class="day-header ${i===0 ? 'is-today' : ''}">${date.getMonth()+1}/${date.getDate()}</div><ul>${scheduledItems.length > 0 ? scheduledItems.map(item => `<li>✨ ${item.name}</li>`).join('') : '<li>通常ケア</li>'}</ul></div>`; } container.innerHTML = html; }
    function createRoutineSectionHTML(time, title, items) { return `<section class="routine-section card"><h3>${title}</h3><div class="routine-actions"><button class="complete-all-btn" data-routine-time="${time}">すべて完了</button><button>アイテムを追加</button></div><ul class="task-list">${items.map(createTaskItemHTML).join('')}</ul></section>`; }
    function createInventoryItemHTML(item) { return `<div class="inventory-item ${item.wontUse ? 'wont-use-item' : ''}"><div class="item-image-placeholder">画像</div><div class="inventory-item-details"><div class="item-name">${item.name} (¥${item.price.toLocaleString()})</div><div class="item-usage-info">使用 ${calculateDays(item.startDate)} 日目 | 前回: ${item.usageHistory[0] || 'N/A'} 日</div><div class="item-actions-footer"><button class="running-low-btn ${item.runningLow ? 'active' : ''}" data-item-id="${item.id}">もうすぐなくなる</button><button class="wont-use-btn ${item.wontUse ? 'active' : ''}" data-item-id="${item.id}">もう使わない</button></div>${item.runningLow && !item.wontUse ? `<button class="buy-button">追加で購入する</button>` : ''}</div></div>`; }
    function updateConditionUI() { dom.mainScreen.querySelectorAll('.radio-buttons').forEach(div => div.querySelectorAll('button').forEach(btn => btn.classList.toggle('selected', btn.dataset.value === state.dailyConditions[div.dataset.group]))); }
    function toggleTaskCompletion(itemId, shouldBeCompleted) { const today = getTodayString(); state.completedTasks[today] = state.completedTasks[today] || []; const index = state.completedTasks[today].indexOf(itemId); if (shouldBeCompleted && index === -1) state.completedTasks[today].push(itemId); if (!shouldBeCompleted && index > -1) state.completedTasks[today].splice(index, 1); localStorage.setItem('completedTasks', JSON.stringify(state.completedTasks)); updateAllTaskCheckboxes(); }
    function updateAllTaskCheckboxes() { document.querySelectorAll('.task-checkbox').forEach(cb => { const isCompleted = state.completedTasks[getTodayString()]?.includes(cb.dataset.itemId); cb.checked = isCompleted; cb.closest('.task-item').classList.toggle('completed', isCompleted); }); }
    function toggleItemStatus(itemId, statusKey) { const item = masterInventory.find(i => i.id === itemId); if (item) item[statusKey] = !item[statusKey]; renderInventoryList(); }
    function getRoutineItemsFor(timeOfDay) { const { skin, makeup, outing } = state.dailyConditions; let keys = [timeOfDay]; if (skin === 'bad') keys.push(`${timeOfDay}_bad`); if (timeOfDay === 'evening') { if (makeup === 'yes') keys.push('evening_makeup'); if (outing === 'yes') keys.push('evening_outing'); } return masterInventory.filter(item => !item.wontUse && item.routine.some(rKey => keys.includes(rKey))); }
    function displayDate() { const today = new Date(); dom.dateElement.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`; }
    function getTodayString() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
    function calculateDays(startDateStr) { return Math.ceil((new Date() - new Date(startDateStr)) / (1000 * 60 * 60 * 24)); }
});
