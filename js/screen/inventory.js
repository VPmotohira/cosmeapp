import { masterInventory } from '../data.js';

export default function renderInventoryScreen(container) {
    const itemsHTML = masterInventory.map(item => `
        <div class="text-center">
            <img src="${item.image}" alt="${item.name}" class="w-24 h-24 rounded-lg mx-auto shadow-md mb-2 border-2 border-white">
            <p class="font-bold text-sm">${item.name}</p>
            <p class="text-xs text-gray-500">${item.category}</p>
        </div>
    `).join('');
    container.innerHTML = `<div class="card"><h2>マイコスメ</h2><div class="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">${itemsHTML}</div></div>`;
}
