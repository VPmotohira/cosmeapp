import renderMainScreen from './screens/home.js';
import renderScheduleScreen from './screens/schedule.js';
import renderInventoryScreen from './screens/inventory.js';
import renderDiaryScreen from './screens/diary.js';
import renderAccountScreen from './screens/account.js';

// 状態管理
export const state = {
    currentScreen: 'main',
    dailyConditions: JSON.parse(localStorage.getItem('dailyConditions')) || { skin: 'normal', makeup: 'no', outing: 'no', details: [] },
    skinHistory: { '2025-9-22': 'normal', '2025-9-23': 'bad', '2025-9-24': 'normal', '2025-9-25': 'normal', '2025-9-26': 'good', '2025-9-27': 'good', '2025-9-28': 'normal' }
};

// DOM要素
const dom = {
    headerTitle: document.getElementById('header-title'),
    dateElement: document.getElementById('current-date'),
    nav: document.querySelector('nav'),
    main: document.querySelector('main'),
};

// 初期化
function initialize() {
    displayDate();
    dom.nav.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) {
            state.currentScreen = button.dataset.screen;
            renderCurrentScreen();
        }
    });
    renderCurrentScreen();
}

// 画面管理（ルーター）
function renderCurrentScreen() {
    dom.main.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    dom.nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    
    let activeScreen = document.getElementById(`${state.currentScreen}-screen`);
    const activeButton = document.querySelector(`nav button[data-screen="${state.currentScreen}"]`);
    
    activeScreen.classList.add('active');
    activeButton.classList.add('active');
    
    dom.headerTitle.innerHTML = { main: `今日の<span class="accent">レシピ</span>`, schedule: 'スケジュール', inventory: 'コスメ一覧', diary: 'ダイアリー', account: 'アカウント' }[state.currentScreen];

    const renderFunction = {
        main: renderMainScreen,
        schedule: renderScheduleScreen,
        inventory: renderInventoryScreen,
        diary: renderDiaryScreen,
        account: renderAccountScreen,
    }[state.currentScreen];

    renderFunction(activeScreen);
}

function displayDate() {
    const today = new Date();
    dom.dateElement.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
}

// アプリケーション開始
initialize();
