const app={line:null,from:null,to:null,format:null,section:null,showChanged:false};
const screens=[...document.querySelectorAll('.screen')];
const historyStack=[];
const products=[
{id:'koffiekoek',name:'Koffiekoek',desc:'4x4 • 4x5 • 5x5'},
{id:'richtea',name:'Rich Tea',desc:'5x6 • 3x6'},
{id:'theekokos',name:'Thee / Kokos',desc:'5x5'}
];
const formatMap={
koffiekoek:[{label:'4x4',internal:'4'},{label:'4x5',internal:'4'},{label:'5x5',internal:'5'}],
richtea:[{label:'5x6',internal:'3'},{label:'3x6',internal:'3A'}],
theekokos:[{label:'5x5',internal:'1'}]
};
const lineOptions=document.getElementById('lineOptions');
const fromOptions=document.getElementById('fromOptions');
const toOptions=document.getElementById('toOptions');
const formatOptions=document.getElementById('formatOptions');
const sectionOptions=document.getElementById('sectionOptions');
const stepList=document.getElementById('stepList');
const sectionData={robertPack:{title:'Robert Pack'},dozen:{title:'Dozen Opzetter'},deksel:{title:'Dekselaar Opzetter'}};
const sampleSectionValues={robertPack:[['Doos breedte','011.3'],['Doos hoogte','223'],['Gripper','Rood/Blauw'],['Race track voor','nr.1 - 1x'],['Race track achter','nr.2 - 11x']],dozen:[['Hoogte','263'],['Verstelbare balk','628'],['Breedte','185'],['Printer hoogte','136']],deksel:[['Magazijn breedte links','0502.0'],['Planobreedte','505'],['Diepte vouwer','257.3'],['Formaat','3A']]} ;
function showScreen(id){screens.forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.getElementById('topBackBtn').classList.toggle('hidden',id==='screen-lines');}
function pushScreen(id){historyStack.push(id);showScreen(id)}
function makeCard(title,meta,action,className='option-card'){const el=document.createElement('div');el.className=className;el.innerHTML=`<div><div class="option-title">${title}</div><div class="option-meta">${meta}</div></div><div>→</div>`;el.onclick=action;return el;}
lineOptions.appendChild(makeCard('Line 9 / 10','Format-aware changeover flow',()=>{app.line='9-10';renderFrom();pushScreen('screen-products-from')}));
function renderFrom(){fromOptions.innerHTML='';products.forEach(product=>{fromOptions.appendChild(makeCard(product.name,product.desc,()=>{app.from=product.id;renderTo();pushScreen('screen-products-to')}))})}
function renderTo(){toOptions.innerHTML='';products.filter(p=>p.id!==app.from).forEach(product=>{toOptions.appendChild(makeCard(product.name,product.desc,()=>{app.to=product.id;renderFormats();pushScreen('screen-format')}))})}
function renderFormats(){formatOptions.innerHTML='';document.getElementById('formatContextBadge').textContent=`${app.from} → ${app.to}`;document.getElementById('formatHelp').textContent='Visible format names are shown first. Internal machine format code is shown below.';formatMap[app.to].forEach(format=>{formatOptions.appendChild(makeCard(format.label,`Machine format code: ${format.internal}`,()=>{app.format=format;renderSections();pushScreen('screen-sections')}))})}
function renderSections(){sectionOptions.innerHTML='';document.getElementById('selectedFlowSubtitle').textContent=`${app.from} → ${app.to} • ${app.format.label} • internal ${app.format.internal}`;Object.keys(sectionData).forEach(key=>{sectionOptions.appendChild(makeCard(sectionData[key].title,`${app.format.label} format`,()=>{app.section=key;renderSectionDetail();pushScreen('screen-section-detail')},'section-card'))})}
function renderSectionDetail(){document.getElementById('detailContext').textContent=`${app.from} → ${app.to}`;document.getElementById('detailSectionTitle').textContent=sectionData[app.section].title;document.getElementById('detailMeta').textContent=`${app.format.label} • machine code ${app.format.internal}`;const rows=sampleSectionValues[app.section].map((row,index)=>({ref:`NR ${index+1}`,name:row[0],from:'Current',to:row[1],changed:true}));window.currentRows=rows;document.getElementById('detailChangedCount').textContent=`${rows.length} changes`;document.getElementById('detailDoneCount').textContent=`0 / ${rows.length} done`;paintRows(rows)}
function paintRows(rows){stepList.innerHTML='';rows.forEach(row=>{const el=document.createElement('div');el.className='step-row changed';el.innerHTML=`<div>${row.ref}</div><div>${row.name}</div><div>${row.from}</div><div>${row.to}</div><div><span class="status-pill status-changed">Change</span></div>`;stepList.appendChild(el)})}
document.getElementById('showAllBtn').onclick=()=>{};document.getElementById('showChangedBtn').onclick=()=>{};
document.getElementById('startWizardBtn').onclick=()=>{window.wizardRows=window.currentRows;window.wizardIndex=0;renderWizard();pushScreen('screen-wizard')};
function renderWizard(){const row=window.wizardRows[window.wizardIndex];document.getElementById('wizardCounter').textContent=`Step ${window.wizardIndex+1} / ${window.wizardRows.length}`;document.getElementById('wizardName').textContent=row.name;document.getElementById('wizardReference').textContent=row.ref;document.getElementById('wizardFrom').textContent=row.from;document.getElementById('wizardTo').textContent=row.to;document.getElementById('wizardInstruction').textContent=`Set ${row.name} to ${row.to}`;document.getElementById('wizardSectionTag').textContent=sectionData[app.section].title;document.getElementById('wizardProgressText').textContent=`${window.wizardIndex+1} / ${window.wizardRows.length}`;document.getElementById('wizardProgressFill').style.width=`${((window.wizardIndex+1)/window.wizardRows.length)*100}%`;}
document.getElementById('nextBtn').onclick=()=>{if(window.wizardIndex<window.wizardRows.length-1){window.wizardIndex++;renderWizard()}};
document.getElementById('prevBtn').onclick=()=>{if(window.wizardIndex>0){window.wizardIndex--;renderWizard()}};
document.getElementById('doneBtn').onclick=()=>{if(window.wizardIndex<window.wizardRows.length-1){window.wizardIndex++;renderWizard()}};
document.getElementById('skipBtn').onclick=()=>{if(window.wizardIndex<window.wizardRows.length-1){window.wizardIndex++;renderWizard()}};
document.getElementById('resetSectionBtn').onclick=()=>renderSectionDetail();
document.getElementById('topBackBtn').onclick=()=>{historyStack.pop();const previous=historyStack.pop()||'screen-lines';showScreen(previous)};