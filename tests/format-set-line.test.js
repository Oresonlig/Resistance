// @vitest-environment jsdom
// Regression: formatSetLine är shape-driven (läser settets EGNA fält) men `secs`
// ensamt är TVETYDIGT — det kan vara rå tid (timed/cardiosprint) eller en
// minut-inmatad cardio/sauna/incline-tid vars andra fält lämnats tomt. 3.80.0 gav
// funktionen ett valfritt measure-argument + `minInput` i MEASURES-registret för
// att lösa upp det. Utan det skrevs en Walk loggad på bara tid ut som "1950s"
// istället för "33min" — i både historiken och copy-texten.
import { describe, it, expect, beforeEach } from 'vitest';
import { bootApp, resetState } from './app-harness.js';

const T = bootApp();
beforeEach(() => { resetState(); });

const fmt = (set, measure) => window.formatSetLine(set, 'kg', measure);

describe('formatSetLine — minut-baserade mätsätt', () => {
  it('cardio utan distans skrivs i minuter, inte råa sekunder', () => {
    expect(fmt({ secs: 1950 }, 'cardio')).toBe('33min');
  });

  it('sauna utan temp skrivs i minuter', () => {
    expect(fmt({ secs: 900 }, 'sauna')).toBe('15min');
  });

  it('inclinecardio utan grad och distans skrivs i minuter', () => {
    expect(fmt({ secs: 1800 }, 'inclinecardio')).toBe('30min');
  });

  it('cardio MED distans är oförändrat (dist-grenen ägde redan minut-formen)', () => {
    expect(fmt({ secs: 1950, dist: 4.2 }, 'cardio')).toBe('4.2km · 33min');
  });
});

describe('formatSetLine — sekund-baserade mätsätt lämnas orörda', () => {
  it('timed (Dead Hang/Plank) är fortfarande råa sekunder', () => {
    expect(fmt({ secs: 45 }, 'timed')).toBe('45s');
  });

  it('cardiosprint visar råa sekunder + km + antal', () => {
    expect(fmt({ secs: 30, dist: 0.4, sprints: 6 }, 'cardiosprint')).toBe('0.4km · 30s · 6 sprints');
  });
});

// 3.84.0 — sprint-grenen i formatSetLine matchade på `set.sprints != null` och skrev
// tiden hårdkodat som sekunder, oavsett minInput. runsprint loggar TOTALTID i minuter
// (till skillnad från cardiosprint, vars secs är per-sprint-tid), så ett 30-minuters
// löppass skrevs ut som "1800s". Assault Bike måste förbli oförändrad — se testet ovan.
describe('formatSetLine — löpning (run/runsprint)', () => {
  it('runsprint skriver totaltiden i minuter, med sprintantalet kvar', () => {
    expect(fmt({ secs: 1800, dist: 6, sprints: 8 }, 'runsprint')).toBe('6km · 30min · 8 sprints');
  });

  it('run med distans matchar cardios form', () => {
    expect(fmt({ secs: 3000, dist: 10 }, 'run')).toBe('10km · 50min');
  });

  it('run utan distans skrivs i minuter', () => {
    expect(fmt({ secs: 3000 }, 'run')).toBe('50min');
  });
});

describe('formatSetLine — bakåtkompatibilitet', () => {
  it('utan measure gäller exakt det gamla beteendet (äldre loggposter)', () => {
    expect(fmt({ secs: 1950 })).toBe('1950s');
  });

  it('okänt measure faller tillbaka på sekunder', () => {
    expect(fmt({ secs: 1950 }, 'nonsense')).toBe('1950s');
  });

  it('vikt × reps opåverkat', () => {
    expect(fmt({ weight: 100, reps: 5 }, 'weight')).toBe('100 kg × 5r');
  });

  it('BW + last opåverkat', () => {
    expect(fmt({ extra: 20, reps: 8 }, 'bw')).toBe('BW + 20 kg × 8r');
  });

  it('reps=0 är ett giltigt resultat, inte "?" (3.62.3-regressionen)', () => {
    expect(fmt({ weight: 100, reps: 0 }, 'weight')).toBe('100 kg × 0r');
  });
});

describe('MEASURES.minInput speglar minut-inmatningen i measureCells', () => {
  // 3.84.0: run/runsprint tillkom. cardiosprint är MEDVETET utanför listan — dess secs
  // är per-sprint-tid (Assault Bike), inte totaltid, och matas därför in i råa sekunder.
  it('exakt cardio/inclinecardio/run/runsprint/sauna är minut-baserade', () => {
    const M = T.MEASURES;
    const min = Object.keys(M).filter(k => M[k].minInput);
    expect(min.sort()).toEqual(['cardio', 'inclinecardio', 'run', 'runsprint', 'sauna']);
  });
});
