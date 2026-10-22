/**
 * MASOHI PRIVATE LIMITED — LEAD GENERATION & FORMS ENGINE
 * Handles multi-audience validation, real-time feedback, submission simulation,
 * and state resets.
 */

document.addEventListener('DOMContentLoaded', () => {
  initEnquiryForms();
  initAudiencePickers();
});

function initAudiencePickers() {
  const audienceSelects = document.querySelectorAll('[name="audience"], [name="userType"]');
  audienceSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      const form = e.target.closest('form');
      if (!form) return;
      
      const studentFields = form.querySelectorAll('.audience-field-student');
      const institutionFields = form.querySelectorAll('.audience-field-institution');
      const facultyFields = form.querySelectorAll('.audience-field-faculty');
      const industryFields = form.querySelectorAll('.audience-field-industry');

      // Hide all specific fields first
      [...studentFields, ...institutionFields, ...facultyFields, ...industryFields].forEach(f => f.style.display = 'none');

      // Show based on selection
      const val = e.target.value.toLowerCase();
      if (val === 'student') studentFields.forEach(f => f.style.display = 'block');
      else if (val === 'institution') institutionFields.forEach(f => f.style.display = 'block');
      else if (val === 'faculty') facultyFields.forEach(f => f.style.display = 'block');
      else if (val === 'industry') industryFields.forEach(f => f.style.display = 'block');
    });
  });
}

function initEnquiryForms() {
  const forms = document.querySelectorAll('form[data-validate-form]');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!validateForm(form)) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>
          Processing...
        `;
      }

      // Collect form data
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // Simulate asynchronous API / CRM webhook call
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success state
        if (window.showToast) {
          window.showToast('Thank you! Your enquiry has been received. Our academic team will get in touch shortly.', 'success');
        }

        form.reset();
        clearFormErrors(form);

        // If in modal, close modal after short delay
        const modal = form.closest('.modal-backdrop');
        if (modal && window.ModalManager) {
          setTimeout(() => {
            window.ModalManager.close(modal.id);
          }, 1200);
        }

      } catch (err) {
        if (window.showToast) {
          window.showToast('Failed to submit enquiry. Please check connection and try again.', 'error');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });

    // Clear error on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorEl = form.querySelector(`[data-error-for="${input.name}"]`);
        if (errorEl) errorEl.classList.remove('visible');
      });
    });
  });
}

function validateForm(form) {
  let isValid = true;
  clearFormErrors(form);

  const requiredInputs = form.querySelectorAll('[required]');
  requiredInputs.forEach(input => {
    const val = input.value.trim();
    if (!val) {
      showError(form, input, 'This field is required.');
      isValid = false;
      return;
    }

    if (input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        showError(form, input, 'Please enter a valid email address.');
        isValid = false;
      }
    }

    if (input.name === 'phone' || input.name === 'contactNumber') {
      const phoneClean = val.replace(/[\s\-\+\(\)]/g, '');
      if (phoneClean.length < 8 || phoneClean.length > 15) {
        showError(form, input, 'Please enter a valid phone/contact number.');
        isValid = false;
      }
    }
  });

  return isValid;
}

function showError(form, input, message) {
  input.classList.add('error');
  const errorEl = form.querySelector(`[data-error-for="${input.name}"]`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function clearFormErrors(form) {
  form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.form-error-text').forEach(el => el.classList.remove('visible'));
}

// Add spinning keyframe dynamically
const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
