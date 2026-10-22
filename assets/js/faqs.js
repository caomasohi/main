/**
 * MASOHI PRIVATE LIMITED — FAQ ACCORDION ENGINE
 */

let allFaqs = [];
let activeFaqCategory = 'All';
let faqSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('faq-accordion-container');
  if (container) {
    loadFaqs();
    initFaqFilters();
  }
});

async function loadFaqs() {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  try {
    const response = await fetch('assets/data/faqs.json');
    allFaqs = await response.json();
    renderFaqs();
  } catch (error) {
    console.error('Error loading FAQs:', error);
    container.innerHTML = `<p style="color: var(--color-error-500); text-align: center;">Failed to load FAQs.</p>`;
  }
}

function initFaqFilters() {
  const tabs = document.querySelectorAll('[data-faq-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFaqCategory = tab.getAttribute('data-faq-tab');
      renderFaqs();
    });
  });

  const searchInput = document.getElementById('faq-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      faqSearchQuery = e.target.value.toLowerCase().trim();
      renderFaqs();
    });
  }
}

function renderFaqs() {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  const filtered = allFaqs.filter(faq => {
    const matchesCategory = activeFaqCategory === 'All' || faq.category.toLowerCase() === activeFaqCategory.toLowerCase();
    const matchesSearch = !faqSearchQuery || 
      faq.question.toLowerCase().includes(faqSearchQuery) || 
      faq.answer.toLowerCase().includes(faqSearchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--color-border-medium);">
        <h4>No matching questions found</h4>
        <p style="color: var(--color-text-muted); font-size: 0.875rem;">Try another keyword or category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((faq, index) => `
    <div class="faq-item" id="faq-item-${faq.id}">
      <button class="faq-trigger" aria-expanded="false" aria-controls="faq-content-${faq.id}" onclick="toggleFaq('faq-item-${faq.id}')">
        <span>${faq.question}</span>
        <div class="faq-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </button>
      <div class="faq-content" id="faq-content-${faq.id}">
        <p>${faq.answer}</p>
      </div>
    </div>
  `).join('');
}

function toggleFaq(itemId) {
  const item = document.getElementById(itemId);
  if (!item) return;

  const isActive = item.classList.contains('active');
  
  // Optional: close other open items
  document.querySelectorAll('.faq-item.active').forEach(el => {
    if (el !== item) {
      el.classList.remove('active');
      const trigger = el.querySelector('.faq-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  });

  item.classList.toggle('active', !isActive);
  const trigger = item.querySelector('.faq-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', String(!isActive));
}

window.toggleFaq = toggleFaq;
