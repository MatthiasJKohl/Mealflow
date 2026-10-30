// Nutrient data per 100 g / 100 ml / each / scoop. 'estimate' entries must be checked against packs.
const nutrientSeed={
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


// V6 supplied product labels. Stable names preserve saved product links.
nutrientSeed["Chicken breast"]={"kcal": 106, "p": 24, "c": 0, "f": 1.1, "status": "label"};
nutrientSeed["5% chicken mince"]={"kcal": 113, "p": 18.4, "c": 0, "f": 4.4, "status": "label"};
nutrientSeed["Cooked chicken breast pieces"]={"kcal": 128, "p": 27, "c": 1, "f": 1.6, "status": "label"};
nutrientSeed["Breadsticks"]={"kcal": 394, "p": 11, "c": 73, "f": 5.6, "status": "label"};
nutrientSeed["Smoked salami"]={"kcal": 377, "p": 21.5, "c": 0.5, "f": 32, "status": "label"};
nutrientSeed["Wensleydale + cranberries"]={"kcal": 376, "p": 18.1, "c": 14.2, "f": 27.1, "status": "label"};
nutrientSeed["Dark chocolate"]={"kcal": 552, "p": 8, "c": 36.2, "f": 39.3, "status": "label"};
nutrientSeed["Dried mango"]={"kcal": 311, "p": 2.2, "c": 77, "f": 0.9, "status": "label", "note": "Natural Health 4 Life; no added sugar; contains sodium metabisulphite (E223)."};
nutrientSeed["Light soy sauce"]={"kcal": 70, "p": 5.5, "c": 12, "f": 0, "status": "label"};
nutrientSeed["Taco seasoning"]={"kcal": 288, "p": 11.2, "c": 36.8, "f": 6.4, "status": "label"};
nutrientSeed["Frozen sweetcorn"]={"kcal": 80, "p": 3.6, "c": 9.5, "f": 1.9, "status": "label", "note": "ASDA boiled basis; applied to frozen weighed quantity as an estimate of cooking yield."};
nutrientSeed["Clear whey"]={"kcal": 100, "p": 23, "c": 0.5, "f": 0.5, "status": "label", "basis": "scoop", "note": "Per4m Better Clear Whey: one 30 g scoop"};
nutrientSeed['Catalan sausage']={kcal:300,p:15,c:2,f:26,status:'estimate',basis:'g',note:'Estimated per 100 g; verify Catalan sausage label.'};
nutrientSeed['Creatine']={kcal:0,p:0,c:0,f:0,status:'estimate'};
nutrientSeed['Water']={kcal:0,p:0,c:0,f:0,status:'estimate'};
nutrientSeed['Dry medium egg noodles'].status='estimate';
nutrientSeed['Dry medium egg noodles'].note='Blue Dragon: verified energy 433.6 kcal/100 g DRY (271 kcal per serving, four servings per 250 g packet). Other macros are estimates.';
