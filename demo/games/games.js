/* =========================================================================
   The Chain — /demo/games/ (3.100.0). Neutral spelgruppsyta: tärningarna slår
   sig själva i en slinga, en träffzon lyser upp, loggen fylls. Bara visning.
   ========================================================================= */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tray = document.getElementById('tray');
  const total = document.getElementById('total');
  const log = document.getElementById('log');
  const zones = [...document.querySelectorAll('.zone')];
  const ZONE_NAMES = { head: 'Head', torso: 'Torso', larm: 'Left arm', rarm: 'Right arm', lleg: 'Left leg', rleg: 'Right leg' };
  const WHO = ['Ayla', 'Brannoc', 'Cira', 'Dorn'];
  const d10 = () => 1 + Math.floor(Math.random() * 10);

  tray.innerHTML = '<span class="die">?</span><span class="die">?</span><span class="die">?</span>';
  const dice = [...tray.querySelectorAll('.die')];
  let n = 0;

  function roll() {
    const vals = [d10(), d10(), d10()];
    dice.forEach((d) => d.classList.remove('land'));
    if (!reduce) {
      let k = 0;
      const spin = setInterval(() => {
        dice.forEach((d) => { d.textContent = d10(); });
        if (++k > 8) { clearInterval(spin); land(vals); }
      }, 70);
    } else land(vals);
  }

  function land(vals) {
    dice.forEach((d, i) => { d.textContent = vals[i]; void d.offsetWidth; d.classList.add('land'); });
    const sum = vals.reduce((a, b) => a + b, 0);
    total.textContent = sum;
    const z = zones[Math.floor(Math.random() * zones.length)];
    zones.forEach((el) => el.classList.toggle('hit', el === z));
    document.getElementById('hit-name').textContent = ZONE_NAMES[z.dataset.z];
    document.getElementById('hit-val').textContent = vals[0];
    const li = document.createElement('li');
    li.innerHTML = `<b>${WHO[n++ % WHO.length]}</b> rolled 3d10 → <span>${sum}</span> · ${ZONE_NAMES[z.dataset.z]}`;
    log.prepend(li);
    while (log.children.length > 6) log.lastChild.remove();
  }

  roll();
  setInterval(roll, 3200);
})();
