/* Casual preview gate only. Direct build URLs and public repository files remain accessible. */
(() => {
  'use strict';
  const passwordHash = '2eacca6d49b2edc8ee70bcd61e4317fcea7fb2da4779c13e2465a848ffb07ae8';
  const sessionKey = 'tranquility-preview-v1';
  const gate = document.getElementById('gate');
  const experiences = document.getElementById('experiences');
  const input = document.getElementById('password');
  const error = document.getElementById('gate-error');
  const form = document.getElementById('unlock-form');
  const submit = form.querySelector('button');
  function display(unlocked, focus = false) {
    gate.hidden = unlocked;
    experiences.hidden = !unlocked;
    if (focus) document.getElementById(unlocked ? 'choose-title' : 'password').focus();
  }
  function remember(unlocked) {
    try { if (unlocked) sessionStorage.setItem(sessionKey, passwordHash); else sessionStorage.removeItem(sessionKey); } catch { /* Gate still works without storage. */ }
  }
  let remembered = false;
  try { remembered = sessionStorage.getItem(sessionKey) === passwordHash; } catch { /* Start locked. */ }
  display(remembered);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    submit.disabled = true;
    error.textContent = '';
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
      const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (actual === passwordHash) { remember(true); input.value = ''; display(true, true); }
      else { error.textContent = 'That password was not recognised. Please try again.'; input.select(); }
    } catch { error.textContent = 'Unable to check the password. Please open this page over HTTPS in a current browser.'; }
    finally { submit.disabled = false; }
  });
  document.getElementById('lock').addEventListener('click', () => {
    remember(false); input.value = ''; error.textContent = ''; display(false, true);
  });
  window.addEventListener('pageshow', () => {
    try { display(sessionStorage.getItem(sessionKey) === passwordHash); } catch { /* Keep current state. */ }
  });
})();
