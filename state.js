// アプリケーション全体の状態を管理します
export const state = {
    currentScreen: 'main',
    dailyConditions: JSON.parse(localStorage.getItem('dailyConditions')) || { skin: 'normal', makeup: 'no', outing: 'no', details: [] },
    skinHistory: { '2025-9-22': 'normal', '2025-9-23': 'bad', '2025-9-24': 'normal', '2025-9-25': 'normal', '2025-9-26': 'good', '2025-9-27': 'good', '2025-9-28': 'normal' }
};
