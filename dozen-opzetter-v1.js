const screens=[...document.querySelectorAll('.screen')];
const fromOptions=document.getElementById('fromOptions');
const toOptions=document.getElementById('toOptions');
const stepList=document.getElementById('stepList');

const formats={
  '4x4':{
    'NR 1 Hoogte':'275.1',
    'NR 2 Verstelbare balk':'132.5',
    'NR 4 Karton neerdrukker':'132',
    'NR 5 Achterste kartongeleiding':'260',
    'NR 7 Zuigerbalk hoogte':'28',
    'NR 10 Zuiger':'240',
    'NR 12A Zuiger voor':'310',
    'NR 12B Zuiger achter':'313',
    'NR 13 Breedte binnenklepinslager':'310',
    'NR 14 Breedte':'242.8',
    'NR 15A Meenemer links':'310',
    'NR 15B Meenemer rechts':'310',
    'NR 16 Boven kartongeleiding':'140',
    'NR 17 Grijper':'127',
    'NR 18 Breedte':'270.8',
    'NR 20 Printer hoogte':'75'
  },
  '4x5':{
    'NR 1 Hoogte':'286.4',
    'NR 2 Verstelbare balk':'154',
    'NR 4 Karton neerdrukker':'175.5',
    'NR 5 Achterste kartongeleiding':'266.5',
    'NR 7 Zuigerbalk hoogte':'3.0',
    'NR 10 Zuiger':'240',
    'NR 12A Zuiger voor':'340',
    'NR 12B Zuiger achter':'310',
    'NR 13 Breedte binnenklepinslager':'310',
    'NR 14 Breedte':'249.5',
    'NR 15A Meenemer links':'310',
    'NR 15B Meenemer rechts':'310',
    'NR 16 Boven kartongeleiding':'340',
    'NR 17 Grijper':'17',
    'NR 18 Breedte':'150.0',
    'NR 20 Printer hoogte':'75'
  },
  '5x5':{
    'NR 1 Hoogτε':'291',
    'NR 2 Verstelbare balk':'65',
    'NR 4 Karton neerdrukker':'170',
    'NR 5 Achterste kartongeleiding':'276',
    'NR 7 Zuigerbalk hoogte':'3',
    'NR 10 Zuiger':'240',
    'NR 12A Zuiger voor':'34.7',
    'NR 12B Zuiger achter':'322',
    'NR 13 Breedte binnenklepinslager':'322',
    'NR 14 Breedte':'290',
    'NR 15A Meenemer links':'360',
    'NR 15B Meenemer rechts':'400',
    'NR 16 Boven kartongeleiding':'16.5',
    'NR 17 Grijper':'147.5',
    'NR 18 Breedte':'325.5',
    'NR 20 Printer hoogte':'99'
  },
  '5x6':{
    'NR 1 Hoogte':'263',
    'NR 2 Verstelbare balk':'629',
    'NR 4 Karton neerdrukker':'190',
    'NR 5 Achterste kartongeleiding':'249.2',
    'NR 7 Zuigerbalk hoogte':'70',
    'NR 10 Zuiger':'280',
    'NR 12A Zuiger voor':'380',
    'NR 12B Zuiger achter':'380',
    'NR 13 Breedte binnenklepinslager':'360',
    'NR 14 Breedte':'264',
    'NR 15A Meenemer links':'395',
    'NR 15B Meenemer rechts':'390',
    'NR 16 Boven kartongeleiding':'325',
    'NR 17 Grijper':'310',
    'NR 18 Breedte':'380',
    'NR 20 Printer hoogte':'180'
  },
  '3x6':{
    'NR 1 Hoogte':'263',
    'NR 2 Verstelbare balk':'628',
    'NR 4 Karton neerdrukker':'190',
    'NR 5 Achterste kartongeleiding':'249.2',
    'NR 7 Zuigerbalk hoogte':'70',
    'NR 10 Zuiger':'280',
    'NR 12A Zuiger voor':'380',
    'NR 12B Zuiger achter':'380',
    'NR 13 Breedte binnenklepinslager':'360',
    'NR 14 Breedte':'264',
    'NR 15A Meenemer links':'395',
    'NR 15B Meenemer rechts':'390',
    'NR 16 Boven kartongeleiding':'210',
    'NR 17 Grijper':'185',
    'NR 18 Breedte':'380',
    'NR 20 Printer hoogte':'136'
  }
};

const state={from:null,to:null,steps:[],index:0};

function show(id){screens.forEach(screen=>screen.classList.remove('active'));document.getElementById(id).classList.add('active')}

function createCard(title,meta,action){
  const div=document.createElement('div');
  div.className='option-card';
  div.innerHTML=`<div><div class='option-title'>${title}</div><div class='option-meta'>${meta}</div></div><div>→</div>`;
  div.onclick=action;
  return div;
}

Object.keys(formats).forEach(format=>{
  fromOptions.appendChild(createCard(format,'Current format',()=>{
    state.from=format;
    show('screen-to');
  }));

  toOptions.appendChild(createCard(format,'Target format',()=>{
    state.to=format;
    buildSteps();
    show('screen-list');
  }));
});

function buildSteps(){
  const fromData=formats[state.from];
  const toData=formats[state.to];
  const steps=[];

  Object.keys(toData).forEach(key=>{
    const fromValue=fromData[key] ?? '-';
    const toValue=toData[key] ?? '-';
    if(fromValue!==toValue){
      steps.push({name:key,from:fromValue,to:toValue});
    }
  });

  state.steps=steps;
  document.getElementById('detailContext').textContent=`${state.from} → ${state.to}`;
  document.getElementById('detailMeta').textContent='Only settings that need to change are shown.';
  document.getElementById('changeCount').textContent=`${steps.length} changes`;

  stepList.innerHTML='';

  steps.forEach((step,index)=>{
    const row=document.createElement('div');
    row.className='step-card';
    row.innerHTML=`
      <div class='step-number'>${index+1}</div>
      <div>
        <div class='step-title'>${step.name}</div>
        <div class='step-meta'>${step.from} → ${step.to}</div>
      </div>
      <div class='step-old'>${step.from}</div>
      <div class='step-new'>${step.to}</div>
      <div><span class='badge badge-changed'>Change</span></div>
    `;
    stepList.appendChild(row);
  });
}

document.getElementById('startWizardBtn').onclick=()=>{
  state.index=0;
  renderWizard();
  show('screen-wizard');
};

function renderWizard(){
  const step=state.steps[state.index];
  if(!step)return;

  document.getElementById('wizardCounter').textContent=`Step ${state.index+1} / ${state.steps.length}`;
  document.getElementById('wizardName').textContent=step.name;
  document.getElementById('wizardReference').textContent=step.name.split(' ')[0]+' '+step.name.split(' ')[1];
  document.getElementById('wizardFrom').textContent=step.from;
  document.getElementById('wizardTo').textContent=step.to;
  document.getElementById('wizardInstruction').textContent=`Change ${step.name} from ${step.from} to ${step.to}.`;
  document.getElementById('wizardProgressText').textContent=`${state.index+1} / ${state.steps.length}`;
  document.getElementById('wizardProgressFill').style.width=`${((state.index+1)/state.steps.length)*100}%`;
}

document.getElementById('nextBtn').onclick=()=>{
  if(state.index<state.steps.length-1){
    state.index++;
    renderWizard();
  }
};

document.getElementById('prevBtn').onclick=()=>{
  if(state.index>0){
    state.index--;
    renderWizard();
  }
};