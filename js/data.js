export const masterInventory = [
    { id: 'item1', category: 'クレンジング', name: 'シュウ ウエムラ', image: 'https://placehold.co/100x100/A67B5B/FFFFFF?text=S', reason: { type: 'info', text: '💄 メイクありのため' } },
    { id: 'item2', category: '洗顔', name: 'B.A ウォッシュ N', image: 'https://placehold.co/100x100/1A1A1A/FFFFFF?text=B.A' },
    { id: 'item3', category: '酵素洗顔', name: 'スイサイ', image: 'https://placehold.co/100x100/63C3C3/FFFFFF?text=SU', schedule: { type: 'weekly', days: [2, 5] }, reason: { type: 'warning', text: '⚠️ 肌荒れ時はOFF' } },
    { id: 'item4', category: '化粧水', name: 'オルビスユー', image: 'https://placehold.co/100x100/368CCB/FFFFFF?text=O' },
    { id: 'item5', category: '美容液', name: 'ランコム ジェニフィック', image: 'https://placehold.co/100x100/2D2D2D/FFFFFF?text=L', reason: { type: 'info', text: '🛡️ 肌荒れケア' } },
    { id: 'item6', category: '乳液', name: 'SK-II スキンパワー', image: 'https://placehold.co/100x100/C9002B/FFFFFF?text=SK' },
    { id: 'item7', category: '日焼け止め', name: 'アネッサ', image: 'https://placehold.co/100x100/F2BE22/FFFFFF?text=AN', reason: { type: 'info', text: '☀️ 外出ありのため' } },
];

export const pastRecipes = [
    { date: '2025年9月27日 (土)', mode: '「静かな湖」', comment: '自分を甘やかす日！', routine: '夜のお手入れ 🌙', items: ['item1', 'item2', 'item4', 'item6'] }
];
