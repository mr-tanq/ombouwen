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
            },
            {
              id: 'dozen_opzetter',
              name: 'Dozen opzetter',
              steps: [
                { ref: '1', name: 'Magazine width', from: '180 mm', to: '240 mm', changed: true },
                { ref: '2', name: 'Pusher height', from: '120 mm', to: '150 mm', changed: true },
                { ref: '3', name: 'Stopper', from: 'Position 2', to: 'Position 2', changed: false }
              ]
            },
            {
              id: 'deksel_opzetter',
              name: 'Deksel opzetter',
              steps: [
                { ref: '1', name: 'Lid width', from: 'Small', to: 'Large', changed: true },
                { ref: '2', name: 'Guide rail', from: '150 mm', to: '210 mm', changed: true },
                { ref: '3', name: 'Sensor', from: 'Position B', to: 'Position B', changed: false }
              ]
            }
          ]
        },
        {
          id: 'big_to_small',
          title: 'Big boxes → Small boxes',
          description: 'Used when changing from larger cartons back to smaller cartons.',
          sections: [
            {
              id: 'robert_pack',
              name: 'Robert pack',
              steps: [
                { ref: '1', name: 'Side guides', from: '450 mm', to: '320 mm', changed: true },
                { ref: '2', name: 'Upper belt', from: 'Level 5', to: 'Level 3', changed: true },
                { ref: '3', name: 'Sensor position', from: 'A', to: 'A', changed: false }
              ]
            },
            {
              id: 'dozen_opzetter',
              name: 'Dozen opzetter',
              steps: [
                { ref: '1', name: 'Magazine width', from: '240 mm', to: '180 mm', changed: true },
                { ref: '2', name: 'Pusher height', from: '150 mm', to: '120 mm', changed: true },
                { ref: '3', name: 'Stopper', from: 'Position 2', to: 'Position 2', changed: false }
              ]
            },
            {
              id: 'deksel_opzetter',
              name: 'Deksel opzetter',
              steps: [
                { ref: '1', name: 'Lid width', from: 'Large', to: 'Small', changed: true },
                { ref: '2', name: 'Guide rail', from: '210 mm', to: '150 mm', changed: true },
                { ref: '3', name: 'Sensor', from: 'Position B', to: 'Position B', changed: false }
              ]
            }
          ]
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

let selectedLine = null;
let selectedConversion = null;
let selectedSection = null;
let changedOnly = false;

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
    button.innerHTML = `
      <strong>${line.name}</strong>
      <span>${line.active ? 'Available now' : 'Coming later'}</span>
    `;

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
    button.innerHTML = `
      <strong>${conversion.title}</strong>
      <span>${conversion.description}</span>
    `;

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
    button.innerHTML = `
      <strong>${section.name}</strong>
      <span>${changedCount} changed settings</span>
    `;

    button.onclick = () => {
      selectedSection = section;
      changedOnly = false;
      renderSectionDetail();
      showScreen('screen-section-detail');
    };

    wrap.appendChild(button);
  });
}

function renderSectionDetail() {
  const visibleSteps = changedOnly ? selectedSection.steps.filter(step => step.changed) : selectedSection.steps;
  const changedCount = selectedSection.steps.filter(step => step.changed).length;

  document.getElementById('detailLineLabel').textContent = `${selectedLine.name} · ${selectedConversion.title}`;
  document.getElementById('detailSectionTitle').textContent = selectedSection.name;
  document.getElementById('detailMeta').textContent = `${visibleSteps.length} visible steps`;
  document.getElementById('detailChangedCount').textContent = `${changedCount} changed`;

  document.getElementById('detailShowAllBtn').classList.toggle('active', !changedOnly);
  document.getElementById('detailShowChangedBtn').classList.toggle('active', changedOnly);

  const wrap = document.getElementById('detailSteps');
  wrap.innerHTML = '';

  visibleSteps.forEach(step => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `
      <div class="row-between gap-bottom">
        <strong>NR ${step.ref} · ${step.name}</strong>
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

document.getElementById('topBackBtn').onclick = () => {
  const activeScreen = document.querySelector('.screen.active').id;

  if (activeScreen === 'screen-section-detail') {
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

renderLines();
