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
          sections: [
            {
              id: 'robertpack',
              name: 'Robertpack',
              steps: [
                { ref: '7-A/A', name: 'Doos breedte', from: '64,5 x 155', to: '64,5 x 155', changed: false },
                { ref: '7-B/C = 1', name: 'Doos hoogte', from: '19,1', to: '19,1', changed: false },
                { ref: '7-B/C = 2', name: 'Doos hoogte', from: '150', to: '280', changed: true },
                { ref: '7-A/B = 1', name: 'Doos hoogte', from: '150', to: '280', changed: true },
                { ref: '7-A/B = 2', name: 'Doos hoogte', from: '150', to: '280', changed: true },
                { ref: '7-A/D', name: 'Op pak positie robot', from: '150', to: '280', changed: true },
                { ref: 'Race track 1', name: '# bakjes', from: '75', to: '75', changed: false },
                { ref: 'Race track 2', name: '# bakjes', from: '12', to: '12', changed: false },
                { ref: 'Induwers 1', name: 'Pakjes', from: '12', to: '12', changed: false },
                { ref: 'Induwers 2', name: 'Pakjes', from: '6', to: '6', changed: false },
                { ref: 'Wisselen', name: 'Gripper', from: '6', to: '6', changed: false },
                { ref: 'Recept 1', name: 'Digestieve 170', from: '70', to: '72', changed: true },
                { ref: 'Recept 2', name: '3-D sensor', from: '2', to: '5', changed: true }
              ]
            },
            {
              id: 'dozen_opzetter',
              name: 'Dozen opzetter',
              steps: [
                { ref: 'NR 1', name: 'Plano Lift hoogte', from: '87', to: '90', changed: true },
                { ref: 'NR 2', name: 'Plano breedte', from: '185', to: '185', changed: false },
                { ref: 'NR 3', name: 'Plano breedte', from: '395', to: '395', changed: false },
                { ref: 'NR 4', name: 'Plano hoogte', from: '315', to: '200', changed: true },
                { ref: 'NR 5', name: 'Onder vouwer plano', from: '395', to: '395', changed: false },
                { ref: 'NR 6', name: 'Breedte uitloop band', from: '197,5', to: '197,5', changed: false },
                { ref: '7.A', name: 'Zuignaphouder', from: '105', to: '115', changed: true },
                { ref: '7.B', name: 'Zuignaphouder', from: '200', to: '210', changed: true },
                { ref: '8.A', name: 'Zuignaphouder', from: '105', to: '105', changed: false },
                { ref: '8.B', name: 'Zuignaphouder', from: '385', to: '385', changed: false },
                { ref: '7-A/B', name: 'Zuignap kraantje', from: 'Open', to: 'Dicht', changed: true },
                { ref: '8-A/B', name: 'Zuignap kraantje', from: 'Open', to: 'Dicht', changed: true }
              ]
            },
            {
              id: 'dekselaar_opzetter',
              name: 'Dekselaar opzetter',
              steps: [
                { ref: 'NR 2', name: 'Deksel breedte magazijn', from: '517', to: '521', changed: true },
                { ref: 'NR 3', name: 'Hoogte deksel magazijn', from: '318', to: '318', changed: false },
                { ref: 'NR 5', name: 'Vacuüm deksel arm', from: '167', to: '167', changed: false },
                { ref: 'NR 7', name: 'Doosgeleiding', from: 'bz.34 nbz.42,5', to: 'Max omlaag', changed: true },
                { ref: 'NR 8A', name: 'Achterzijde', from: '501,4', to: '508,3', changed: true },
                { ref: 'NR 8B', name: 'Transport geleiding deksel', from: '502,9', to: '500,3', changed: true },
                { ref: 'NR 11', name: 'Lengte deksel vouwer', from: '400,5', to: '402,9', changed: true },
                { ref: 'NR 12 L', name: 'Breedte deksel vouwer', from: '195,0', to: '189,1', changed: true },
                { ref: 'NR 12 R', name: 'Breedte deksel vouwer', from: '198,9', to: '183,2', changed: true },
                { ref: 'NR 13', name: 'Inloop geleiding', from: 'A', to: 'A', changed: false },
                { ref: 'NR 14', name: 'Dozen transport', from: '213,8', to: '204,5', changed: true },
                { ref: 'NR 15', name: 'Uitloop geleiding', from: 'A', to: 'A', changed: false },
                { ref: 'NR 16', name: 'Nieuw recept laden', from: '70', to: '72', changed: true },
                { ref: 'NR 17', name: 'Moet inloggen met', from: '100', to: '100', changed: false }
              ]
            }
          ]
        },
        {
          id: 'big_to_small',
          title: 'Big boxes → Small boxes',
          sections: []
        }
      ]
    },
    {
      id: '9-10',
      name: 'Line 9-10',
      active: false
    }
  ]
};

const reverseSections = JSON.parse(JSON.stringify(data.lines[0].conversions[0].sections)).map(section => ({
  ...section,
  steps: section.steps.map(step => ({
    ...step,
    from: step.to,
    to: step.from
  }))
}));

data.lines[0].conversions[1].sections = reverseSections;

let selectedLine = null;
let selectedConversion = null;
let selectedSection = null;
let changedOnly = false;
let wizardIndex = 0;
let wizardSteps = [];

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

    if (!line.active) {
      button.style.opacity = '0.5';
    }

    button.onclick = () => {
      if (!line.active) return;
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
    button.innerHTML = `<strong>${conversion.title}</strong><span>${conversion.sections.length} sections</span>`;

    button.onclick = () => {
      selectedConversion = conversion;
      renderSections();
      showScreen('screen-sections');
    };

    wrap.appendChild(button);
  });
}

function renderSections() {
  document.getElementById('selectedConversionTitle').textContent = selectedConversion.title;
  const wrap = document.getElementById('sectionOptions');
  wrap.innerHTML = '';

  selectedConversion.sections.forEach(section => {
    const changedCount = section.steps.filter(step => step.changed).length;
    const button = document.createElement('button');
    button.className = 'section-card';
    button.innerHTML = `<strong>${section.name}</strong><span>${changedCount} changed settings</span>`;

    button.onclick = () => {
      selectedSection = section;
      changedOnly = false;
      syncDetailToggleButtons();
      renderSectionDetail();
      showScreen('screen-section-detail');
    };

    wrap.appendChild(button);
  });
}

function getVisibleSteps() {
  if (!selectedSection) return [];
  return changedOnly
    ? selectedSection.steps.filter(step => step.changed)
    : selectedSection.steps;
}

function syncDetailToggleButtons() {
  document.getElementById('detailShowAllBtn').classList.toggle('active', !changedOnly);
  document.getElementById('detailShowChangedBtn').classList.toggle('active', changedOnly);
}

function renderSectionDetail() {
  const visibleSteps = getVisibleSteps();
  const changedCount = selectedSection.steps.filter(step => step.changed).length;

  document.getElementById('detailLineLabel').textContent = `${selectedLine.name} · ${selectedConversion.title}`;
  document.getElementById('detailSectionTitle').textContent = selectedSection.name;
  document.getElementById('detailMeta').textContent = `${visibleSteps.length} visible steps`;
  document.getElementById('detailChangedCount').textContent = `${changedCount} changed`;

  syncDetailToggleButtons();

  const wrap = document.getElementById('detailSteps');
  wrap.innerHTML = '';

  visibleSteps.forEach(step => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `
      <div class="row-between gap-bottom">
        <strong>${step.ref} · ${step.name}</strong>
        <span class="pill ${step.changed ? 'changed' : 'same'}">${step.changed ? 'Changed' : 'Same'}</span>
      </div>
      <div class="row-between">
        <span>${step.from}</span>
        <span>→</span>
        <span>${step.to}</span>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function startWizard() {
  wizardSteps = getVisibleSteps();
  wizardIndex = 0;

  if (!wizardSteps.length) {
    alert('No visible steps in this mode.');
    return;
  }

  renderWizard();
  showScreen('screen-wizard');
}

function renderWizard() {
  const step = wizardSteps[wizardIndex];
  const progress = ((wizardIndex + 1) / wizardSteps.length) * 100;

  document.getElementById('wizardCounter').textContent = `Step ${wizardIndex + 1} / ${wizardSteps.length}`;
  document.getElementById('wizardSectionTag').textContent = selectedSection.name;
  document.getElementById('wizardReference').textContent = step.ref;
  document.getElementById('wizardName').textContent = step.name;
  document.getElementById('wizardFrom').textContent = step.from;
  document.getElementById('wizardTo').textContent = step.to;
  document.getElementById('wizardChangedBadge').textContent = step.changed ? 'Changed' : 'Same';
  document.getElementById('wizardChangedBadge').className = `pill ${step.changed ? 'changed' : 'same'}`;
  document.getElementById('wizardProgressFill').style.width = `${progress}%`;
  document.getElementById('wizardNote').textContent = step.changed
    ? `Change ${step.name} from ${step.from} to ${step.to}.`
    : `${step.name} stays the same at ${step.to}.`;
}

document.getElementById('topBackBtn').onclick = () => {
  const activeScreen = document.querySelector('.screen.active').id;

  if (activeScreen === 'screen-wizard') {
    showScreen('screen-section-detail');
  } else if (activeScreen === 'screen-section-detail') {
    showScreen('screen-sections');
  } else if (activeScreen === 'screen-sections') {
    showScreen('screen-conversions');
  } else if (activeScreen === 'screen-conversions') {
    showScreen('screen-lines');
  }
};

document.getElementById('detailShowAllBtn').onclick = () => {
  changedOnly = false;
  renderSectionDetail();
};

document.getElementById('detailShowChangedBtn').onclick = () => {
  changedOnly = true;
  renderSectionDetail();
};

document.getElementById('startWizardBtn').onclick = () => {
  startWizard();
};

document.getElementById('wizardPrevBtn').onclick = () => {
  if (wizardIndex > 0) {
    wizardIndex--;
    renderWizard();
  }
};

document.getElementById('wizardNextBtn').onclick = () => {
  if (wizardIndex < wizardSteps.length - 1) {
    wizardIndex++;
    renderWizard();
  } else {
    showScreen('screen-section-detail');
  }
};

renderLines();
