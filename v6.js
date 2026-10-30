// Nutrient data per 100 g / 100 ml / each / scoop. 'estimate' entries must be checked against packs.
const v5NutrientDefaults={
 'Chicken breast':{kcal:110,p:23,c:0,f:1.5,status:'estimate'},
 'Dry medium egg noodles':{kcal:433.6,p:16,c:86.4,f:1.14,status:'label',note:'Scaled from supplied 271 kcal / 62.5g dry serving; other macros from supplied prepared-serving label'},
 'Reduced-sugar sweet chilli sauce':{kcal:224,p:.6,c:55,f:.3,status:'label',note:'ASDA label supplied; check product identity (label shows 224 kcal/100g)'},
 'Light soy sauce':{kcal:53,p:5,c:5,f:0,status:'estimate'},
 'Lime juice':{kcal:22,p:.3,c:1,f:0,status:'label'},
 'Cucumber':{kcal:15,p:.7,c:2.2,f:.1,status:'estimate'},
 'Spring onions':{kcal:32,p:1.8,c:7.3,f:.2,status:'estimate'},
 'Dry penne':{kcal:355,p:12.5,c:72,f:1.5,status:'estimate'},
 'Honey':{kcal:304,p:.3,c:82.4,f:0,status:'estimate'},
 'Soy sauce':{kcal:53,p:5,c:5,f:0,status:'estimate'},
 '5% chicken mince':{kcal:125,p:20,c:0,f:5,status:'estimate'},
 '5% beef mince':{kcal:137,p:21,c:0,f:5,status:'estimate'},
 'Potatoes':{kcal:77,p:2,c:17,f:.1,status:'estimate'},
 'Frozen sweetcorn':{kcal:86,p:3.4,c:16,f:1.2,status:'estimate'},
 'Olive oil':{kcal:884,p:0,c:0,f:100,status:'estimate'},
 'Bananas':{kcal:105,p:1.3,c:27,f:.4,status:'estimate',basis:'each'},
 'Wensleydale + cranberries':{kcal:380,p:17,c:15,f:28,status:'estimate'},
 'Breadsticks':{kcal:410,p:12,c:72,f:8,status:'estimate'},
 'Smoked salami':{kcal:400,p:22,c:1,f:34,status:'estimate'},
 'Cooked chicken breast pieces':{kcal:135,p:27,c:1,f:2,status:'estimate'},
 'Catalan sausage':{kcal:210,p:10,c:1,f:18,status:'estimate',basis:'each'},
 'Dark chocolate':{kcal:600,p:8,c:46,f:43,status:'estimate'},
 'Clear whey':{kcal:75,p:18,c:.5,f:.1,status:'label',basis:'scoop',note:'Bulk Clear Protein 20g serving label'},
 'Taco seasoning':{kcal:280,p:8,c:50,f:5,status:'estimate'},
 'Worcestershire sauce':{kcal:78,p:0,c:19,f:0,status:'estimate'}
};


const v5RecipeDefaults=[
{id:'noodles',type:'lunch',name:'Sweet chilli chicken noodles',items:[['Chicken breast',214,'g'],['Dry medium egg noodles',120,'g'],['Reduced-sugar sweet chilli sauce',30,'g'],['Light soy sauce',15,'ml'],['Lime juice',15,'ml'],['Cucumber',50,'g'],['Spring onions',15,'g']],steps:'Cook noodles according to packet. Cook chicken thoroughly, portion separately, mix sauce with noodles and vegetables. Divide evenly. Cool promptly.'},
{id:'pasta',type:'lunch',name:'Honey-soy chicken penne',items:[['Chicken breast',214,'g'],['Dry penne',120,'g'],['Honey',10,'g'],['Soy sauce',15,'ml']],steps:'Cook penne. Cook chicken thoroughly. Combine with honey, soy, garlic and vinegar to taste. Portion evenly and cool promptly.'},
{id:'taco',type:'dinner',name:'Taco chicken mince bowl',items:[['5% chicken mince',214,'g'],['Potatoes',300,'g'],['Frozen sweetcorn',100,'g'],['Olive oil',15,'g']],steps:'Roast potatoes with measured oil. Cook mince thoroughly with taco seasoning. Cook sweetcorn. Portion evenly and cool promptly.'},
{id:'beef',type:'dinner',name:'Beef burger bowl',items:[['5% beef mince',250,'g'],['Potatoes',250,'g'],['Frozen sweetcorn',80,'g'],['Olive oil',15,'g']],steps:'Roast potatoes with measured oil. Cook beef mince thoroughly with Worcestershire sauce and seasoning. Cook sweetcorn. Portion evenly and cool promptly.'}];

// Only exact, unverified shipped defaults qualify. Preserve full pre-migration state.
function sameNutrition(a,b){return !!a&&!!b&&['kcal','p','c','f'].every(k=>Number(a[k])===Number(b[k]))}
function migrateV6(){
 if(V.migrations?.dietV6)return;
 const backupKey='mealflow-v6-before-migration';
 if(!localStorage.getItem(backupKey))localStorage.setItem(backupKey,JSON.stringify({format:'mealflow-v5-backup',v5:V,legacy:s}));
 for(const [name,n] of Object.entries(nutrientSeed)){
  const old=v5NutrientDefaults[name],saved=s.nutrients[name],product=productFor(name);
  if(!product?.verified&&!product?.userEdited&&(!saved||(old&&saved.status!=='label'&&sameNutrition(saved,old))||JSON.stringify(saved)===JSON.stringify(old)))s.nutrients[name]={...n};
  if(product&&!product.verified&&!product.userEdited&&(!product.nut||sameNutrition(product.nut,old))){product.nut={...n};product.verified=n.status==='label'}
 }
 for(const old of v5RecipeDefaults){const i=s.recipes.findIndex(x=>x.id===old.id);if(i>=0&&JSON.stringify(s.recipes[i])===JSON.stringify(old))s.recipes[i]=JSON.parse(JSON.stringify(seed.find(x=>x.id===old.id)))}
 V.migrations={...V.migrations,dietV6:1};
 put();
}
function selectedWeek(){const a=current(),b=shift(a,7);return V.selectedWeek===b||V.weeks[V.selectedWeek]?V.selectedWeek:a}
function weekButtons(k){return `<p><b>Monday–Sunday · ${labelWeek(k)}</b></p><div class="actions">${[[current(),'This week'],[shift(current(),7),'Next week'],...(k<current()?[[k,'Historical week']]:[])].map(([date,label])=>`<button class="secondary" data-week6="${date}" aria-pressed="${date===k}">${label}</button>`).join('')}</div>`}
function recipeFor(k,id){const w=week(k);return (k<current()?(w.locked?w.snapshot?.recipes:undefined)?.find(x=>x?.id===id):null)||r(id)}
function nutrientFactor(product,name,q,u){
 const basis=product.nut?.basis||(name==='Cucumber'?'g':product.unit);
 if(u==='scoop'||u==='each'){
  if(basis==='each'||basis==='scoop')return q;
  // A medium cucumber is estimated at 300 g; avoid counting 1/7 as 1/7 kcal.
  if(name==='Cucumber')return q*300/100;
  return q;
 }
 if(basis==='each'&&name==='Catalan sausage')return q/170;
 return q/100;
}
function validateBackup(data){
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 if(data.format!=='mealflow-v5-backup'||!object(data.v5)||!object(data.legacy)||!Array.isArray(data.legacy.recipes)||!data.legacy.recipes.length)throw Error('Invalid backup');
 const recipes=data.legacy.recipes;
 if(!recipes.every(x=>object(x)&&typeof x.id==='string'&&typeof x.name==='string'&&typeof x.steps==='string'&&['lunch','dinner'].includes(x.type)&&Array.isArray(x.items)&&x.items.every(y=>Array.isArray(y)&&y.length===3&&typeof y[0]==='string'&&Number.isFinite(y[1])&&y[1]>=0&&typeof y[2]==='string')))throw Error('Invalid recipes');
 for(const k of ['weeks','weights','products','stock','ratings','favorites'])if(data.v5[k]!==undefined&&!object(data.v5[k]))throw Error('Invalid '+k);
 for(const [date,n] of Object.entries(data.v5.weights||{}))if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Number(n))||Number(n)<25||Number(n)>300)throw Error('Invalid weight');
 for(const w of Object.values(data.v5.weeks||{}))if(!w?.selected||!['lunch','dinner'].every(t=>recipes.some(r=>r.id===w.selected[t])))throw Error('Invalid meal plan');
 for(const p of Object.values(data.v5.products||{}))if(!object(p)||typeof p.name!=='string'||typeof p.unit!=='string'||(p.nut&&!['kcal','p','c','f'].every(k=>Number.isFinite(Number(p.nut[k]))&&Number(p.nut[k])>=0)))throw Error('Invalid product');
}

// Product pack and stock quantities use the product's saved unit, never a silently changed unit.
function purchaseFor(x){
 const p=productFor(x.n)||{name:x.n,unit:x.u,pack:0,stockable:false};
 const unit=p.unit||x.u;
 let factor=1;
 if(x.u!==unit){
  const gramsEach=x.n==='Cucumber'?300:x.n==='Catalan sausage'?170:null;
  if(gramsEach&&x.u==='g'&&unit==='each')factor=1/gramsEach;
  else if(gramsEach&&x.u==='each'&&unit==='g')factor=gramsEach;
  else return {p,unit:x.u,key:x.n+'|'+x.u,left:0,need:x.q,packs:null,pack:0};
 }
 const key=(p.name||x.n)+'|'+unit,left=p.stockable?Math.max(0,Number(V.stock[key])||0):0;
 const need=Math.max(0,x.q*factor-left),pack=Math.max(0,Number(p.pack)||0);
 return {p,unit,key,left,need,pack,packs:pack?Math.max(0,Math.ceil((need-1e-8)/pack)):null};
}
