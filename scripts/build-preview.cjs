// Build ONLY a separate preview site. Never copy backups, Git metadata or production output.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function buildPreview({source=root,output=path.join(source,'preview-dist'),branch,revision}={}){
 if(!branch||['main','master'].includes(branch)||branch==='HEAD')throw Error('Preview requires an explicit development branch; main/master are blocked.');
 if(!revision||!/^[0-9a-f]{7,40}$/i.test(revision))throw Error('Preview requires a 7–40 character Git commit SHA.');
 const destination=path.resolve(output);
 if(destination!==path.join(path.resolve(source),'preview-dist'))throw Error('Only the separate preview-dist output directory is allowed.');
 const assets=['index.html','data.js','nutrition.js','app.js','v6.js','v5.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];
 const inputs=new Map(assets.map(name=>[name,fs.readFileSync(path.join(source,name))]));
 let html=inputs.get('index.html').toString();
 const scripts=[...html.matchAll(/<script\s+src="([^"]+)"\s*>\s*<\/script>/g)].map(m=>m[1]);
 if(!scripts.length||scripts.some(name=>!assets.includes(name)))throw Error('Unexpected app scripts: update the preview asset allowlist first.');
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 html=html.replace(/<script\s+src="[^"]+"\s*>\s*<\/script>/g,'');
 html=html.replace('</header>',`<p style="background:#fff3d8;color:#20352d;padding:12px;border:2px dashed currentColor"><b>MEALFLOW PREVIEW</b><br>${escape(branch)} · ${revision.slice(0,12)}<br>Separate test data. Import a COPY of your backup.</p></header>`);
 html=html.replace('</html>','<script src="preview-bootstrap.js"></script></html>');
 const manifest=JSON.parse(inputs.get('manifest.webmanifest'));
 Object.assign(manifest,{id:'./mealflow-preview',name:'MealFlow Preview',short_name:'MF Preview',start_url:'./index.html',scope:'./'});
 let sw=inputs.get('sw.js').toString();
 if(!/const CACHE='[^']+';/.test(sw)||!sw.includes('/^mealflow-v\\d/'))throw Error('Unexpected service-worker format: review preview isolation before building.');
 sw=sw.replace(/const CACHE='[^']+';/,`const CACHE='mealflow-preview-${revision.toLowerCase()}';`).replace('/^mealflow-v\\d/','/^mealflow-preview-/');
 sw=sw.replace("'./index.html',","'./index.html','./preview-bootstrap.js','./preview.json',");
 const metadata={environment:'preview',branch,revision,builtAt:new Date().toISOString()};
 const bootstrap=`// This file is generated for a separate HTTPS Netlify preview origin only.
(async()=>{
 const host=location.hostname.toLowerCase();
 const local=['localhost','127.0.0.1','[::1]'].includes(host);
 if(!(host.endsWith('.netlify.app')||local)||(!local&&location.protocol!=='https:')){
  document.getElementById('app').textContent='Preview blocked: use a separate HTTPS netlify.app address. Production data was not opened.';
  return;
 }
 for(const src of ${JSON.stringify(scripts)})await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script)});
 if('serviceWorker' in navigator)await navigator.serviceWorker.register('./sw.js');
})().catch(()=>{document.getElementById('app').textContent='Preview could not load. Reconnect and reopen this preview.'});
`;
 const generated=[...assets,'preview-bootstrap.js','preview.json','_headers'];
 if(fs.existsSync(destination)&&(fs.lstatSync(destination).isSymbolicLink()||fs.readdirSync(destination).some(name=>!generated.includes(name))))throw Error('Preview output contains unexpected files or is a symlink; refusing to publish.');
 fs.mkdirSync(destination,{recursive:true});
 // Remove only known generated assets; never recursively remove an arbitrary directory.
 for(const name of [...assets,'preview-bootstrap.js','preview.json','_headers']){
  const target=path.join(destination,name);if(fs.existsSync(target))fs.unlinkSync(target);
 }
 for(const [name,data] of inputs)fs.writeFileSync(path.join(destination,name),data);
 fs.writeFileSync(path.join(destination,'index.html'),html);
 fs.writeFileSync(path.join(destination,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(destination,'sw.js'),sw);
 fs.writeFileSync(path.join(destination,'preview-bootstrap.js'),bootstrap);
 fs.writeFileSync(path.join(destination,'preview.json'),JSON.stringify(metadata,null,2)+'\n');
 fs.writeFileSync(path.join(destination,'_headers'),'/*\n  Cache-Control: no-cache\n  X-Robots-Tag: noindex, nofollow\n/sw.js\n  Cache-Control: no-cache, max-age=0, must-revalidate\n');
 return metadata;
}
if(require.main===module){
 const branch=process.env.BRANCH||process.argv[2];
 const revision=process.env.COMMIT_REF||process.argv[3];
 try{console.log(JSON.stringify(buildPreview({branch,revision})))}catch(error){console.error(error.message);process.exitCode=1}
}
module.exports={buildPreview};
