/* ──────────────────────────────────────────────────────────────────
   kenTom · supporting pages — theme toggle + tiny helpers
   ────────────────────────────────────────────────────────────────── */
(function () {
  const root = document.documentElement;
  const KEY = 'kentom-theme';
  function apply(t) {
    root.setAttribute('data-theme', t);
    const lbl = document.getElementById('themeLabel');
    if (lbl) lbl.textContent = (t === 'dark') ? 'Light' : 'Dark';
  }
  // boot theme
  let saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved || 'dark');

  function bindToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn || btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggle);
  } else {
    bindToggle();
  }
})();
