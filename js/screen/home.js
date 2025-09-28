import { state, saveState } from '../state.js';
import { masterInventory, step, calcDurations, uuid } from '../data.js';

function renderMainScreen(container) {
  // --- 画面の骨格を定義 ---
  container.innerHTML = `
    <div class="condition-chips mb-4">
      <div class="chip-group"><label>肌:</label><div class="chips" data-group="skin"><button data-value="bad">荒れ</button><button data-value="normal">普通</button><button data-value="good">良い</button></div></div>
      <div class="chip-group"><label>メイク:</label><div class="chips" data-group="makeup"><button data-value="yes">あり</button><button data-value="no">なし</button></div></div>
      <div class="chip-group"><label>外出:</label><div class="chips" data-group="outing"><button data-value="yes">あり</button><button data-value="no">なし</button></div></div>
    </div>

    <div class="mb-4 flex justify-end">
      <button class="btn-secondary text-sm flex items-center gap-2" id="recipe-actions-button">
        <i class="fas fa-ellipsis-h"></i>
        <span>レシピを操作</span>
      </button>
    </div>

    <div id="manual-container"></div>

    <div id="action-sheet" class="hidden fixed inset-0 bg-black/40 z-40">
      <div id="action-sheet-content" class="absolute bottom-0 left-0 right-0 bg-gray-50 p-4 rounded-t-2xl transform translate-y-full transition-transform duration-300 max-w-md mx-auto">
        <button class="action-sheet-item" id="apply-yesterday">昨日のレシピを反映</button>
        <button class="action-sheet-item" id="apply-past">過去のレシピを選択</button>
        <button class="action-sheet-item" id="save-recipe">このレシピを保存</button>
        <button class="action-sheet-item-cancel mt-2" id="action-sheet-cancel">キャンセル</button>
      </div>
    </div>
  `;

  // --- イベントリスナーを設定 ---

  // 肌コンディション選択
  container.querySelectorAll('.chips').forEach(div => {
    div.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b.dataset.value === state.dailyConditions[div.dataset.group]));
    div.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      state.dailyConditions[div.dataset.group] = e.target.dataset.value;
      saveState();
      div.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
      // TODO: レシピ再計算ロジックをここに呼び出す
      renderManual();
    });
  });

  // アクションシートの操作
  const actionsButton = container.querySelector('#recipe-actions-button');
  const actionSheet = container.querySelector('#action-sheet');
  const actionSheetContent = container.querySelector('#action-sheet-content');
  const cancelButton = container.querySelector('#action-sheet-cancel');

  const openActionSheet = () => {
    actionSheet.classList.remove('hidden');
    setTimeout(() => actionSheetContent.classList.remove('translate-y-full'), 10);
  };

  const closeActionSheet = () => {
    actionSheetContent.classList.add('translate-y-full');
    setTimeout(() => actionSheet.classList.add('hidden'), 300);
  };

  actionsButton.addEventListener('click', openActionSheet);
  actionSheet.addEventListener('click', (e) => { if (e.target === actionSheet) closeActionSheet(); }); // 背景クリックで閉じる
  cancelButton.addEventListener('click', closeActionSheet);

  // アクションシート内のボタンのイベント
  container.querySelector('#apply-yesterday').addEventListener('click', () => { applyYesterday(); closeActionSheet(); });
  container.querySelector('#apply-past').addEventListener('click', () => { applyPast(); closeActionSheet(); });
  container.querySelector('#save-recipe').addEventListener('click', () => { saveCurrentRecipe(); closeActionSheet(); });

  // 最初のレシピ表示
  renderManual();
}


function renderManual() {
  const wrap = document.getElementById('manual-container');
  if (!wrap || !state.today) return;

  const { amMinutes, pmMinutes } = calcDurations(state.today);
  wrap.innerHTML =
    createSection('☀️ 朝のレシピ', state.today.am, amMinutes, 'AM') +
    createSection('🌙 夜のレシピ', state.today.pm, pmMinutes, 'PM');

  // イベントリスナーを再設定
  wrap.querySelectorAll('[data-action="complete-all"]').forEach(b => b.addEventListener('click', () => onCompleteAll(b.dataset.time)));
  wrap.querySelectorAll('[data-action="share-section"]').forEach(b => b.addEventListener('click', () => onShareSection(b.dataset.time)));
  wrap.querySelectorAll('[data-action="add-item"]').forEach(b => b.addEventListener('click', () => onAddItem(b.dataset.time)));
  wrap.querySelectorAll('.info-button').forEach(b => b.addEventListener('click', () => {
      alert('ここに「使い方のメモ」などを表示する機能を今後追加します。');
  }));
}

function createSection(title, steps, minutes, tod) {
  const list = steps.filter(s => !s.hidden).map(s => {
    const p = masterInventory.find(i => i.id === s.productId);
    const productState = state.products.find(prod => prod.id === s.productId);

    // 利用開始日からの経過日数を計算
    let daysUsedBadge = '';
    if (productState && productState.startDate) {
        const startDate = new Date(productState.startDate);
        const today = new Date();
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 1日目からスタート
        daysUsedBadge = `<span class="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full whitespace-nowrap">${diffDays}日目</span>`;
    }

    return `
      <li class="task-item flex items-center p-2 bg-gray-50 rounded-lg mb-2">
        <input type="checkbox" class="task-checkbox flex-shrink-0 w-5 h-5 mr-3"/>
        <img src="${p?.image || 'https://placehold.co/80'}" class="w-10 h-10 rounded-md">
        <div class="ml-3 flex-grow min-w-0">
          <p class="font-bold text-sm truncate">${p?.name || s.stepType}</p>
          <p class="text-xs text-gray-500">${p?.category || s.stepType}</p>
        </div>
        <div class="flex items-center gap-2 ml-2">
          ${daysUsedBadge}
          <button class="info-button" data-product-id="${p?.id}">
            <i class="fas fa-info-circle text-gray-400 hover:text-gray-600"></i>
          </button>
        </div>
      </li>`;
    }).join('') || `<li class="text-sm text-gray-400 p-2">ステップがありません。</li>`;

  return `
    <div class="card bg-white p-4 mb-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-lg">${title}</h3>
        <span class="text-xs text-gray-500">目安 ${minutes}分</span>
      </div>
      <ul class="space-y-1">${list}</ul>
      <div class="mt-4 grid grid-cols-3 gap-2">
        <button class="btn-primary text-sm p-2 rounded-md" data-action="complete-all" data-time="${tod}">全て完了</button>
        <button class="btn-secondary text-sm p-2 rounded-md" data-action="share-section" data-time="${tod}">このレシピをシェア</button>
        <button class="btn-secondary text-sm p-2 rounded-md" data-action="add-item" data-time="${tod}">＋ アイテム追加</button>
      </div>
    </div>`;
}

// --- レシピ操作の関数群 ---
function applyYesterday() {
  if (!state.history || state.history.length < 1) { alert('昨日のレシピはありません'); return; }
  state.today.am = JSON.parse(JSON.stringify(state.history[0].am));
  state.today.pm = JSON.parse(JSON.stringify(state.history[0].pm));
  saveState(); renderManual();
}
function applyPast() {
  if (!state.history || state.history.length < 1) { alert('過去のレシピはありません'); return; }
  const choice = prompt(`過去のレシピ番号を入力 (1〜${state.history.length})`);
  const idx = parseInt(choice, 10) - 1;
  if (idx >= 0 && idx < state.history.length) {
    state.today.am = JSON.parse(JSON.stringify(state.history[idx].am));
    state.today.pm = JSON.parse(JSON.stringify(state.history[idx].pm));
    saveState(); renderManual();
  }
}
function saveCurrentRecipe() {
  const name = prompt('このレシピの名前を入力してください');
  if (!name) return;
  state.savedRecipes.push({ id: uuid(), name, am: JSON.parse(JSON.stringify(state.today.am)), pm: JSON.parse(JSON.stringify(state.today.pm)) });
  saveState(); alert('保存しました');
}
function onCompleteAll(time) {
  const container = document.getElementById('manual-container');
  const sectionSelector = time === 'AM' ? '.card:nth-of-type(1)' : '.card:nth-of-type(2)';
  const section = container.querySelector(sectionSelector);
  if (section) section.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = true);
}
function onShareSection(time) {
  const steps = (time === 'AM' ? state.today.am : state.today.pm).filter(s => !s.hidden);
  const lines = steps.map(s => `・${masterInventory.find(m => m.id === s.productId)?.name || s.stepType}`).join('\n');
  const text = `${time}のレシピ\n${lines || '（ステップなし）'}`;
  navigator.clipboard.writeText(text).then(() => alert('レシピをクリップボードにコピーしました'));
}
function onAddItem(time) {
  alert('アイテム追加機能はコスメ一覧画面に統合予定です。');
}

export default renderMainScreen;
