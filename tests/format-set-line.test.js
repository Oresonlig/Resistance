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
  it('exakt cardio/inclinecardio/sauna är minut-baserade', () => {
    const M = T.MEASURES;
    const min = Object.keys(M).filter(k => M[k].minInput);
    expect(min.sort()).toEqual(['cardio', 'inclinecardio', 'sauna']);
  });
});
