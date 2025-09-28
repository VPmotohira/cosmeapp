// アプリケーションの状態(state)を管理します

// ローカルストレージに保存する際のキー
const LS_KEY = 'skincare.app.v1';

// --- 関数の定義 ---

// 状態を初期化する関数
function initState() {
    return {
        currentScreen: 'main',
        dailyConditions: { skin: 'normal', makeup: 'no', outing: 'no' },
        products: [], // inventory.jsで管理
        savedRecipes: [],
        history: [],
        today: null // main.jsで初期化時に生成
    };
}

// 状態をローカルストレージに保存する関数
export function saveState() {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save state:", e);
    }
}

// 状態をローカルストレージから読み込む関数
function loadState() {
    try {
        const savedState = localStorage.getItem(LS_KEY);
        if (savedState) {
            return JSON.parse(savedState);
        }
        return null;
    } catch (e) {
        console.error("Failed to load state:", e);
        return null;
    }
}

// --- 本体 ---

// アプリケーションのメインとなる状態オブジェクト
// 起動時にローカルストレージから復元するか、なければ初期化する
export let state = loadState() || initState();
