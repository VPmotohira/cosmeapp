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
    // ...（中略）...
    const state = {
        currentScreen: 'main',
        inventoryFilter: 'all',
        dailyConditions: { skin: 'normal', makeup: 'no', outing: 'no' },
        completedTasks: JSON.parse(localStorage.getItem('completedTasks')) || {},
        skinHistory: { 
            '2025-9-20': 'good', '2025-9-21': 'good', '2025-9-22': 'normal', '2025-9-23': 'bad', 
            '2025-9-24': 'normal', '2025-9-25': 'normal', '2025-9-26': 'good'
        },
    };
    // ...（中略）...
    function renderScheduleScreen() {
        dom.scheduleScreen.innerHTML = `
            <section class="card">
                <h2>肌コンディション履歴</h2>
                <div id="skin-condition-chart-container" class="line-chart-container"></div>
            </section>
            <section class="card">
                <h2>週間スケジュール</h2>
                <div id="schedule-view"></div>
            </section>`;
        renderSkinConditionChart();
        renderWeeklySchedule();
    }
    // ...（中略）...

    // ★★★★★ ここからが今回の修正箇所 ★★★★★
    function renderSkinConditionChart() {
        const container = document.getElementById('skin-condition-chart-container');
        if (!container) return;

        const dataPoints = [];
        for (let i = -6; i <= 0; i++) {
            const date = new Date();
            date.setDate(new Date().getDate() + i);
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            dataPoints.push({
                label: `${date.getDate()}日`,
                condition: state.skinHistory[dateKey] || 'normal'
            });
        }

        const width = container.clientWidth;
        const height = container.clientHeight;
        const padding = { top: 20, right: 20, bottom: 30, left: 20 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const conditionToY = { 'good': 0, 'normal': chartHeight / 2, 'bad': chartHeight };

        const points = dataPoints.map((dp, i) => {
            const x = (chartWidth / (dataPoints.length - 1)) * i;
            const y = conditionToY[dp.condition];
            return { x, y, condition: dp.condition, label: dp.label };
        });

        const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

        const svg = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
                <g transform="translate(${padding.left}, ${padding.top})">
                    <line x1="0" y1="0" x2="${chartWidth}" y2="0" class="line-chart-grid-line"></line>
                    <line x1="0" y1="${chartHeight / 2}" x2="${chartWidth}" y2="${chartHeight/2}" class="line-chart-grid-line"></line>
                    <line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" class="line-chart-grid-line"></line>

                    <polyline points="${pathData}" class="line-chart-path" />

                    ${points.map(p => `
                        <circle cx="${p.x}" cy="${p.y}" r="5" class="line-chart-point ${p.condition}" />
                        <text x="${p.x}" y="${chartHeight + 20}" class="line-chart-label">${p.label}</text>
                    `).join('')}
                </g>
            </svg>
        `;
        container.innerHTML = svg;
    }
    // ★★★★★ ここまで ★★★★★

    // ...（以下、変更のない関数群が続きます）...
    function renderWeeklySchedule() { const container = document.getElementById('schedule-view'); if (!container) return; let html = ''; for (let i = -7; i < 8; i++) { const date = new Date(); date.setDate(new Date().getDate() + i); const scheduledItems = masterInventory.filter(item => item.schedule?.days.includes(date.getDay()) && !item.wontUse); html += `<div class="schedule-day ${i < 0 ? 'is-past' : ''}"><div class="day-header ${i===0 ? 'is-today' : ''}">${date.getMonth()+1}/${date.getDate()}</div><ul>${scheduledItems.length > 0 ? scheduledItems.map(item => `<li>✨ ${item.name}</li>`).join('') : '<li>通常ケア</li>'}</ul></div>`; } container.innerHTML = html; }
    function initialize() {
        displayDate();
        dom.nav.addEventListener('click', (e) => { if (e.target.closest('button')) { state.currentScreen = e.target.closest('button').dataset.screen; renderCurrentScreen(); } });
        renderCurrentScreen();
    }
    initialize();
});
