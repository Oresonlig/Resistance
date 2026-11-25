/* =========================================================================
   The Chain — sektionssida (/diet/, /misc/). 3.97.0.
   Spärren gäller HÄR också, inte bara på landningssidan: utloggad eller utan
   åtkomst → tillbaka till landningssidan med ?enter=<sektion>, där inloggning
   eller "no access" visas. Sektionens DATA skyddas av RLS (has_section_access).
   ========================================================================= */
(() => {
  'use strict';
  if (!window.TC) return;
  const { Auth, SECTIONS, seedParticles } = window.TC;
  const root = document.getElementById('tc');
  const key = root.dataset.section;
  const back = () => location.replace('/?enter=' + encodeURIComponent(key));

  (async () => {
    const user = await Auth.getUser();
    if (!user) return back();
    const access = await Auth.getAccess();
    if (!access.includes(key)) return back();

    document.querySelectorAll('[data-bind="email"]').forEach((el) => { el.textContent = user.email; });
    document.querySelectorAll('[data-bind="initial"]').forEach((el) => { el.textContent = user.email.charAt(0).toUpperCase(); });
    document.querySelectorAll('[data-bind="desc"]').forEach((el) => { el.textContent = SECTIONS[key].desc; });
    root.removeAttribute('data-checking');
    seedParticles();
  })();

  root.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-action="sign-out"]');
    if (!el) return;
    await Auth.signOut();
    location.href = '/';
  });
})();
