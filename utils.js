// アプリケーション全体で使われる便利な関数をまとめます
export function displayDate(element) {
    const today = new Date();
    element.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
}
