const app={line:null,from:null,to:null,format:null,section:null,showChanged:false};
const screens=[...document.querySelectorAll('.screen')];
const lineOptions=document.getElementById('lineOptions');
const fromOptions=document.getElementById('fromOptions');
const toOptions=document.getElementById('toOptions');
const formatOptions=document.getElementById('formatOptions');
const sectionOptions=document.getElementById('sectionOptions');
const stepList=document.getElementById('stepList');

const products=[
  {id:'koffiekoek',name:'Koffiekoek',desc:'Brown / red setup'},
  {id:'richtea',name:'Rich Tea',desc:'Blue / red setup'},
  {id:'theekokos',name:'Thee / Kokos',desc:'White / red setup'}
];

const formatMap={
  richtea:['5x6','3x6'],
  koffiekoek:['4x4','4x5','5x5'],
  theekokos:['1','3','3A','4','5']
};

const sectionData={
  robertPack:{title:'Robert Pack',steps:[
    {ref:'NR 1',name:'Doos breedte',from:'-',toKey:'doosBreedte'},
    {ref:'NR 4',name:'Doos hoogte',from:'-',toKey:'doosHoogte'},
    {ref:'NR 7',name:'Invoergeleider',from:'-',toKey:'invoergeleider'},
    {ref:'NR 21',name:'Gripper',from:'-',toKey:'gripper'},
    {ref:'NR 9',name:'Race track voor',from:'-',toKey:'raceTrackVoor'},
    {ref:'NR 10',name:'Race track achter',from:'-',toKey:'raceTrackAchter'},
    {ref:'NR 20',name:'Spreider hendel',from:'-',toKey:'spreiderHendel'}
  ]},
  dozen:{title:'Dozen Opzetter',steps:[
    {ref:'NR 1',name:'Hoogte',from:'-',toKey:'hoogte'},
    {ref:'NR 2',name:'Verstelbare balk',from:'-',toKey:'verstelbareBalk'},
    {ref:'NR 3',name:'Versmalde balk',from:'-',toKey:'versmaldeBalk'},
    {ref:'NR 4',name:'Karton nedrukker',from:'-',toKey:'kartonNedrukker'},
    {ref:'NR 5',name:'Achterste kartongeleiding',from:'-',toKey:'achtersteKartongeleiding'},
    {ref:'NR 9',name:'Zuigerbalk hoogte',from:'-',toKey:'zuigerbalkHoogte'},
    {ref:'NR 10',name:'Zuiger',from:'-',toKey:'zuiger'},
    {ref:'NR 18',name:'Breedte',from:'-',toKey:'breedte'},
    {ref:'NR 20',name:'Printer hoogte',from:'-',toKey:'printerHoogte'}
  ]},
  deksel:{title:'Dekselaar Opzetter',steps:[
    {ref:'NR 2',name:'Magazijn breedte links',from:'-',toKey:'magazijnBreedteLinks'},
    {ref:'NR 5',name:'Zuigerbalk',from:'-',toKey:'zuigerbalk'},
    {ref:'NR 6',name:'Transportbalk',from:'-',toKey:'transportBalk'},
    {ref:'NR 8',name:'Planobreedte',from:'-',toKey:'planobreedte'},
    {ref:'NR 11',name:'Breedte vouwer',from:'-',toKey:'breedteVouwer'},
    {ref:'NR 12A',name:'Diepte vouwer',from:'-',toKey:'diepteVouwer'},
    {ref:'NR 12B',name:'Diepte vast',from:'-',toKey:'diepteVast'},
    {ref:'NR 19',name:'Formaat',from:'-',toKey:'formaat'}
  ]}
};

const values={
  richtea:{
    '5x6':{
      robertPack:{doosBreedte:'011.3',doosHoogte:'223',invoergeleider:'Open',gripper:'Rood/Blauw',raceTrackVoor:'nr.1 - 1x',raceTrackAchter:'nr.2 - 11x',spreiderHendel:'140'},
      dozen:{hoogte:'263',verstelbareBalk:'628',versmaldeBalk:'190',kartonNedrukker:'249.2',achtersteKartongeleiding:'262',zuigerbalkHoogte:'70',zuiger:'550',breedte:'185',printerHoogte:'136'},
      deksel:{magazijnBreedteLinks:'0502.0',zuigerbalk:'360',transportBalk:'230',planobreedte:'505',breedteVouwer:'395',diepteVouwer:'257.3',diepteVast:'251.1',formaat:'3A'}
    },
    '3x6':{
      robertPack:{doosBreedte:'011.3',doosHoogte:'100',invoergeleider:'Open',gripper:'Rood/Blauw',raceTrackVoor:'nr.1 - 1x',raceTrackAchter:'nr.3 - 11x',spreiderHendel:'140'},
      dozen:{hoogte:'263',verstelbareBalk:'628',versmaldeBalk:'190',kartonNedrukker:'249.2',achtersteKartongeleiding:'262',zuigerbalkHoogte:'70',zuiger:'550',breedte:'185',printerHoogte:'136'},
      deksel:{magazijnBreedteLinks:'0502.0',zuigerbalk:'360',transportBalk:'230',planobreedte:'505',breedteVouwer:'395',diepteVouwer:'257.3',diepteVast:'251.1',formaat:'3A'}
    }
  },
  koffiekoek:{
    '4x4':{
      robertPack:{doosBreedte:'007.9',doosHoogte:'40',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.4 - 1x',raceTrackAchter:'nr.5 - 6x',spreiderHendel:'78'},
      dozen:{hoogte:'275.1',verstelbareBalk:'132.5',versmaldeBalk:'133',kartonNedrukker:'132',achtersteKartongeleiding:'260',zuigerbalkHoogte:'28',zuiger:'240',breedte:'270.8',printerHoogte:'75'},
      deksel:{magazijnBreedteLinks:'0425.4',zuigerbalk:'35',transportBalk:'260',planobreedte:'421.5',breedteVouwer:'395',diepteVouwer:'242.1',diepteVast:'242.1',formaat:'4'}
    },
    '4x5':{
      robertPack:{doosBreedte:'011.0',doosHoogte:'80',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.5 - 6x',raceTrackAchter:'nr.6 - 6x',spreiderHendel:'78'},
      dozen:{hoogte:'286.4',verstelbareBalk:'154',versmaldeBalk:'155',kartonNedrukker:'175.5',achtersteKartongeleiding:'266.5',zuigerbalkHoogte:'3.0',zuiger:'240',breedte:'270',printerHoogte:'75'},
      deksel:{magazijnBreedteLinks:'0425.4',zuigerbalk:'35',transportBalk:'260',planobreedte:'421.5',breedteVouwer:'395',diepteVouwer:'242.1',diepteVast:'242.1',formaat:'4'}
    },
    '5x5':{
      robertPack:{doosBreedte:'011.1',doosHoogte:'80',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.5 - 6x',raceTrackAchter:'nr.8 - 1x',spreiderHendel:'94'},
      dozen:{hoogte:'291',verstelbareBalk:'65',versmaldeBalk:'175',kartonNedrukker:'170',achtersteKartongeleiding:'276',zuigerbalkHoogte:'3',zuiger:'240',breedte:'325.5',printerHoogte:'99'},
      deksel:{magazijnBreedteLinks:'301',zuigerbalk:'40',transportBalk:'26',planobreedte:'495.5',breedteVouwer:'395',diepteVouwer:'268',diepteVast:'242',formaat:'5'}
    }
  },
  theekokos:{
    '1':{
      robertPack:{doosBreedte:'009.4',doosHoogte:'121',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.4 - 1x',raceTrackAchter:'nr.8 - 1x',spreiderHendel:'187'},
      dozen:{hoogte:'237.4',verstelbareBalk:'248',versmaldeBalk:'226',kartonNedrukker:'165',achtersteKartongeleiding:'260',zuigerbalkHoogte:'60',zuiger:'450',breedte:'274.3',printerHoogte:'171'},
      deksel:{magazijnBreedteLinks:'0417.8',zuigerbalk:'35.6',transportBalk:'260',planobreedte:'410.5',breedteVouwer:'395',diepteVouwer:'242',diepteVast:'217',formaat:'1'}
    },
    '3':{
      robertPack:{doosBreedte:'009.4',doosHoogte:'120',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.6 - 6x',raceTrackAchter:'nr.5 - 6x',spreiderHendel:'187'},
      dozen:{hoogτε:'263',verstelbareBalk:'629',versmaldeBalk:'315',kartonNedrukker:'249.2',achtersteKartongeleiding:'262',zuigerbalkHoogte:'70',zuiger:'550',breedte:'380',printerHoogte:'180'},
      deksel:{magazijnBreedteLinks:'510.0',zuigerbalk:'36.0',transportBalk:'23',planobreedte:'507.0',breedteVouwer:'395',diepteVouwer:'258.3',diepteVast:'251.0',formaat:'3'}
    },
    '3A':{
      robertPack:{doosBreedte:'009.4',doosHoogte:'120',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.6 - 6x',raceTrackAchter:'nr.5 - 6x',spreiderHendel:'187'},
      dozen:{hoogte:'263',verstelbareBalk:'628',versmaldeBalk:'190',kartonNedrukker:'249.2',achtersteKartongeleiding:'262',zuigerbalkHoogte:'70',zuiger:'550',breedte:'185',printerHoogte:'136'},
      deksel:{magazijnBreedteLinks:'0502.0',zuigerbalk:'360',transportBalk:'230',planobreedte:'505',breedteVouwer:'395',diepteVouwer:'257.3',diepteVast:'251.1',formaat:'3A'}
    },
    '4':{
      robertPack:{doosBreedte:'009.4',doosHoogte:'121',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.4 - 1x',raceTrackAchter:'nr.8 - 1x',spreiderHendel:'187'},
      dozen:{hoogte:'237.4',verstelbareBalk:'248',versmaldeBalk:'226',kartonNedrukker:'165',achtersteKartongeleiding:'260',zuigerbalkHoogte:'60',zuiger:'450',breedte:'274.3',printerHoogte:'171'},
      deksel:{magazijnBreedteLinks:'0425.4',zuigerbalk:'35',transportBalk:'260',planobreedte:'421.5',breedteVouwer:'395',diepteVouwer:'242.1',diepteVast:'242.1',formaat:'4'}
    },
    '5':{
      robertPack:{doosBreedte:'009.4',doosHoogte:'120',invoergeleider:'Dicht',gripper:'Rood/Wit',raceTrackVoor:'nr.6 - 6x',raceTrackAchter:'nr.5 - 6x',spreiderHendel:'187'},
      dozen:{hoogte:'291',verstelbareBalk:'65',versmaldeBalk:'175',kartonNedrukker:'170',achtersteKartongeleiding:'276',zuigerbalkHoogte:'3',zuiger:'240',breedte:'325.5',printerHoogte:'99'},
      deksel:{magazijnBreedteLinks:'301',zuigerbalk:'40',transportBalk:'26',planobreedte:'495.5',breedteVouwer:'395',diepteVouwer:'268',diepteVast:'242',formaat:'5'}
    }
  }
};

function showScreen(id){screens.forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.getElementById('topBackBtn').classList.toggle('hidden',id==='screen-lines');}
function card(title,meta,cb,target){const div=document.createElement('div');div.className=target||'option-card';div.innerHTML=`<div><div class="option-title">${title}</div><div class="option-meta">${meta}</div></div><div>→</div>`;div.onclick=cb;return div;}
lineOptions.appendChild(card('Line 9 / 10','Format-aware changeover flow',()=>{app.line='9-10';renderFrom();showScreen('screen-products-from')}));
function renderFrom(){fromOptions.innerHTML='';products.forEach(p=>fromOptions.appendChild(card(p.name,p.desc,()=>{app.from=p.id;renderTo();showScreen('screen-products-to')})))}
function renderTo(){toOptions.innerHTML='';products.filter(p=>p.id!==app.from).forEach(p=>toOptions.appendChild(card(p.name,p.desc,()=>{app.to=p.id;renderFormats();showScreen('screen-format')})))}
function renderFormats(){formatOptions.innerHTML='';document.getElementById('formatContextBadge').textContent=`${app.from} → ${app.to}`;formatMap[app.to].forEach(f=>formatOptions.appendChild(card(f,'Target box format',()=>{app.format=f;renderSections();showScreen('screen-sections')})))}
function renderSections(){sectionOptions.innerHTML='';document.getElementById('selectedFlowTitle').textContent='Select section';document.getElementById('selectedFlowSubtitle').textContent=`${app.from} → ${app.to} • ${app.format}`;Object.keys(sectionData).forEach(key=>{const data=values[app.to]?.[app.format]?.[key];if(!data)return;sectionOptions.appendChild(card(sectionData[key].title,`${Object.keys(data).length} settings available`,()=>{app.section=key;renderSectionDetail();showScreen('screen-section-detail')},'section-card'))})}
function renderSectionDetail(){const section=sectionData[app.section];const valueBlock=values[app.to][app.format][app.section];const rows=section.steps.map(step=>({ref:step.ref,name:step.name,from:step.from,to:valueBlock[step.toKey]||'—',changed:step.from!==(valueBlock[step.toKey]||'—')}));window.currentRows=rows;document.getElementById('detailContext').textContent=`${app.from} → ${app.to}`;document.getElementById('detailSectionTitle').textContent=section.title;document.getElementById('detailMeta').textContent=`Format ${app.format}`;document.getElementById('detailChangedCount').textContent=`${rows.filter(r=>r.changed).length} changes`;document.getElementById('detailDoneCount').textContent=`0 / ${rows.length} done`;paintRows(rows);}
function paintRows(rows){stepList.innerHTML='';rows.filter(r=>app.showChanged?r.changed:true).forEach(r=>{const div=document.createElement('div');div.className=`step-row ${r.changed?'changed':''}`;div.innerHTML=`<div>${r.ref}</div><div>${r.name}</div><div>${r.from}</div><div>${r.to}</div><div><span class="status-pill ${r.changed?'status-changed':'status-same'}">${r.changed?'Change':'Same'}</span></div>`;stepList.appendChild(div)})}
document.getElementById('showAllBtn').onclick=()=>{app.showChanged=false;document.getElementById('showAllBtn').classList.add('active');document.getElementById('showChangedBtn').classList.remove('active');paintRows(window.currentRows)};
document.getElementById('showChangedBtn').onclick=()=>{app.showChanged=true;document.getElementById('showChangedBtn').classList.add('active');document.getElementById('showAllBtn').classList.remove('active');paintRows(window.currentRows)};
document.getElementById('startWizardBtn').onclick=()=>{window.wizardRows=(app.showChanged?window.currentRows.filter(r=>r.changed):window.currentRows);window.wizardIndex=0;renderWizard();showScreen('screen-wizard')};
function renderWizard(){const row=window.wizardRows[window.wizardIndex];document.getElementById('wizardCounter').textContent=`Step ${window.wizardIndex+1} / ${window.wizardRows.length}`;document.getElementById('wizardName').textContent=row.name;document.getElementById('wizardReference').textContent=row.ref;document.getElementById('wizardFrom').textContent=row.from;document.getElementById('wizardTo').textContent=row.to;document.getElementById('wizardInstruction').textContent=`Set ${row.name} from ${row.from} to ${row.to}.`;document.getElementById('wizardSectionTag').textContent=sectionData[app.section].title;document.getElementById('wizardProgressText').textContent=`${window.wizardIndex+1} / ${window.wizardRows.length}`;document.getElementById('wizardProgressFill').style.width=`${((window.wizardIndex+1)/window.wizardRows.length)*100}%`;}
document.getElementById('nextBtn').onclick=()=>{if(window.wizardIndex<window.wizardRows.length-1){window.wizardIndex++;renderWizard()}};document.getElementById('prevBtn').onclick=()=>{if(window.wizardIndex>0){window.wizardIndex--;renderWizard()}};document.getElementById('doneBtn').onclick=()=>{if(window.wizardIndex<window.wizardRows.length-1){window.wizardIndex++;renderWizard()}};document.getElementById('skipBtn').onclick=()=>{if(window.wizardIndex<window.wizardRows.length-1){window.wizardIndex++;renderWizard()}};document.getElementById('resetSectionBtn').onclick=()=>renderSectionDetail();document.getElementById('topBackBtn').onclick=()=>history.back();