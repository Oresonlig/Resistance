/* =========================================================================
   The Chain — landing (Triptych) + section sign-in gate
   Plain JS. Auth, sektioner och partiklar kommer från /site.js (window.TC).
   Källa: Claude Design-handoff 2026-11-25. 3.97.0-tillägg: riktig Supabase,
   registreringsläge, "check your email", ?enter=<sektion> från sektionssidorna,
   Request access = mejl (mailto).
   ========================================================================= */

(() => {
  'use strict';
  if (window.TC_REDIRECTING || !window.TC) return;   // site.js skickade vidare till /training/

  const { Auth, SECTIONS, seedParticles, mqMobile } = window.TC;

  // ---------- config ----------
  const DEFAULT_OPEN = null;              // desktop: null = three equal panels; or 'training'
  const MOBILE_DEFAULT_OPEN = 'training'; // phone: one band open so the Enter button is visible without a tap
  const HOVER_PREVIEW = false;            // desktop hover-to-open; click always works on its own
  const DEMO_EMAIL = 'niklgron@gmail.com'; // 3.100.0: vem som ser Demo-länken

  // ?enter=<sektion>: sektionssidan skickade hit (utloggad eller utan åtkomst).
  const q = new URLSearchParams(location.search);
  const enterParam = SECTIONS[q.get('enter')] ? q.get('enter') : null;
  if (q.has('enter')) history.replaceState(null, '', '/');

  // ---------- state ----------
  const state = {
    user: null,
    access: [],
    open: mqMobile.matches ? MOBILE_DEFAULT_OPEN : DEFAULT_OPEN,
    screen: 'landing',          // 'landing' | 'gate'
    gate: 'signin',             // 'signin' | 'noaccess' | 'checkmail'
    mode: 'signin',             // 'signin' | 'signup'
    section: 'training',
    status: 'idle',             // 'idle' | 'loading' | 'pw' | 'net'
    msg: null,                  // { kind: 'info' | 'err', text }
    sentTo: '',
  };

  // ---------- dom ----------
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = $('#tc'), gate = $('#gate'), form = $('#signin');
  const panels = $$('.tc-panel');
  const msgEl = $('#msg');

  const has = (key) => state.access.includes(key);
  const firstAccessible = () => Object.keys(SECTIONS).find(has) || 'training';
  const bind = (key, val, scope = document) => $$(`[data-bind="${key}"]`, scope).forEach((el) => { el.textContent = val; });

  // ---------- render ----------
  function render() {
    const signedIn = !!state.user;
    root.dataset.auth = signedIn ? 'in' : 'out';
    root.dataset.screen = state.screen;

    if (signedIn) {
      bind('email', state.user.email);
      bind('initial', state.user.email.charAt(0).toUpperCase());
    }
    // 3.100.0: Demo-länken (/demo/) bara för admin-kontot. Samma adress som ADMIN_EMAIL i /training/.
    $('.tc-demo').hidden = !(signedIn && state.user.email.toLowerCase() === DEMO_EMAIL);

    panels.forEach((p) => {
      const key = p.dataset.section;
      const st = state.open === null ? 'equal' : (state.open === key ? 'open' : 'collapsed');
      p.dataset.state = st;
      p.toggleAttribute('data-locked', signedIn && !has(key));
      const strip = $('.tc-strip', p);
      strip.setAttribute('aria-expanded', String(st === 'open'));
      strip.setAttribute('aria-label', `Open ${SECTIONS[key].name}`);
    });

    const S = SECTIONS[state.section];
    const signup = state.mode === 'signup';
    gate.dataset.section = state.section;
    gate.dataset.gate = state.gate;
    gate.dataset.mode = state.mode;
    gate.dataset.signup = S.signup ? 'on' : 'off';
    gate.dataset.status = state.status;
    bind('name', S.name, gate);
    bind('kicker', S.kicker, gate);
    bind('desc', S.desc, gate);
    bind('has', state.access.map((k) => SECTIONS[k].name).join(', ') || 'no sections', gate);
    bind('first', SECTIONS[firstAccessible()].name, gate);
    bind('card-title', signup ? 'Create account' : 'Sign in', gate);
    bind('google', signup ? 'Continue with Google' : 'Sign in with Google', gate);
    bind('pw-label', signup ? 'Password (min 8 characters)' : 'Password', gate);
    bind('sent-to', state.sentTo, gate);
    const idleLabel = signup ? 'Create account' : 'Sign in';
    bind('submit', state.status === 'loading' ? (signup ? 'Creating account…' : 'Signing in…')
                 : state.status === 'net' ? 'Try again' : idleLabel, gate);
    $('#f-pw').setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
    $('#f-pw').setAttribute('aria-invalid', String(state.status === 'pw'));
    $$('.tc-signin input, .tc-signin button').forEach((el) => { el.disabled = state.status === 'loading'; });

    if (state.msg) { msgEl.dataset.kind = state.msg.kind; msgEl.textContent = state.msg.text; }
    else { delete msgEl.dataset.kind; msgEl.textContent = ''; }
  }

  function set(patch) { Object.assign(state, patch); render(); }

  // the gate's .tc-fx inherits its section from #gate[data-section]; reseed when it changes
  let lastGateSection = null;
  const reseedGateIfNeeded = () => { if (lastGateSection !== state.section) { lastGateSection = state.section; seedParticles(); } };

  // ---------- navigation ----------
  function goSection(key) { location.href = SECTIONS[key].href; }

  function showGate(key, gateName) {
    set({ screen: 'gate', gate: gateName, mode: 'signin', section: key, status: 'idle', msg: null });
    reseedGateIfNeeded();
    if (gateName === 'signin') $('#f-email').focus({ preventScroll: true });
  }

  function enter(key) {
    if (!state.user) return showGate(key, 'signin');
    if (has(key)) return goSection(key);
    showGate(key, 'noaccess');
  }

  function home() { set({ screen: 'landing', status: 'idle', msg: null }); }

  function setMode(mode) {
    if (mode === 'signup' && !SECTIONS[state.section].signup) return;   // Misc: ingen registrering
    set({ gate: 'signin', mode, status: 'idle', msg: null });
    (mode === 'signup' ? $('#f-name') : $('#f-email')).focus({ preventScroll: true });
  }

  // ---------- events ----------
  root.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const panelKey = el.closest('.tc-panel')?.dataset.section;

    switch (action) {
      case 'open':    set({ open: panelKey }); break;
      case 'enter':   enter(panelKey); break;
      case 'home':    e.preventDefault(); home(); break;
      case 'sign-out':
        await Auth.signOut();
        set({ user: null, access: [], screen: 'landing', status: 'idle', msg: null });
        break;
      case 'google':
        try { await Auth.signInWithGoogle(SECTIONS[state.section].href); }
        catch (err) { set({ status: 'net' }); }
        break;
      case 'forgot': {
        e.preventDefault();
        const email = $('#f-email').value.trim();
        if (!email) { set({ msg: { kind: 'err', text: 'Enter your email above, then tap "Forgot password?" again.' } }); $('#f-email').focus(); break; }
        try {
          await Auth.resetPassword(email);
          set({ status: 'idle', msg: { kind: 'info', text: `If ${email} has an account, a reset link is on its way.` } });
        } catch (err) {
          if (err.kind === 'network') set({ status: 'net', msg: null });
          else set({ msg: { kind: 'err', text: err.message || 'Could not send the reset link.' } });
        }
        break;
      }
      case 'to-signup': e.preventDefault(); setMode('signup'); break;
      case 'to-signin': e.preventDefault(); setMode('signin'); break;
      case 'go-first': goSection(firstAccessible()); break;
      case 'request': {
        const key = panelKey || state.section;
        Auth.requestAccess(key, state.user && state.user.email);
        if (!panelKey) $('.tc-noaccess').setAttribute('data-sent', '');
        else el.textContent = 'Email app opened';
        break;
      }
    }
  });

  if (HOVER_PREVIEW) {
    panels.forEach((p) => p.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && !mqMobile.matches) set({ open: p.dataset.section });
    }));
  }

  // Escape on the landing page returns to three equal panels
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.screen === 'gate') home();
    else if (state.open !== null) set({ open: null });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.status === 'loading') return;
    const email = $('#f-email').value.trim();
    const password = $('#f-pw').value;

    if (state.mode === 'signup') {
      if (!email || !password) return set({ msg: { kind: 'err', text: 'Email and password are required.' } });
      if (password.length < 8) return set({ msg: { kind: 'err', text: 'Password must be at least 8 characters.' } });
      set({ status: 'loading', msg: null });
      try {
        await Auth.signUp(email, password, $('#f-name').value.trim(), SECTIONS[state.section].href);
        $('#f-pw').value = '';
        set({ status: 'idle', gate: 'checkmail', mode: 'signin', sentTo: email });
      } catch (err) {
        if (err.kind === 'network') set({ status: 'net' });
        else set({ status: 'idle', msg: { kind: 'err', text: err.message || 'Could not create the account.' } });
      }
      return;
    }

    set({ status: 'loading', msg: null });
    try {
      const user = await Auth.signInWithPassword(email, password);
      const access = await Auth.getAccess();
      set({ user, access, status: 'idle' });
      if (has(state.section)) goSection(state.section);
      else set({ gate: 'noaccess' });
    } catch (err) {
      if (err.kind === 'email_not_confirmed') {
        set({ status: 'idle', msg: { kind: 'err', text: 'Confirm your email first. The link is in your inbox.' } });
      } else if (err.kind === 'invalid_credentials') {
        set({ status: 'pw' });
        $('#f-pw').select();
      } else if (err.kind === 'network') {
        set({ status: 'net' });
      } else {
        set({ status: 'idle', msg: { kind: 'err', text: err.message || 'Sign-in failed.' } });
      }
    }
  });
  // clear the error as soon as the user edits
  $$('.tc-field').forEach((f) => f.addEventListener('input', () => {
    if (state.status === 'pw' || state.status === 'net' || (state.msg && state.msg.kind === 'err')) set({ status: 'idle', msg: null });
  }));

  // ---------- 3.98.2: mobil — tangentbordet får inte täcka fälten ----------
  // .tc är låst till skärmhöjden (overflow hidden) med kortet nedtryckt. Om tangentbordet
  // bara läggs ovanpå (Chrome: resizes-visual, iOS) finns inget att scrolla. Därför följer
  // höjden det SYNLIGA området (--vvh, se landing.css) och fältet scrollas in i gate-inner.
  // interactive-widget=resizes-content i viewport-meta gör samma sak i Chrome på egen hand.
  const vv = window.visualViewport;
  if (vv) {
    // iOS Safari panorerar dokumentet när tangentbordet öppnas (offsetTop > 0) och lämnar
    // ibland kvar förskjutningen när det stängs. Höjden = synliga ytan → nollställ panoreringen,
    // så att .tc ligger exakt i det synliga fönstret (fältet scrollas in i gate-inner nedan).
    const fit = () => {
      root.style.setProperty('--vvh', `${Math.round(vv.height)}px`);
      if (mqMobile.matches && (window.scrollY || vv.offsetTop)) window.scrollTo(0, 0);
    };
    vv.addEventListener('resize', fit);
    fit();
  }
  form.addEventListener('focusin', (e) => {
    if (!mqMobile.matches || !e.target.matches('.tc-field')) return;
    setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  });

  // ---------- boot ----------
  (async () => {
    const user = await Auth.getUser();
    const access = user ? await Auth.getAccess() : [];
    set({ user, access });
    seedParticles();
    // Från en sektionssida: öppna den panelen, och visa inloggning / ingen åtkomst direkt.
    // Har användaren åtkomst stannar vi på panelen (ingen auto-hopp → ingen loop om
    // sektionssidans kontroll och vår skulle skilja sig, t.ex. vid nätfel).
    if (enterParam) {
      set({ open: enterParam });
      if (!user) showGate(enterParam, 'signin');
      else if (!has(enterParam)) showGate(enterParam, 'noaccess');
    }
  })();
})();
