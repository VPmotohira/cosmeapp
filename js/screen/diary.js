import { pastRecipes, masterInventory } from '../data.js';

export default function renderDiaryScreen(container) {
    const diaryHTML = pastRecipes.map(recipe => {
        const itemImages = recipe.items.map(itemId => {
            const item = masterInventory.find(i => i.id === itemId);
            return `<img src="${item.image}" class="w-10 h-10 rounded-full object-cover border-2 border-white -ml-2 first:ml-0">`;
        }).join('');
        return `
            <div class="bg-white rounded-2xl shadow-lg p-5 mb-6">
                <p class="text-sm font-semibold text-gray-400 mb-2">${recipe.date}</p>
                <h3 class="text-xl font-bold" style="color: var(--ink-primary);">肌モード: ${recipe.mode}</h3>
                <div class="border-t border-gray-100 pt-3 mt-3">
                    <p class="text-xs font-bold text-gray-400 mb-2">${recipe.routine}</p>
                    <div class="flex items-center pl-2">${itemImages}</div>
                </div>
            </div>`;
    }).join('');
    container.innerHTML = `<div>${diaryHTML}</div>`;
}
