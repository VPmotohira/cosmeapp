// 調査コードは解決したので削除しました
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
        if (button && button.dataset.screen) {
            state.currentScreen = button.dataset.screen;
            renderCurrentScreen();
        }
    });
    renderCurrentScreen();
}

// 画面管理（ルーター）
function renderCurrentScreen() {
    // --- ここからが改良部分 ---
    // もし記憶されている画面名がおかしかったら、強制的に 'main' に戻す
    let targetScreen = state.currentScreen;
    let activeButton = document.querySelector(`nav button[data-screen="${targetScreen}"]`);

    if (!activeButton) {
        console.warn(`無効な画面[${targetScreen}]が記憶されていました。ホーム画面に戻ります。`);
        targetScreen = 'main';
        state.currentScreen = 'main';
        activeButton = document.querySelector(`nav button[data-screen="main"]`);
    }
    // --- 改良部分ここまで ---

    dom.main.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    dom.nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));

    let activeScreenElement = document.getElementById(`${targetScreen}-screen`);
    if (!activeScreenElement) {
        activeScreenElement = document.createElement('div');
        activeScreenElement.id = `${targetScreen}-screen`;
        activeScreenElement.className = 'screen';
        dom.main.appendChild(activeScreenElement);
    }

    activeScreenElement.classList.add('active');
    activeButton.classList.add('active'); // これでエラーは起きないはず

    dom.headerTitle.innerHTML = { main: `今日の<span class="accent">レシピ</span>`, schedule: 'スケジュール', inventory: 'コスメ一覧', diary: 'ダイアリー', account: 'アカウント' }[targetScreen];

    const renderFunction = {
        main: renderMainScreen,
        schedule: renderScheduleScreen,
        inventory: renderInventoryScreen,
        diary: renderDiaryScreen,
        account: renderAccountScreen,
    }[targetScreen];

    if (renderFunction) {
        renderFunction(activeScreenElement);
    }
}

// アプリケーション開始
initialize();
