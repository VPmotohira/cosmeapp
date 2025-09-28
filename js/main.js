import renderMainScreen from './screen/home.js';
import renderScheduleScreen from './screen/schedule.js';
import renderInventoryScreen from './screen/inventory.js';
import renderDiaryScreen from './screen/diary.js';
import renderAccountScreen from './screen/account.js';
import { displayDate } from './utils.js';
import { state } from './state.js';

// DOM要素
const dom = {
    headerTitle: document.getElementById('header-title'),
    dateElement: document.getElementById('current-date'),
    nav: document.querySelector('nav'),
    main: document.querySelector('main'),
};

// 初期化
function initialize() {
    displayDate(dom.dateElement);
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
    if (!activeScreen) {
        activeScreen = document.createElement('div');
        activeScreen.id = `${state.currentScreen}-screen`;
        activeScreen.className = 'screen';
        dom.main.appendChild(activeScreen);
    }
    
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

// アプリケーション開始
initialize();

