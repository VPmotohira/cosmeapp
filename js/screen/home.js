import { state, saveState } from '../state.js';
import { masterInventory, step, calcDurations, uuid, showRecalc } from '../data.js';

function renderMainScreen(container) {
  container.innerHTML = `
    <div class="condition-chips">
      <div class="chip-group"><label>肌:</label><div class="chips" data-group="skin"><button data-value="bad">荒れ</button><button data-value="normal">普通</button><button data-value="good">良い</button></div></div>
      <div class="chip-group"><label>メイク:</label><div class="chips" data-group="makeup"><button data-value="yes">あり</button><button data-value="no">なし</button></div></div>
      <div class="chip-group"><label>外出:</label><div class="chips" data-group="outing"><button data-value="yes">あり</button><button data-value="no">なし</button></div></div>
    </div>
    <div class="mb-3 flex gap-2">
      <button class="btn-secondary text-sm" id="apply-yesterday">昨日のレシピを反映</button>
      <button class="btn-secondary text-sm" id="apply-past">過去のレシピを選択</button>
      <button class="btn-secondary text-sm" id="save-recipe">このレシピを保存</button>
    </div>
    <div id="recalculating-feedback" class="text-center text-sm text-gray-500 mb-4 h-5"></div>
    <div id="manual-container"></div>
  `;

  // Condition chips event listeners
  container.querySelectorAll('.chips').forEach(div => {
    div.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b.dataset.value === state.dailyConditions[div.dataset.group]));
    div.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      state.dailyConditions[div.dataset.group] = e.target.dataset.value;
      if (state.today) state.today.conditions = { ...state.dailyConditions };
      saveState();
      showRecalc(document.getElementById('recalculating-feedback'), () => {
        // Here you might want to re-calculate the recipe based on new conditions
        // For now, we just re-render
        renderManual();
      });
      div.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
    });
  });

  // Recipe action buttons
  container.querySelector('#apply-yesterday').addEventListener('click', applyYesterday);
  container.querySelector('#apply-past').addEventListener('click', applyPast);
  container.querySelector('#save-recipe').addEventListener('click', saveCurrentRecipe);

  renderManual();
}

function renderManual() {
  const wrap = document.getElementById('manual-container');
  if (!wrap || !state.today) return;

  const { amMinutes, pmMinutes } = calcDurations(state.today);
  wrap.innerHTML =
    createSection('☀️ 朝のレシピ', state.today.am, amMinutes, 'AM') +
    createSection('🌙 夜のレシピ', state.today.pm, pmMinutes, 'PM');

  wrap.querySelectorAll('[data-action="complete-all"]').forEach(b => b.addEventListener('click', () => onCompleteAll(b.dataset.time)));
  wrap.querySelectorAll('[data-action="share-section"]').forEach(b => b.addEventListener('click', () => onShareSection(b.dataset.time)));
  wrap.querySelectorAll('[data-action="add-item"]').forEach(b => b.addEventListener('click', () => onAddItem(b.dataset.time)));
}

function createSection(title, steps, minutes, tod) {
  const list = steps.filter(s => !s.hidden).map(s => {
    const p = masterInventory.find(i => i.id === s.productId);
    return `
      <li class="task-item flex items-center p-2 bg-white rounded-lg mb-2 shadow-sm">
        <input type="checkbox" class="task-checkbox flex-shrink-0 w-5 h-5 mr-3"/>
        <img src="${p?.image || 'https://placehold.co/80'}" class="w-10 h-10 rounded-md">
        <div class="ml-3">
          <p class="font-bold text-sm">${p?.name || s.stepType}</p>
          <p class="text-xs text-gray-500">${p?.category || s.stepType}</p>
        </div>
      </li>`;
  }).join('') || `<li class="text-sm text-gray-400 p-2">ステップがありません。</li>`;

  return `
    <div class="card p-5 mb-4 bg-white rounded-lg shadow">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-lg">${title}</h3>
        <span class="text-xs text-gray-500">目安 ${minutes}分</span>
      </div>
      <ul class="space-y-2">${list}</ul>
      <div class="mt-4 grid grid-cols-3 gap-2">
        <button class="btn-primary text-sm p-2 rounded-md" data-action="complete-all" data-time="${tod}">全て完了</button>
        <button class="btn-secondary text-sm p-2 rounded-md" data-action="share-section" data-time="${tod}">このレシピをシェア</button>
        <button class="btn-secondary text-sm p-2 rounded-md" data-action="add-item" data-time="${tod}">＋ アイテム追加</button>
      </div>
    </div>`;
}

// --- Recipe Actions ---
function applyYesterday() {
  if (state.history.length < 1) { alert('昨日のレシピはありません'); return; }
  const y = state.history[0];
  state.today.am = JSON.parse(JSON.stringify(y.am));
  state.today.pm = JSON.parse(JSON.stringify(y.pm));
  saveState();
  renderManual();
}

function applyPast() {
  if (state.history.length < 1) { alert('過去のレシピはありません'); return; }
  const choice = prompt(`過去のレシピ番号を入力 (1〜${state.history.length})`);
  const idx = parseInt(choice, 10) - 1;
  if (idx >= 0 && idx < state.history.length) {
    state.today.am = JSON.parse(JSON.stringify(state.history[idx].am));
    state.today.pm = JSON.parse(JSON.stringify(state.history[idx].pm));
    saveState();
    renderManual();
  }
}

function saveCurrentRecipe() {
  const name = prompt('このレシピの名前を入力してください');
  if (!name) return;
  state.savedRecipes.push({ id: uuid(), name, am: JSON.parse(JSON.stringify(state.today.am)), pm: JSON.parse(JSON.stringify(state.today.pm)) });
  saveState();
  alert('保存しました');
}

function onCompleteAll(time) {
  const container = document.getElementById('manual-container');
  const sectionSelector = time === 'AM' ? '.card:nth-of-type(1)' : '.card:nth-of-type(2)';
  const section = container.querySelector(sectionSelector);
  if (section) {
    section.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = true);
  }
}

function onShareSection(time) {
  const steps = (time === 'AM' ? state.today.am : state.today.pm).filter(s => !s.hidden);
  const lines = steps.map(s => {
    const p = masterInventory.find(m => m.id === s.productId);
    const label = p ? `${p.category}：${p.name}` : s.stepType;
    return `・${label}`;
  }).join('\n');
  const text = `${time}のレシピ\n${lines || '（ステップなし）'}`;
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('レシピをコピーしました'));
  }
}

function onAddItem(time) {
  const name = prompt('追加するアイテム名');
  if (!name) return;
  const category = prompt('カテゴリ（例：化粧水）');
  const id = uuid();
  masterInventory.push({ id, name, category, image: 'https://placehold.co/200x200/777/FFFFFF?text=+' });
  state.products.push({ id, wontUse: false, lowStock: false });
  if (time === 'AM') {
    state.today.am.push(step(category, id, 'AM'));
  } else {
    state.today.pm.push(step(category, id, 'PM'));
  }
  saveState();
  renderManual();
}

export default renderMainScreen;
