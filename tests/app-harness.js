// PM5 Option B — jsdom-harness som kör det RIKTIGA <script>-blocket ur index.html.
//
// Till skillnad från src/-speglarna (Option C, pure helpers) evalueras här appens
// faktiska kod: samma extraktion som check_syntax.js, körd via indirekt eval i
// vitest:s jsdom-miljö. Scriptet är non-strict → funktionsdeklarationer landar på
// window (anropbara + monkey-patchbara från tester); let/const (state, currentUser)
// exponeras via epilogens getters/setters som stänger över eval-scopet.
//
// Nätverk/auth är avstängt by construction: Supabase-klienten skapas i ett separat
// <script type="module"> (matchas inte av extraktionen) och hela auth-bootstrappen
// ligger bakom whenSbReady() som aldrig triggas utan 'sb-ready'-eventet.
// currentUser=null → save()/pushState() no-op:ar sina persist/nätverksgrenar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let booted = null;

export function bootApp(){
  if(booted) return booted;
  const htmlPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Browser-API:er jsdom saknar (används av render/scroll/tema-kod, ofarliga som no-op)
  if(!window.matchMedia) window.matchMedia = () => ({matches:false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}});
  if(!window.requestAnimationFrame) window.requestAnimationFrame = (cb)=>setTimeout(cb,0);
  if(!window.cancelAnimationFrame) window.cancelAnimationFrame = (id)=>clearTimeout(id);
  if(!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = ()=>{};
  window.scrollTo = ()=>{};
  HTMLCanvasElement.prototype.getContext = ()=>null;

  // Riktiga body-markupen (minus script-taggar — innerHTML kör dem ändå inte)
  // så alla getElementById-mål som render-koden förväntar sig finns.
  const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
  document.body.innerHTML = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/g, '');

  // Alla klassiska <script>-block i dokumentordning (SB_CFG-blocket definierar
  // window.SB_CFG som huvudblocket läser vid top-level). type="module" matchas inte.
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const epilogue = `;window.__T={
    get state(){return state}, set state(v){state=v},
    get currentUser(){return currentUser}, set currentUser(v){currentUser=v},
    get isLoading(){return isLoading}, set isLoading(v){isLoading=v},
    get BASE_SESSIONS(){return BASE_SESSIONS},
    get APP_VERSION(){return APP_VERSION},
    get HELP_TOPICS(){return HELP_TOPICS},
    get MEASURES(){return MEASURES},
    // Synk-lagrets modul-lets (3.62.0/3.64.0) — exponerade för synk-testerna
    get cloudSeen(){return _cloudSeenThisSession}, set cloudSeen(v){_cloudSeenThisSession=v},
    get syncPromise(){return _syncPromise},
    get pushRetries(){return _pushRetries}, set pushRetries(v){_pushRetries=v},
    get pushRetryTimer(){return _pushRetryTimer},
    get saveTimer(){return saveTimer}, set saveTimer(v){saveTimer=v},
    get lastSyncError(){return _lastSyncError}, set lastSyncError(v){_lastSyncError=v},
    get lastSyncRead(){return lastSyncRead}, set lastSyncRead(v){lastSyncRead=v},
    get lastSyncWrite(){return lastSyncWrite}, set lastSyncWrite(v){lastSyncWrite=v},
  };`;
  blocks.forEach((code, i)=>{
    (0, eval)(i === blocks.length-1 ? code + epilogue : code);
  });
  booted = window.__T;
  return booted;
}

// Färsk state mellan tester — samma väg som appens egen init.
export function resetState(){
  const T = bootApp();
  T.currentUser = null;
  T.isLoading = false;
  T.state = window.freshState();
  window.ensureStateDefaults();
  window.invalidateChainCache();
  // Synk-globaler: nollställ + döda hängande timers så tester inte läcker in i varandra
  clearTimeout(T.pushRetryTimer);
  clearTimeout(T.saveTimer); T.saveTimer = null;
  T.pushRetries = 0;
  T.cloudSeen = false;
  T.lastSyncError = '';
  T.lastSyncRead = 0;
  T.lastSyncWrite = 0;
  return T;
}
