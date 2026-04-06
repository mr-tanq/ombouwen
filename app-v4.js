const data = {
  lines: [
    {
      id: '7-8',
      name: 'Line 7-8',
      active: true,
      conversions: [
        {
          id: 'small_to_big',
          title: 'Small boxes → Big boxes',
          description: 'Used when changing from smaller cartons to larger cartons.',
          sections: [
            {
              id: 'robert_pack',
              name: 'Robert pack',
              steps: [
                { ref: '1', name: 'Side guides', from: '320 mm', to: '450 mm', changed: true },
                { ref: '2', name: 'Upper belt', from: 'Level 3', to: 'Level 5', changed: true },
                { ref: '3', name: 'Sensor position', from: 'A', to: 'A', changed: false }
              ]
            }
          ]
        }
      ]
    }
  ]
};

let selectedLine = null;
let selectedConversion = null;
let selectedSection = null;
let changedOnly = false;
let wizardSteps = [];
let wizardIndex = 0;

const screens = document.querySelectorAll('.screen');

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('topBackBtn').classList.toggle('hidden', id === 'screen-lines');
}

function renderLines() {
  const wrap = document.getElementById('lineOptions');
  wrap.innerHTML = '';

  data.lines.forEach(line => {
    const button = document.createElement('button');
    button.className = 'big-option';
    button.innerHTML = `<strong>${line.name}</strong><span>${line.active ? 'Available now' : 'Coming later'}</span>`;

    button.onclick = () => {
      selectedLine = line;
      renderConversions();
      showScreen('screen-conversions');
    };

    wrap.appendChild(button);
  });
}

function renderConversions() {
  document.getElementById('conversionLineTitle').textContent = selectedLine.name;
  const wrap = document.getElementById('conversionOptions');
  wrap.innerHTML = '';

  selectedLine.conversions.forEach(conversion => {
    const button = document.createElement('button');
    button.className = 'big-option';
    button.innerHTML = `<strong>${conversion.title}</strong><span>${conversion.description}</span>`;

    button.onclick = () => {
      selectedConversion = conversion;
      renderSections();
      showScreen('screen-sections');
    };

    wrap.appendChild(button);
  });
}

function renderSections() {
  const wrap = document.getElementById('sectionOptions');
  wrap.innerHTML = '';

  selectedConversion.sections.forEach(section => {
    const button = document.createElement('button');
    button.className = 'section-card';
    button.innerHTML = `<strong>${section.name}</strong>`;

    button.onclick = () => {
      selectedSection = section;
      renderSectionDetail();
      showScreen('screen-section-detail');
    };

    wrap.appendChild(button);
  });
}

function renderSectionDetail() {
  const visibleSteps = changedOnly ? selectedSection.steps.filter(step => step.changed) : selectedSection.steps;
  const wrap = document.getElementById('detailSteps');
  wrap.innerHTML = '';

  visibleSteps.forEach(step => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `<strong>${step.ref} · ${step.name}</strong>`;
    wrap.appendChild(card);
  });
}

function getWizardSteps() {
  return changedOnly ? selectedSection.steps.filter(step => step.changed) : selectedSection.steps;
}

document.getElementById('detailShowAllBtn').onclick = () => {
  changedOnly = false;
  renderSectionDetail();
};

document.getElementById('detailShowChangedBtn').onclick = () => {
  changedOnly = true;
  renderSectionDetail();
};

document.getElementById('startWizardBtn').onclick = () => {
  wizardSteps = getWizardSteps();
  wizardIndex = 0;
  renderWizard();
  showScreen('screen-wizard');
};

function renderWizard() {
  const step = wizardSteps[wizardIndex];
  document.getElementById('wizardCounter').textContent = `Step ${wizardIndex + 1} / ${wizardSteps.length}`;
  document.getElementById('wizardReference').textContent = `NR ${step.ref}`;
  document.getElementById('wizardName').textContent = step.name;
  document.getElementById('wizardFrom').textContent = step.from;
  document.getElementById('wizardTo').textContent = step.to;
}

renderLines();
