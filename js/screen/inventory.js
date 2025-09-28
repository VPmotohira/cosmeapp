// inventory.js
import { state, saveState } from '../state.js';
import { masterInventory } from '../data.js';
import { uuid } from '../data.js'; // 必要なユーティリティをインポート

const CATEGORIES = ['クレンジング', '洗顔', '化粧水', '美容液', '乳液', '日焼け止め', '酵素洗顔', 'その他'];

// 仮のカタログデータ（本来はdata.jsにあるべきかもしれません）
const catalog = [
    ...masterInventory,
    { id: 'cat001', name: 'イプサ ザ・タイムR アクア', category: '化粧水', image: 'https://placehold.co/200x200/2F80ED/FFFFFF?text=IP' },
    { id: 'cat002', name: 'キールズ クリーム UFC', category: '乳液', image: 'https://placehold.co/200x200/111/FFFFFF?text=K' },
];

function renderInventoryScreen(container) {
    container.innerHTML = `
      <div class="card bg-white p-5 rounded-lg shadow">
        <h2 class="flex items-center justify-between">
          <span>マイコスメ</span>
          <button id="inv-add" class="btn-primary text-sm p-2 rounded-md">＋ 追加</button>
        </h2>
        <input id="inv-search" type="search" placeholder="検索..." class="w-full border rounded px-3 py-1 text-sm mt-3" />
        <div id="inv-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"></div>
      </div>
      <div id="inv-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white w-full max-w-lg rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">コスメを追加</h3>
          <div id="cat-tabs" class="flex flex-wrap gap-2 mb-2"></div>
          <input id="cat-q" class="border rounded w-full px-3 py-2 text-sm mb-2" placeholder="商品名で絞り込み..." />
          <div id="cat-list" class="max-h-64 overflow-auto"></div>
          <button id="inv-modal-close" class="mt-4 w-full p-2 bg-gray-200 rounded-md">閉じる</button>
        </div>
      </div>
    `;

    const grid = container.querySelector('#inv-grid');
    const search = container.querySelector('#inv-search');
    const addBtn = container.querySelector('#inv-add');

    const render = () => {
        const q = (search.value || '').trim().toLowerCase();
        const ownedIds = new Set(state.products.map(p => p.id));
        const items = masterInventory.filter(m => ownedIds.has(m.id));
        const filtered = !q ? items : items.filter(m => [m.name, m.category].join(' ').toLowerCase().includes(q));

        grid.innerHTML = filtered.map(item => inventoryCardHTML(item)).join('') || `<p class="text-sm text-gray-500">コスメが登録されていません。</p>`;
        bindInventoryHandlers(grid, render);
    };

    search.addEventListener('input', render);
    addBtn.addEventListener('click', () => setupModal(container, render));
    render();
}

function inventoryCardHTML(item) {
    const prodState = state.products.find(p => p.id === item.id) || {};
    return `
        <div class="p-3 border rounded-lg">
            <p class="font-bold">${item.name}</p>
            <p class="text-sm text-gray-600">${item.category}</p>
            <div class="mt-2">
                <label class="flex items-center text-sm"><input type="checkbox" data-low="${item.id}" ${prodState.lowStock ? 'checked' : ''} class="mr-2"/>なくなりそう</label>
                <label class="flex items-center text-sm"><input type="checkbox" data-wont="${item.id}" ${prodState.wontUse ? 'checked' : ''} class="mr-2"/>もう使わない</label>
            </div>
        </div>
    `;
}

function bindInventoryHandlers(grid, render) {
    grid.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', () => {
            const id = chk.dataset.low || chk.dataset.wont;
            const key = chk.dataset.low ? 'lowStock' : 'wontUse';
            const prod = state.products.find(p => p.id === id);
            if (prod) {
                prod[key] = chk.checked;
                saveState();
                render(); 
            }
        });
    });
}

function setupModal(container, render) {
    const modal = container.querySelector('#inv-modal');
    modal.classList.remove('hidden');

    container.querySelector('#inv-modal-close').onclick = () => modal.classList.add('hidden');
    
    // This is a simplified version of your modal logic
    const list = container.querySelector('#cat-list');
    list.innerHTML = catalog.map(c => {
        const owned = state.products.some(p => p.id === c.id);
        return `
            <div class="flex justify-between items-center p-2 border-b">
                <span>${c.name}</span>
                <button data-add="${c.id}" class="text-sm p-1 rounded ${owned ? 'bg-gray-300' : 'bg-blue-500 text-white'}" ${owned ? 'disabled' : ''}>${owned ? '追加済' : '追加'}</button>
            </div>
        `;
    }).join('');

    list.querySelectorAll('button[data-add]').forEach(b => {
        b.addEventListener('click', () => {
            const id = b.dataset.add;
            if (!state.products.some(p => p.id === id)) {
                state.products.push({ id, wontUse: false, lowStock: false });
                saveState();
                b.textContent = '追加済';
                b.disabled = true;
                b.classList.add('bg-gray-300');
                b.classList.remove('bg-blue-500', 'text-white');
                render();
            }
        });
    });
}

export default renderInventoryScreen;
