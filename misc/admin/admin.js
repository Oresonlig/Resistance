/* =========================================================================
   The Chain — /misc/admin/ (3.101.0). Sektionsåtkomst per konto.
   Läser admin_list_access(), sparar ändrade rader med admin_set_access(user, nya, väntade).
   CAS: "väntade" = raderna sidan visade; har de ändrats sedan dess (annan flik) nekar
   servern med 'conflict' och listan laddas om. Klientspärren är bara bekvämlighet —
   servern svarar "not authorized" till alla utom ADMIN_EMAIL (MK1\SQL_ADMIN_ACCESS.sql).
   ========================================================================= */
(() => {
  'use strict';
  if (!window.TC) return;
  const ADMIN_EMAIL = 'niklgron@gmail.com';   // samma som DEMO_EMAIL i landing.js och misc.js
  const { sb, SECTIONS } = window.TC;
  const $ = (id) => document.getElementById(id);

  let me = '';
  let sections = [];   // [{ id, open_to_all }] i SECTIONS-ordning
  let users = [];      // [{ id, email, created_at, last_sign_in_at, orig: string[], cur: Set }]
  let saving = false;

  const sameSet = (a, set) => a.length === set.size && a.every((s) => set.has(s));
  const dirtyUsers = () => users.filter((u) => !sameSet(u.orig, u.cur));
  const nameOf = (id) => (SECTIONS[id] ? SECTIONS[id].name : id);
  const day = (iso) => (iso ? iso.slice(0, 10) : 'never');

  function msg(el, text, kind) {
    el.textContent = text || '';
    if (kind) el.dataset.kind = kind; else delete el.dataset.kind;
  }

  function errText(error) {
    const m = (error && error.message) || String(error);
    if (/not authorized/i.test(m)) return 'Not authorized.';
    if (/could not find the function|does not exist|PGRST202/i.test(m)) return 'Admin functions are missing in the database (run SQL_ADMIN_ACCESS.sql).';
    if (/conflict/i.test(m)) return 'Changed elsewhere since you loaded the page.';
    if (/lock you out/i.test(m)) return 'You can\'t remove Misc from your own account.';
    return m;
  }

  function updateBar() {
    const n = dirtyUsers().length;
    const save = $('ad-save');
    save.disabled = saving || n === 0;
    save.textContent = saving ? 'Saving…' : n ? `Save changes (${n})` : 'Save changes';
  }

  function render() {
    const list = $('ad-list');
    list.textContent = '';
    const editable = sections.filter((s) => !s.open_to_all);
    const open = sections.filter((s) => s.open_to_all).map((s) => nameOf(s.id));
    document.querySelector('[data-bind="open"]').textContent =
      open.length ? `${open.join(', ')}: open to every account.` : '';

    for (const u of users) {
      const row = document.createElement('div');
      row.className = 'ad-row';
      row.toggleAttribute('data-dirty', !sameSet(u.orig, u.cur));

      const who = document.createElement('div');
      who.className = 'ad-who';
      const email = document.createElement('span');
      email.className = 'ad-email';
      email.textContent = u.email || u.id;
      const meta = document.createElement('span');
      meta.className = 'ad-meta';
      meta.textContent = `Joined ${day(u.created_at)} · Last sign-in ${day(u.last_sign_in_at)}`;
      who.append(email, meta);

      const chips = document.createElement('div');
      chips.className = 'ad-chips';
      for (const s of editable) {
        const label = document.createElement('label');
        label.className = 'ad-chip';
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = u.cur.has(s.id);
        // Adminsidan ligger i Misc: ta inte bort den från dig själv (servern nekar också).
        const selfMisc = s.id === 'misc' && (u.email || '').toLowerCase() === me && u.cur.has('misc');
        box.disabled = saving || selfMisc;
        if (selfMisc) label.title = 'Admin lives in Misc';
        box.addEventListener('change', () => {
          if (box.checked) u.cur.add(s.id); else u.cur.delete(s.id);
          row.toggleAttribute('data-dirty', !sameSet(u.orig, u.cur));
          msg($('ad-status'), '');
          updateBar();
        });
        label.append(box, document.createTextNode(nameOf(s.id)));
        chips.append(label);
      }
      row.append(who, chips);
      list.append(row);
    }
    $('ad-bar').hidden = users.length === 0;
    updateBar();
  }

  async function load() {
    const { data, error } = await sb.rpc('admin_list_access');
    if (error || !data) {
      msg($('ad-load'), `Couldn't load accounts. ${errText(error)}`, 'err');
      users = [];
      render();
      return false;
    }
    const order = Object.keys(SECTIONS);
    const rank = (id) => (order.includes(id) ? order.indexOf(id) : order.length);
    sections = (data.sections || []).slice().sort((a, b) => rank(a.id) - rank(b.id));
    users = (data.users || []).map((u) => ({
      id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
      orig: (u.sections || []).slice(), cur: new Set(u.sections || []),
    }));
    msg($('ad-load'), users.length ? '' : 'No accounts.');
    render();
    return true;
  }

  async function save() {
    const todo = dirtyUsers();
    if (!todo.length || saving) return;
    saving = true;
    render();
    const failed = [];
    // Sekventiellt: få rader, och ett fel per konto ska inte stoppa de andra.
    for (const u of todo) {
      const { error } = await sb.rpc('admin_set_access', {
        p_user: u.id, p_sections: [...u.cur], p_expected: u.orig,
      });
      if (error) failed.push(`${u.email || u.id}: ${errText(error)}`);
    }
    saving = false;
    // Läs alltid om: det som visas ska vara det som ligger i databasen.
    const ok = await load();
    if (failed.length) msg($('ad-status'), `Not saved — ${failed.join(' ')}${ok ? ' The list has been reloaded.' : ''}`, 'err');
    else msg($('ad-status'), `Saved ${todo.length} account${todo.length === 1 ? '' : 's'}.`, 'ok');
  }

  window.addEventListener('tc:ready', (e) => {
    me = ((e.detail && e.detail.email) || '').toLowerCase();
    if (me !== ADMIN_EMAIL) { location.replace('/misc/'); return; }
    $('ad-save').addEventListener('click', save);
    window.addEventListener('beforeunload', (ev) => {
      if (dirtyUsers().length) { ev.preventDefault(); ev.returnValue = ''; }
    });
    load();
  });
})();
