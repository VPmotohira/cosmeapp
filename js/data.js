// アプリケーション全体で共有されるデータや定数を管理します

// コスメのマスターデータ
export const masterInventory = [
    { id: 'item1', category: 'クレンジング', name: 'シュウ ウエムラ', image: 'https://placehold.co/200x200/A67B5B/FFFFFF?text=S' },
    { id: 'item2', category: '洗顔', name: 'B.A ウォッシュ N', image: 'https://placehold.co/200x200/1A1A1A/FFFFFF?text=B.A' },
    { id: 'item3', category: '酵素洗顔', name: 'スイサイ', image: 'https://placehold.co/200x200/63C3C3/FFFFFF?text=SU' },
    { id: 'item4', category: '化粧水', name: 'オルビスユー', image: 'https://placehold.co/200x200/368CCB/FFFFFF?text=O' },
    { id: 'item5', category: '美容液', name: 'ランコム ジェニフィック', image: 'https://placehold.co/200x200/2D2D2D/FFFFFF?text=L' },
    { id: 'item6', category: '乳液', name: 'SK-II スキンパワー', image: 'https://placehold.co/200x200/C9002B/FFFFFF?text=SK' },
    { id: 'item7', category: '日焼け止め', name: 'アネッサ', image: 'https://placehold.co/200x200/F2BE22/FFFFFF?text=AN' },
];

// 各ステップの所要時間の目安（分）
export const DURATION_MIN = {
    'クレンジング': 2, '洗顔': 1, '化粧水': 1, '美容液': 1, '乳液': 1, '日焼け止め': 1, '酵素洗顔': 2
};


// --- 便利関数（ユーティリティ） ---

// レシピのステップオブジェクトを作成する関数
export function step(stepType, productId, tod) {
    const prod = masterInventory.find(i => i.id === productId);
    return {
        id: uuid(),
        timeOfDay: tod,
        order: 0,
        stepType,
        productId,
        durationMin: DURATION_MIN[prod?.category || stepType] || 1,
        hidden: false
    };
}

// レシピの合計所要時間を計算する関数
export function calcDurations(day) {
    const sum = (arr) => arr.filter(s => !s.hidden).reduce((a, s) => a + (s.durationMin || 1), 0);
    return {
        amMinutes: sum(day.am),
        pmMinutes: sum(day.pm)
    };
}

// ユニークなIDを生成する関数
export function uuid() {
    return Math.random().toString(36).slice(2, 10);
}

// 「再計算中...」というフィードバックを表示する関数
export function showRecalc(element, callback) {
    if (!element) {
        callback();
        return;
    }
    element.textContent = 'レシピを再計算中...';
    setTimeout(() => {
        element.textContent = '';
        callback();
    }, 160);
}
