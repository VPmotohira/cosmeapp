// アプリケーションの状態(state)を管理します

const LS_KEY = 'skincare.app.v1';

function initState() {
    // デモ用に、いくつかのアイテムに仮の開始日を設定
    const initialProducts = [
        { id: 'item1', wontUse: false, lowStock: false, startDate: '2025-09-15' }, // シュウ ウエムラ
        { id: 'item2', wontUse: false, lowStock: false, startDate: '2025-08-20' }, // B.A ウォッシュ
        { id: 'item4', wontUse: false, lowStock: false, startDate: '2025-09-01' }, // オルビスユー
        { id: 'item6', wontUse: false, lowStock: false, startDate: '2025-07-10' }, // SK-II
        { id: 'item7', wontUse: false, lowStock: false }, // アネッサ
        { id: 'item3', wontUse: false, lowStock: false }, // スイサイ
        { id: 'item5', wontUse: false, lowStock: false }, // ランコム
    ];

    return {
        currentScreen: 'main',
        dailyConditions: { skin: 'normal', makeup: 'no', outing: 'no' },
        products: initialProducts, // 上で定義した仮データを使用
        savedRecipes: [],
        history: [],
        today: null
    };
}

export function saveState() {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save state:", e);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem(LS_KEY);
        // 簡単なバージョンチェックやマイグレーションもここで行える
        return savedState ? JSON.parse(savedState) : null;
    } catch (e) {
        console.error("Failed to load state:", e);
        return null;
    }
}

export let state = loadState() || initState();
