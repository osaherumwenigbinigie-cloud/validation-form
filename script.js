const form       = document.getElementById('signup-form');
const successMsg = document.getElementById('form-success');
const fields     = Array.from(form.querySelectorAll('[name]'));

/* ---------------------------------------------------------
   Validation rules — each returns an error string or ''
--------------------------------------------------------- */
const rules = {
  username(value) {
    const v = value.trim();
    if (!v) return 'Username is required.';
    if (v.length < 3) return 'Username must be at least 3 characters.';
    if (v.length > 20) return 'Username must be 20 characters or fewer.';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers and underscores.';
    return '';
  },

  email(value) {
    const v = value.trim();
    if (!v) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
    return '';
  },

  password(value) {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-z]/i.test(value)) return 'Password must contain a letter.';
    if (!/\d/.test(value)) return 'Password must contain a number.';
    return '';
  },

  confirmPassword(value) {
    if (!value) return 'Please confirm your password.';
    if (value !== form.elements.password.value) return 'Passwords do not match.';
    return '';
  },

  terms(checked) {
    if (!checked) return 'You must accept the terms to continue.';
    return '';
  }
};

/* Get the comparable value (checkbox → boolean) */
const valueOf = field => field.type === 'checkbox' ? field.checked : field.value;

/* ---------------------------------------------------------
   Validate one field and paint the UI
--------------------------------------------------------- */
function validateField(field) {
  const message  = rules[field.name](valueOf(field));
  const wrapper  = field.closest('.field');
  const errorEl  = document.getElementById(`${field.name}-error`);

  errorEl.textContent = message;
  wrapper.classList.toggle('has-error', Boolean(message));
  field.setAttribute('aria-invalid', message ? 'true' : 'false');

  return !message;           // true = valid
}

/* ---------------------------------------------------------
   Event wiring
--------------------------------------------------------- */
fields.forEach(field => {
  if (field.type === 'checkbox') {
    field.addEventListener('change', () => validateField(field));
    return;
  }

  // Validate when the user leaves the field...
  field.addEventListener('blur', () => validateField(field));

  // ...then re-validate live, but only once it's already showing an error
  field.addEventListener('input', () => {
    if (field.closest('.field').classList.contains('has-error')) {
      validateField(field);
    }
  });
});

// Keep "confirm password" in sync when the password changes
form.elements.password.addEventListener('input', () => {
  if (form.elements.confirmPassword.value) {
    validateField(form.elements.confirmPassword);
  }
});

/* ---------------------------------------------------------
   Submit
--------------------------------------------------------- */
form.addEventListener('submit', event => {
  event.preventDefault();
  successMsg.hidden = true;

  let firstInvalid = null;

  fields.forEach(field => {
    if (!validateField(field) && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    firstInvalid.focus();

    // restart the shake animation
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');

    return;
  }

  // ✅ Valid — do whatever you need here (fetch, redirect, etc.)
  successMsg.hidden = false;
  form.reset();

  // clear any leftover error styling
  fields.forEach(field => {
    field.closest('.field').classList.remove('has-error');
    document.getElementById(`${field.name}-error`).textContent = '';
  });
});