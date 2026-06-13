import { translateCatSignal } from './translator.js';

const form = document.querySelector('#translator-form');
const moodBadge = document.querySelector('#mood-badge');
const resultTitle = document.querySelector('#result-title');
const resultMessage = document.querySelector('#result-message');
const resultTips = document.querySelector('#result-tips');
const historyList = document.querySelector('#history-list');
const history = [];

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const result = translateCatSignal(data);
  renderResult(result);
  addHistory(data.catName || '猫咪', result);
});

function renderResult(result) {
  moodBadge.textContent = result.mood;
  moodBadge.dataset.level = result.stressScore >= 4 ? 'alert' : 'calm';
  resultTitle.textContent = result.title;
  resultMessage.textContent = result.message;
  resultTips.innerHTML = result.tips.map((tip) => `<li>${tip}</li>`).join('');
}

function addHistory(catName, result) {
  history.unshift({ catName: catName.trim() || '猫咪', result, time: new Date() });
  const latest = history.slice(0, 5);
  historyList.innerHTML = latest
    .map((item) => {
      const time = item.time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return `
        <article class="history-item">
          <div>
            <strong>${escapeHtml(item.catName)}</strong>
            <span>${time}</span>
          </div>
          <p>${escapeHtml(item.result.mood)}｜${escapeHtml(item.result.title)}</p>
        </article>
      `;
    })
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#039;');
}
