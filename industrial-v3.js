const appData = {
  lines: [
    {
      id: '7-8',
      title: 'Line 7-8',
      description: 'Box size changeovers',
      conversions: [
        { id: 'small-big', title: 'Small boxes → Big boxes', subtitle: 'Robertpack / Bedo', sections: [] },
        { id: 'big-small', title: 'Big boxes → Small boxes', subtitle: 'Robertpack / Bedo', sections: [] }
      ]
    },
    {
      id: '9-10',
      title: 'Line 9-10',
      description: 'Biscuit product changeovers',
      conversions: [
        {
          id: 'koffiekoek-richtea',
          title: 'Koffiekoek → Rich Tea',
          subtitle: 'Red/Brown → Red/Blue',
          sections: ['cavanna9', 'cavanna10', 'robertpack', 'dozen', 'dekselaar']
        },
        {
          id: 'koffiekoek-thee',
          title: 'Koffiekoek → Thee / Kokos',
          subtitle: 'Red/Brown → Red/White',
          sections: ['cavanna9', 'cavanna10', 'robertpack', 'dozen', 'dekselaar']
        },
        {
          id: 'richtea-koffiekoek',
          title: 'Rich Tea → Koffiekoek',
          subtitle: 'Red/Blue → Red/Brown',
          sections: ['cavanna9', 'cavanna10', 'robertpack', 'dozen', 'dekselaar']
        }
      ]
    }
  ],
  sections: {
    cavanna9: {
      title: 'Cavanna 9',
      description: 'Banden, inlegger, spillenbaan, inpakmachine',
      steps: [
        { ref: 'NR 3', name: 'Luchtverdeler', from: '3B', to: '3A', changed: true },
        { ref: 'NR 4', name: 'Luchtverdeler', from: '4B', to: '4A', changed: true },
        { ref: 'NR 5', name: 'Luchtslang', from: '5B', to: '5A', changed: true },
        { ref: 'NR 9', name: 'Grijper groot', from: 'Rood', to: 'Blauw', changed: true },
        { ref: 'NR 11', name: 'Recept banen', from: '4', to: '3', changed: true },
        { ref: 'NR 16', name: 'Inlegger bakken', from: 'Geheel ingeschoven', to: 'Tor met streep luchturen', changed: true },
        { ref: 'NR 21A', name: 'Breedte verstelling', from: 'Wit', to: 'Groen', changed: true },
        { ref: 'NR 31', name: 'Positie folierol 8', from: '30', to: '20', changed: true },
        { ref: 'NR 56', name: 'Recept druk', from: '4', to: '14', changed: true },
        { ref: 'NR 58', name: 'Recept checkweger', from: '34', to: '40', changed: true },
        { ref: 'NR 6', name: 'Druk luchtverdeler', from: '1.5 BAR', to: '1.5 BAR', changed: false }
      ]
    },
    cavanna10: {
      title: 'Cavanna 10',
      description: 'Ready for next data import',
      steps: [
        { ref: 'INFO', name: 'Pending setup', from: '-', to: 'Add Cavanna 10 values next', changed: true }
      ]
    },
    robertpack: {
      title: 'Robert Pack',
      description: 'Gripper, race track, spreader, recipe',
      steps: [
        { ref: '21', name: 'Gripper', from: 'Rood/Wit', to: 'Rood/Blauw', changed: true },
        { ref: '22', name: 'Recept', from: '78', to: '140', changed: true },
        { ref: '20', name: 'Spreider hendel', from: '70', to: '140', changed: true },
        { ref: '7', name: 'Race track voor', from: 'nr.1 - 1x', to: 'nr.3 - 11x', changed: true }
      ]
    },
    dozen: {
      title: 'Dozen Opzetter',
      description: 'Height, width, gripper, printer',
      steps: [
        { ref: 'NR 1', name: 'Hoogte', from: '237.4', to: '263', changed: true },
        { ref: 'NR 17', name: 'Grijper', from: '225', to: '185', changed: true },
        { ref: 'NR 20', name: 'Printer hoogte', from: '171', to: '136', changed: true },
        { ref: 'NR 13', name: 'Breedte binnenklepinslager', from: '257', to: '264', changed: true }
      ]
    },
    dekselaar: {
      title: 'Dekselaar Opzetter',
      description: 'Magazine width, transport, format',
      steps: [
        { ref: 'NR 2', name: 'Magazijn breedte links', from: '417.8', to: '510.0', changed: true },
        { ref: 'NR 4', name: 'Zuigerbalk', from: '35.6', to: '36.0', changed: true },
        { ref: 'NR 6', name: 'Transportbalk', from: '260', to: '23.0', changed: true },
        { ref: 'NR 19', name: 'Formaat', from: '1', to: '3', changed: true }
      ]
    }
  }
};

let selectedLine = null;
let selectedConversion = null;
let selectedSection = null;
let wizardSteps = [];
let wizardIndex = 0;
let showOnlyChanges = false;

const screens = document.querySelectorAll('.screen');
const lineOptions = document.getElementById('lineOptions');
const conversionOptions = document.getElementById('conversionOptions');
const sectionOptions = document.getElementById('sectionOptions');
const stepList = document.getElementById('stepList');

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('topBackBtn').classList.toggle('hidden', id === 'screen-lines');
}

function renderLines() {
  lineOptions.innerHTML = appData.lines.map(line => `
    <button class="selection-card" onclick="selectLine('${line.id}')">
      <div>
        <div class="selection-title">${line.title}</div>
        <div class="selection-subtitle">${line.description}</div>
      </div>
      <span>›</span>
    </button>
  `).join('');
}

window.selectLine = (lineId) => {
  selectedLine = appData.lines.find(line => line.id === lineId);
  document.getElementById('conversionLineTitle').textContent = selectedLine.title;
  conversionOptions.innerHTML = selectedLine.conversions.map(conversion => `
    <button class="selection-card" onclick="selectConversion('${conversion.id}')">
      <div>
        <div class="selection-title">${conversion.title}</div>
        <div class="selection-subtitle">${conversion.subtitle}</div>
      </div>
      <span>›</span>
    </button>
  `).join('');
  showScreen('screen-conversions');
};

window.selectConversion = (conversionId) => {
  selectedConversion = selectedLine.conversions.find(conversion => conversion.id === conversionId);
  document.getElementById('selectedConversionTitle').textContent = selectedConversion.title;
  sectionOptions.innerHTML = selectedConversion.sections.map(sectionId => {
    const section = appData.sections[sectionId];
    return `
      <button class="selection-card" onclick="selectSection('${sectionId}')">
        <div>
          <div class="selection-title">${section.title}</div>
          <div class="selection-subtitle">${section.description}</div>
        </div>
        <span>›</span>
      </button>
    `;
  }).join('');
  showScreen('screen-sections');
};

window.selectSection = (sectionId) => {
  selectedSection = appData.sections[sectionId];
  renderSection();
  showScreen('screen-section-detail');
};

function renderSection() {
  const filtered = selectedSection.steps.filter(step => !showOnlyChanges || step.changed);
  document.getElementById('detailContext').textContent = `${selectedLine.title} • ${selectedConversion.title}`;
  document.getElementById('detailSectionTitle').textContent = selectedSection.title;
  document.getElementById('detailMeta').textContent = selectedSection.description;
  document.getElementById('detailChangedCount').textContent = `${selectedSection.steps.filter(step => step.changed).length} changes`;
  document.getElementById('detailDoneCount').textContent = `0 / ${filtered.length} done`;

  stepList.innerHTML = filtered.map(step => `
    <div class="step-row ${step.changed ? 'changed' : 'same'}">
      <div>${step.ref}</div>
      <div>${step.name}</div>
      <div>${step.from}</div>
      <div>${step.to}</div>
      <div><span class="mini-badge ${step.changed ? 'mini-badge-red' : 'mini-badge-gray'}">${step.changed ? 'Changed' : 'Same'}</span></div>
    </div>
  `).join('');
}

document.getElementById('showAllBtn').onclick = () => {
  showOnlyChanges = false;
  document.getElementById('showAllBtn').classList.add('active');
  document.getElementById('showChangedBtn').classList.remove('active');
  renderSection();
};

document.getElementById('showChangedBtn').onclick = () => {
  showOnlyChanges = true;
  document.getElementById('showChangedBtn').classList.add('active');
  document.getElementById('showAllBtn').classList.remove('active');
  renderSection();
};

document.getElementById('startWizardBtn').onclick = () => {
  wizardSteps = selectedSection.steps.filter(step => !showOnlyChanges || step.changed);
  wizardIndex = 0;
  renderWizard();
  showScreen('screen-wizard');
};

function renderWizard() {
  const step = wizardSteps[wizardIndex];
  document.getElementById('wizardCounter').textContent = `Step ${wizardIndex + 1} / ${wizardSteps.length}`;
  document.getElementById('wizardStepName').textContent = step.name;
  document.getElementById('wizardReference').textContent = step.ref;
  document.getElementById('wizardFrom').textContent = step.from;
  document.getElementById('wizardTo').textContent = step.to;
  document.getElementById('wizardSectionTag').textContent = selectedSection.title;
  document.getElementById('wizardProgressText').textContent = `${wizardIndex + 1} / ${wizardSteps.length}`;
  document.getElementById('wizardProgressFill').style.width = `${((wizardIndex + 1) / wizardSteps.length) * 100}%`;
}

document.getElementById('nextBtn').onclick = () => {
  if (wizardIndex < wizardSteps.length - 1) {
    wizardIndex++;
    renderWizard();
  }
};

document.getElementById('prevBtn').onclick = () => {
  if (wizardIndex > 0) {
    wizardIndex--;
    renderWizard();
  }
};

document.getElementById('doneBtn').onclick = () => document.getElementById('nextBtn').click();
document.getElementById('skipBtn').onclick = () => document.getElementById('nextBtn').click();
document.getElementById('resetSectionBtn').onclick = renderSection;

document.getElementById('topBackBtn').onclick = () => {
  if (document.getElementById('screen-wizard').classList.contains('active')) return showScreen('screen-section-detail');
  if (document.getElementById('screen-section-detail').classList.contains('active')) return showScreen('screen-sections');
  if (document.getElementById('screen-sections').classList.contains('active')) return showScreen('screen-conversions');
  if (document.getElementById('screen-conversions').classList.contains('active')) return showScreen('screen-lines');
};

renderLines();
