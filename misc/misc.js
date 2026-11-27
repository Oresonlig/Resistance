/* =========================================================================
   The Chain — /misc/ (3.101.0). Visar Admin-rutan bara för admin-kontot.
   Bara UI: adminsidans data skyddas av servern (admin_list_access / admin_set_access).
   ========================================================================= */
(() => {
  'use strict';
  const ADMIN_EMAIL = 'niklgron@gmail.com';   // samma som DEMO_EMAIL i landing.js och admin.js
  window.addEventListener('tc:ready', (e) => {
    const email = ((e.detail && e.detail.email) || '').toLowerCase();
    const tile = document.querySelector('[data-admin]');
    if (tile) tile.hidden = email !== ADMIN_EMAIL;
  });
})();
