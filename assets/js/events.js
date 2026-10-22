/**
 * MASOHI PRIVATE LIMITED — EVENTS & WORKSHOPS ENGINE
 */

let allEvents = [];
let activeEventType = 'All';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('events-container');
  if (container) {
    loadEvents();
    initEventFilters();
  }
  initPosterLightbox();
});

async function loadEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  try {
    const response = await fetch('assets/data/events.json');
    allEvents = await response.json();
    renderEvents();
  } catch (error) {
    console.error('Error loading events:', error);
    container.innerHTML = `<p style="color: var(--color-error-500); text-align: center;">Failed to load events.</p>`;
  }
}

function initEventFilters() {
  const filterPills = document.querySelectorAll('[data-event-filter]');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeEventType = pill.getAttribute('data-event-filter');
      renderEvents();
    });
  });
}

function initPosterLightbox() {
  const lightbox = document.getElementById('poster-lightbox');
  if (!lightbox) return;

  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDownloadLink = document.getElementById('lightbox-download-link');
  const closeBtn = document.getElementById('lightbox-close-btn');

  function openLightbox(src, title) {
    if (!lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = title || 'Event Poster';
    if (lightboxTitle) lightboxTitle.textContent = title || 'Event Poster Preview';
    if (lightboxDownloadLink) {
      lightboxDownloadLink.href = src;
      lightboxDownloadLink.setAttribute('download', (title || 'Event_Poster').replace(/\s+/g, '_') + '.png');
    }
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Delegate clicks for static and dynamically added triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox-trigger]');
    if (trigger) {
      e.preventDefault();
      const src = trigger.getAttribute('data-lightbox-trigger');
      const title = trigger.getAttribute('data-lightbox-title');
      openLightbox(src, title);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

function renderEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  const filtered = allEvents.filter(ev => {
    if (activeEventType === 'All') return true;
    return ev.type.toLowerCase().includes(activeEventType.toLowerCase());
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--color-border-medium);">
        <h4>No events found for this category</h4>
        <p style="color: var(--color-text-muted); font-size: 0.875rem;">Check back soon for new scheduled sessions.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(ev => {
    const isFeatured = ev.isFeatured ? `style="border: 2px solid rgba(6, 182, 212, 0.45); background: linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%);"` : '';
    const featuredBadge = ev.isFeatured ? `<span class="badge badge-emerald" style="font-weight: 700;">⭐ Flagship Upcoming</span>` : '';
    
    // Poster buttons if present
    const posterButtons = ev.posters ? `
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary btn-xs" data-lightbox-trigger="${ev.posters.overview}" data-lightbox-title="Programme Overview — ${ev.title}">
          🖼️ Overview Poster
        </button>
        <button type="button" class="btn btn-secondary btn-xs" data-lightbox-trigger="${ev.posters.schedule}" data-lightbox-title="Day-wise Schedule — ${ev.title}">
          📅 Schedule Poster
        </button>
      </div>
    ` : '';

    // Action button
    const actionButtons = ev.registerUrl ? `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <a href="${ev.registerUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="white-space: nowrap; text-align: center;">
          Register Now ↗
        </a>
        <button class="btn btn-secondary btn-xs" data-modal-target="modal-enquiry" data-modal-title="Enquiry: ${ev.title}" data-modal-context="Event: ${ev.title}">
          Quick Enquiry
        </button>
      </div>
    ` : `
      <div>
        <button class="btn btn-primary btn-sm" data-modal-target="modal-enquiry" data-modal-title="Register for: ${ev.title}" data-modal-context="Event: ${ev.title}">
          Register Now
        </button>
      </div>
    `;

    return `
      <div class="event-card reveal active" ${isFeatured}>
        <div class="event-date-box" ${ev.isFeatured ? 'style="background: #ECFEFF; border-color: #A5F3FC;"' : ''}>
          <div class="event-day" ${ev.isFeatured ? 'style="color: #0891B2;"' : ''}>${ev.day}</div>
          <div class="event-month">${ev.month}</div>
        </div>

        <div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
            ${featuredBadge}
            <span class="badge badge-cyan">${ev.type}</span>
            <span class="badge badge-blue">👥 ${ev.audience}</span>
          </div>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; line-height: 1.35;">${ev.title}</h3>
          <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">${ev.description}</p>
          
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--color-text-body); margin-bottom: 0.5rem;">
            <span>⏱️ <strong>Duration:</strong> ${ev.duration}</span>
            <span>📍 <strong>Mode:</strong> ${ev.mode}</span>
          </div>

          ${posterButtons}
        </div>

        <div>
          ${actionButtons}
        </div>
      </div>
    `;
  }).join('');
}

