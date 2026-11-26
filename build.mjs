import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('worker/ledger.mjs','utf8');
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','const APP_HTML='+JSON.stringify(html)+';\n'+worker);

fs.mkdirSync('dist/.openai',{recursive:true});
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
