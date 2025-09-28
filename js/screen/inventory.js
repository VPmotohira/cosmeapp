import { state, saveState } from '../state.js';
import { masterInventory } from '../data.js';
import { uuid } from '../data.js';

function renderInventoryScreen(container) {
  container.innerHTML = `
    <div class="p-1">
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">
          <button class="filter-chip active" data-filter="all">全て</button>
          <button class="filter-chip" data-filter="lowStock">なくなりそう</button>
        </div>
        <select id="sort-select" class="text-sm border rounded-md px-2 py-1">
          <option value="default">追加順</option>
          <option value="category">カテゴリ別</option>
          <option value="name">名前順</option>
        </select>
      </div>

      <div id="inv-grid" class="space-y-3">
        </div>
    </div>
    
    <button id="inv-add-fab" class="fixed bottom-20 right-5 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg text-2xl grid place-items-center">
      ＋
    </button>
  `;

  const grid = container.querySelector('#inv-grid');
  
  // 描画関数
  const render = () => {
    // TODO: ここにフィルターとソートのロジックを後で追加します
    const ownedIds = new Set(state.products.map(p => p.id));
    const items = masterInventory.filter(m => ownedIds.has(m.id));
    
    grid.innerHTML = items.map(item => inventoryCardHTML(item)).join('') 
      || `<p class="text-center text-gray-500 mt-8">コスメが登録されていません。<br>右下の「＋」ボタンから追加しましょう！</p>`;

    // カード内のボタンにイベントを設定
    bindInventoryCardHandlers(grid);
  };

  // FAB（フローティングアクションボタン）にイベントを設定
  container.querySelector('#inv-add-fab').addEventListener('click', () => {
    alert('ここに新しいコスメを追加するモーダル画面を実装します。');
  });

  // 初回描画
  render();
}

function inventoryCardHTML(item) {
  const productState = state.products.find(p => p.id === item.id) || {};
  const categoryColor = getCategoryColor(item.category);

  return `
    <div class="inventory-card bg-white rounded-xl shadow-sm p-3 flex gap-4">
      <div class="w-20 h-20 bg-gray-100 rounded-lg grid place-items-center flex-shrink-0">
        <i class="fas fa-camera text-gray-300 text-2xl"></i>
      </div>

      <div class="flex-grow min-w-0">
        <div class="flex items-start justify-between">
          <div>
            <span class="category-tag text-xs font-semibold px-2 py-0.5 rounded-full" style="background-color:${categoryColor.bg}; color:${categoryColor.text};">
              ${item.category}
            </span>
            <h3 class="font-bold text-base mt-1 truncate">${item.name}</h3>
          </div>
          <button class="item-menu-button" data-id="${item.id}"><i class="fas fa-ellipsis-v text-gray-400"></i></button>
        </div>
        
        <div class="flex gap-2 mt-1">
          ${productState.lowStock ? `<span class="status-tag bg-red-100 text-red-800">なくなりそう</span>` : ''}
          ${productState.wontUse ? `<span class="status-tag bg-gray-200 text-gray-600">もう使わない</span>` : ''}
        </div>
        
        <div class="mt-2 text-right">
          <a href="#" class="store-link-button text-sm inline-flex items-center gap-2 text-blue-500 font-semibold" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-shopping-cart"></i>
            <span>オンラインストア</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

function bindInventoryCardHandlers(grid) {
  grid.querySelectorAll('.item-menu-button').forEach(button => {
    button.addEventListener('click', () => {
      // TODO: ここに「…」メニューの表示ロジックを実装します
      alert('ここで「なくなりそう」などのステータスを変更できるようにします。');
    });
  });
}

function getCategoryColor(category) {
    const colors = {
        'クレンジング': { bg: '#FFFBEB', text: '#B45309' }, // amber
        '洗顔': { bg: '#EFF6FF', text: '#1D4ED8' }, // blue
        '化粧水': { bg: '#E0F2FE', text: '#0284C7' }, // sky
        '美容液': { bg: '#FCE7F3', text: '#BE185D' }, // pink
        '乳液': { bg: '#F3E8FF', text: '#7E22CE' }, // purple
        '日焼け止め': { bg: '#FEF2F2', text: '#DC2626' }, // red
        'デフォルト': { bg: '#F3F4F6', text: '#4B5563' } // gray
    };
    return colors[category] || colors['デフォルト'];
}

export default renderInventoryScreen;
