import { state } from '../main.js';
import { masterInventory } from '../data.js';

export default function renderMainScreen(container) {
    container.innerHTML = `
        <div class="condition-chips">
            <div class="chip-group"><label>肌:</label><div class="chips" data-group="skin"><button data-value="bad">荒れ</button><button data-value="normal">普通</button><button data-value="good">良い</button></div></div>
            <div class="chip-group"><label>メイク:</label><div class="chips" data-group="makeup"><button data-value="yes">あり</button><button data-value="no">なし</button></div></div>
            <div class="chip-group"><label>外出:</label><div class="chips" data-group="outing"><button data-value="yes">あり</button><button data-value="no">なし</button></div></div>
        </div>
        <div id="recalculating-feedback" class="text-center text-sm text-gray-500 mb-4 h-5 transition-opacity duration-300"></div>
        <div id="manual-container"></div>
    `;

    container.querySelectorAll('.chips').forEach(div => {
        div.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                state.dailyConditions[e.currentTarget.dataset.group] = e.target.dataset.value;
                localStorage.setItem('dailyConditions', JSON.stringify(state.dailyConditions));
                updateConditionUI();
                showRecalculatingFeedbackAndRender();
            }
        });
    });

    updateConditionUI();
    renderManual();
}

function renderManual() {
    const container = document.getElementById('manual-container');
    if (!container) return;
    const morningItems = getRoutineItemsFor('morning');
    const eveningItems = getRoutineItemsFor('evening');
    container.innerHTML = createRoutineSectionHTML('☀️ 朝のレシピ', morningItems) + createRoutineSectionHTML('🌙 夜のレシピ', eveningItems);
}

function createRoutineSectionHTML(title, items) {
    if (items.length === 0) return '';
    const itemsHTML = items.map(item => createTaskItemHTML(item)).join('');
    return `<div class="card p-5 mb-4"><h3 class="font-bold text-lg mb-4">${title}</h3>${itemsHTML}</div>`;
}

function createTaskItemHTML(item) {
    // ... (HTML generation logic)
    return `<div class="task-item">...</div>`;
}

function updateConditionUI() {
    const container = document.getElementById('main-screen');
    if (!container) return;
    container.querySelectorAll('.chips').forEach(div => {
        div.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.value === state.dailyConditions[div.dataset.group]);
        });
    });
}

function showRecalculatingFeedbackAndRender() {
    const feedbackEl = document.getElementById('recalculating-feedback');
    if(!feedbackEl) return;
    feedbackEl.textContent = 'レシピを再計算中...';
    setTimeout(() => {
        feedbackEl.textContent = '';
        renderManual();
    }, 300);
}

function getRoutineItemsFor(time) {
    let items = [];
    const { skin, makeup, outing } = state.dailyConditions;
    if (time === 'morning') {
        items.push(masterInventory.find(i => i.id === 'item2'));
        items.push(masterInventory.find(i => i.id === 'item4'));
        if (skin === 'bad') items.push(masterInventory.find(i => i.id === 'item5'));
        items.push(masterInventory.find(i => i.id === 'item6'));
        if (outing === 'yes') items.push(masterInventory.find(i => i.id === 'item7'));
    } else {
        if (makeup === 'yes') items.push(masterInventory.find(i => i.id === 'item1'));
        if (skin !== 'bad' && new Date().getDay() % 3 === 0) items.push(masterInventory.find(i => i.id === 'item3'));
        else items.push(masterInventory.find(i => i.id === 'item2'));
        items.push(masterInventory.find(i => i.id === 'item4'));
        if (skin === 'bad') items.push(masterInventory.find(i => i.id === 'item5'));
        items.push(masterInventory.find(i => i.id === 'item6'));
    }
    return items.filter(Boolean);
}
