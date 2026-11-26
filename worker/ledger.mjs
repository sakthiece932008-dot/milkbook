const ledgerKey = 'customer-ledger-v2.json';
const privateHeaders = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
function json(body,status=200){return Response.json(body,{status,headers:privateHeaders})}
function validLedger(state){
 if(!state||!Array.isArray(state.customers)||!Array.isArray(state.records))return false;
 const ids=new Set(),numbers=new Set(),entries=new Set();
 const safeId=value=>typeof value==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(value);
 for(const c of state.customers){
  if(!c||!safeId(c.id)||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>80||!/^\d{5}$/.test(c.number)||numbers.has(c.number))return false;
  ids.add(c.id);numbers.add(c.number);
 }
 for(const r of state.records){
  if(!r||!safeId(r.id)||entries.has(r.id)||!ids.has(r.customer)||!['Milk','Payment'].includes(r.type)||!Number.isSafeInteger(r.amount)||r.amount<=0||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||typeof r.created!=='string')return false;
  entries.add(r.id);
 }
 return true;
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/ledger'){
   if(request.method==='GET'){
    const object=await env.BUCKET.get(ledgerKey);
    return json(object?{version:object.etag,state:await object.json()}:{version:'',state:{customers:[],records:[]}});
   }
   if(request.method!=='POST')return json({error:'Method not allowed'},405);
   if(request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Invalid request'},403);
   let data;try{data=await request.json()}catch{return json({error:'Invalid JSON'},400)}
   if(typeof data?.version!=='string'||!validLedger(data.state))return json({error:'Invalid ledger'},400);
   const onlyIf=data.version?{etagMatches:data.version}:new Headers({'If-None-Match':'*'});
   const saved=await env.BUCKET.put(ledgerKey,JSON.stringify(data.state),{onlyIf,httpMetadata:{contentType:'application/json'}});
   return saved?json({version:saved.etag}):json({error:'Ledger changed'},409);
  }
  if(url.pathname==='/'&&request.method==='GET')return new Response(APP_HTML,{headers:{...privateHeaders,'Content-Type':'text/html; charset=utf-8'}});
  return new Response('Not found',{status:404});
 }
};
