/**
 * MASOHI PRIVATE LIMITED — PROGRAMS CATALOGUE ENGINE
 * Handles dynamic rendering, search, category filtering, and program modal details.
 */

let allPrograms = [];
let activeCategory = 'All';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('programs-grid');
  if (container) {
    loadPrograms();
    initFilterListeners();
  }
});

async function loadPrograms() {
  const container = document.getElementById('programs-grid');
  if (!container) return;

  try {
    const response = await fetch('assets/data/programs.json');
    allPrograms = await response.json();
    renderPrograms();
  } catch (error) {
    console.error('Error loading programs:', error);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <p style="color: var(--color-error-500);">Failed to load programs. Please refresh the page.</p>
      </div>
    `;
  }
}

function initFilterListeners() {
  // Search input
  const searchInput = document.getElementById('program-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderPrograms();
    });
  }

  // Category tabs
  const tabs = document.querySelectorAll('[data-category-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category-tab');
      renderPrograms();
    });
  });
}

function renderPrograms() {
  const container = document.getElementById('programs-grid');
  const countEl = document.getElementById('programs-count');
  if (!container) return;

  const filtered = allPrograms.filter(prog => {
    const matchesCategory = activeCategory === 'All' || prog.category === activeCategory;
    const matchesSearch = !searchQuery || 
      prog.title.toLowerCase().includes(searchQuery) ||
      prog.description.toLowerCase().includes(searchQuery) ||
      prog.skills.some(s => s.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${allPrograms.length} Programs`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--color-border-medium);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" style="margin: 0 auto 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h4 style="margin-bottom: 0.5rem;">No matching programs found</h4>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">Try adjusting your search terms or select another category.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetFilters()" style="margin-top: 1rem;">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(prog => `
    <div class="card program-card reveal active">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
          <span class="badge badge-blue">${prog.category}</span>
          ${prog.internshipEnabled ? `<span class="badge badge-emerald">Internship Enabled</span>` : ''}
        </div>
        <h3 style="font-size: 1.25rem; margin-top: 0.85rem; margin-bottom: 0.5rem; line-height: 1.35;">${prog.title}</h3>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 1rem;">${prog.shortDescription}</p>
        
        <div class="program-meta">
          <span class="badge badge-dark" style="color: var(--color-primary-950); background: var(--color-bg-muted); border-color: var(--color-border-subtle);">⏱️ ${prog.duration}</span>
          <span class="badge badge-dark" style="color: var(--color-primary-950); background: var(--color-bg-muted); border-color: var(--color-border-subtle);">📊 ${prog.level}</span>
          <span class="badge badge-dark" style="color: var(--color-primary-950); background: var(--color-bg-muted); border-color: var(--color-border-subtle);">💻 ${prog.mode}</span>
        </div>

        <div style="margin-top: 1rem;">
          <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Skills Covered:</span>
          <div class="program-skills">
            ${prog.skills.slice(0, 5).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            ${prog.skills.length > 5 ? `<span class="skill-tag">+${prog.skills.length - 5} more</span>` : ''}
          </div>
        </div>
      </div>

      <div class="program-footer">
        <button class="btn btn-outline btn-sm" onclick="openProgramDetails('${prog.id}')">
          View Program
        </button>
        <button class="btn btn-primary btn-sm" data-modal-target="modal-enquiry" data-modal-title="Enquire About: ${prog.title}" data-modal-context="Program: ${prog.title}">
          Enquire Now
        </button>
      </div>
    </div>
  `).join('');
}

function resetFilters() {
  const searchInput = document.getElementById('program-search');
  if (searchInput) searchInput.value = '';
  searchQuery = '';
  activeCategory = 'All';
  document.querySelectorAll('[data-category-tab]').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-category-tab') === 'All');
  });
  renderPrograms();
}
window.resetFilters = resetFilters;

function openProgramDetails(progId) {
  const prog = allPrograms.find(p => p.id === progId);
  if (!prog) return;

  const titleEl = document.getElementById('modal-prog-title');
  const catEl = document.getElementById('modal-prog-cat');
  const descEl = document.getElementById('modal-prog-desc');
  const durationEl = document.getElementById('modal-prog-duration');
  const levelEl = document.getElementById('modal-prog-level');
  const modeEl = document.getElementById('modal-prog-mode');
  const skillsListEl = document.getElementById('modal-prog-skills');
  const projectsListEl = document.getElementById('modal-prog-projects');
  const ctaBtn = document.getElementById('modal-prog-cta');

  if (titleEl) titleEl.textContent = prog.title;
  if (catEl) catEl.textContent = prog.category;
  if (descEl) descEl.textContent = prog.description;
  if (durationEl) durationEl.textContent = prog.duration;
  if (levelEl) levelEl.textContent = prog.level;
  if (modeEl) modeEl.textContent = prog.mode;

  if (skillsListEl) {
    skillsListEl.innerHTML = prog.skills.map(s => `<span class="skill-tag" style="padding: 0.35rem 0.75rem; font-size: 0.825rem;">${s}</span>`).join('');
  }

  if (projectsListEl) {
    projectsListEl.innerHTML = prog.projects.map(p => `<li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 0.35rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ${p}</li>`).join('');
  }

  if (ctaBtn) {
    ctaBtn.setAttribute('data-modal-title', `Enquire About: ${prog.title}`);
    ctaBtn.setAttribute('data-modal-context', `Program: ${prog.title}`);
  }

  window.ModalManager.open('modal-program-details');
}
window.openProgramDetails = openProgramDetails;
