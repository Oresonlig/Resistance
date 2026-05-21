// Synk-merge-helpers extraherade från index.html (3.30.11/3.30.12).
//
// VIKTIGT: dessa är DUPLICERADE från index.html. Vid ändring måste båda
// uppdateras manuellt. Trade-off för att kunna testa utan att bryta
// single-file-arkitekturen. Om de divergerar är index.html sanningen.
//
// Strategi: union per id/nyckel, cloud vinner vid konflikt. Trade-off:
// deletes kan återuppstå om denna enhet hade gamla data — bättre än att
// tappa creates.

function mergeLogEntries(localLog, cloudLog){
  const seen = new Map();
  for(const e of localLog||[]) seen.set(`${e.passId}|${e.timestamp}`, e);
  for(const e of cloudLog||[]){
    const k = `${e.passId}|${e.timestamp}`;
    if(!seen.has(k)) seen.set(k, e);
  }
  return Array.from(seen.values()).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
}

function mergeWeightEntries(localWL, cloudWL){
  const seen = new Map();
  for(const e of localWL||[]) seen.set(e.date, e);
  for(const e of cloudWL||[]){
    if(!seen.has(e.date)) seen.set(e.date, e);
  }
  return Array.from(seen.values()).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
}

function mergeArrayById(local, cloud, idKey='id'){
  const out = new Map();
  for(const item of local||[]) if(item && item[idKey]!=null) out.set(item[idKey], item);
  for(const item of cloud||[]) if(item && item[idKey]!=null) out.set(item[idKey], item);
  return Array.from(out.values());
}

function mergeKeyedMap(local, cloud){
  return {...(local||{}), ...(cloud||{})};
}

function mergeArrayUnion(local, cloud){
  const s = new Set();
  for(const v of local||[]) s.add(v);
  for(const v of cloud||[]) s.add(v);
  return Array.from(s);
}

function mergeMapOfArrays(local, cloud){
  const out = {};
  const keys = new Set([...Object.keys(local||{}), ...Object.keys(cloud||{})]);
  for(const k of keys){
    out[k] = mergeArrayUnion(local?.[k], cloud?.[k]);
  }
  return out;
}

function mergeMapOfArrayById(local, cloud, idKey='id'){
  const out = {};
  const keys = new Set([...Object.keys(local||{}), ...Object.keys(cloud||{})]);
  for(const k of keys){
    out[k] = mergeArrayById(local?.[k], cloud?.[k], idKey);
  }
  return out;
}

export {
  mergeLogEntries,
  mergeWeightEntries,
  mergeArrayById,
  mergeKeyedMap,
  mergeArrayUnion,
  mergeMapOfArrays,
  mergeMapOfArrayById,
};
