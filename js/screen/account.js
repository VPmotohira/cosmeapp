// account.js

function renderAccountScreen(container) {
    container.innerHTML = `
        <div class="card bg-white p-5 rounded-lg shadow">
            <h2 class="text-xl font-bold mb-3">アカウント</h2>
            <p class="text-sm text-gray-500">サインアップ不要で利用できます</p>
        </div>
    `;
}

export default renderAccountScreen;
