const conversions = {
  '3_to_5': {
    title: '3 lagen → 5 lagen',
    sections: [
      {
        name: 'Robert pack',
        steps: [
          { id: 'rp1', ref: '1', name: 'Side guides', from: '320 mm', to: '450 mm', changed: true },
          { id: 'rp2', ref: '2', name: 'Upper belt', from: 'Level 3', to: 'Level 5', changed: true },
          { id: 'rp3', ref: '3', name: 'Sensor', from: 'Position A', to: 'Position A', changed: false }
        ]
      },
      {
        name: 'Case packer',
        steps: [
          { id: 'cp1', ref: '4', name: 'Magazine width', from: '180 mm', to: '240 mm', changed: true },
          { id: 'cp2', ref: '5', name: 'Pusher height', from: '120 mm', to: '150 mm', changed: true },
          { id: 'cp3', ref: '6', name: 'Exit guide', from: 'Left', to: 'Left', changed: false }
        ]
      }
    ]
  },
  '5_to_3': {
    title: '5 lagen → 3 lagen',
    sections: [
      {
        name: 'Robert pack',
        steps: [
          { id: 'rp4', ref: '1', name: 'Side guides', from: '450 mm', to: '320 mm', changed: true },
          { id: 'rp5', ref: '2', name: 'Upper belt', from: 'Level 5', to: 'Level 3', changed: true },
          { id: 'rp6', ref: '3', name: 'Sensor', from: 'Position A', to: 'Position A', changed: false }
        ]
      }
    ]
  }
};

let currentConversion = null;
let currentSectionIndex = 0;
let wizardIndex = 0;
let changedOnly = false;
let currentNoteStepId = null;

const screens = document.querySelectorAll('.screen');

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.getElementById('topBackBtn').classList.toggle('hidden', id === 'screen-home');
}

function getStorageKey() {
  return `ombouwen_${currentConversion}`;
}

function getProgress() {
  return JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
}

function saveProgress(progress) {
  localStorage.setItem(getStorageKey(), JSON.stringify(progress));
}

function getAllSteps() {
  return conversions[currentConversion].sections.flatMap((section, sectionIndex) =>
    section.steps.map(step => ({ ...step, section: section.name, sectionIndex }))
  );
}

function renderOverview() {
  const data = conversions[currentConversion];
  const progress = getProgress();
  const sectionsWrap = document.getElementById('overviewSections');
  const allSteps = getAllSteps();
  const completed = Object.values(progress).filter(item => item.done).length;

  document.getElementById('overviewTitle').textContent = data.title;
  document.getElementById('overviewProgressBadge').textContent = `${completed} / ${allSteps.length}`;
  document.getElementById('overviewProgressText').textContent = `${completed} / ${allSteps.length}`;
  document.getElementById('overviewProgressFill').style.width = `${(completed / allSteps.length) * 100}%`;

  sectionsWrap.innerHTML = '';

  data.sections.forEach((section, index) => {
    const visibleSteps = changedOnly ? section.steps.filter(step => step.changed) : section.steps;
    const doneCount = visibleSteps.filter(step => progress[step.id]?.done).length;

    const button = document.createElement('button');
    button.className = `section-card ${doneCount === visibleSteps.length && visibleSteps.length ? 'done' : ''}`;
    button.innerHTML = `
      <strong>${section.name}</strong>
      <span>${doneCount} / ${visibleSteps.length} completed</span>
    `;

    button.onclick = () => {
      currentSectionIndex = index;
      renderSection();
      showScreen('screen-section');
    };

    sectionsWrap.appendChild(button);
  });
}

function renderSection() {
  const section = conversions[currentConversion].sections[currentSectionIndex];
  const progress = getProgress();
  const stepsWrap = document.getElementById('sectionSteps');
  const visibleSteps = changedOnly ? section.steps.filter(step => step.changed) : section.steps;

  document.getElementById('sectionTitle').textContent = section.name;
  document.getElementById('sectionMeta').textContent = `${visibleSteps.length} visible steps`;

  stepsWrap.innerHTML = '';

  visibleSteps.forEach(step => {
    const card = document.createElement('div');
    card.className = 'step-card';

    const note = progress[step.id]?.note;
    const done = progress[step.id]?.done;

    card.innerHTML = `
      <div class="row-between gap-bottom">
        <strong>NR ${step.ref} · ${step.name}</strong>
        <span class="pill ${step.changed ? 'changed' : 'same'}">${step.changed ? 'Changed' : 'Same'}</span>
      </div>
      <div class="row-between gap-bottom">
        <span>${step.from}</span>
        <span>→</span>
        <span>${step.to}</span>
      </div>
      ${note ? `<div class="note-box gap-bottom">${note}</div>` : ''}
      <div class="row-between">
        <span>${done ? 'Completed' : 'Pending'}</span>
        <button class="ghost-btn">${done ? 'Done' : 'Open in wizard'}</button>
      </div>
    `;

    card.querySelector('button').onclick = () => {
      const wizardSteps = getWizardSteps();
      wizardIndex = wizardSteps.findIndex(item => item.id === step.id);
      renderWizard();
      showScreen('screen-wizard');
    };

    stepsWrap.appendChild(card);
  });
}

function getWizardSteps() {
  return getAllSteps().filter(step => changedOnly ? step.changed : true);
}

function renderWizard() {
  const steps = getWizardSteps();
  const progress = getProgress();

  if (!steps.length || wizardIndex >= steps.length) {
    document.getElementById('wizardEmpty').classList.remove('hidden');
    document.getElementById('wizardStepCard').classList.add('hidden');
    return;
  }

  document.getElementById('wizardEmpty').classList.add('hidden');
  document.getElementById('wizardStepCard').classList.remove('hidden');

  const step = steps[wizardIndex];
  const stepProgress = progress[step.id] || {};

  document.getElementById('wizardCounter').textContent = `Step ${wizardIndex + 1} / ${steps.length}`;
  document.getElementById('wizardProgressFill').style.width = `${((wizardIndex + 1) / steps.length) * 100}%`;
  document.getElementById('wizardSectionTag').textContent = step.section;
  document.getElementById('wizardReference').textContent = `NR ${step.ref}`;
  document.getElementById('wizardName').textContent = step.name;
  document.getElementById('wizardFrom').textContent = step.from;
  document.getElementById('wizardTo').textContent = step.to;
  document.getElementById('wizardChangedBadge').textContent = step.changed ? 'Changed' : 'Same';
  document.getElementById('wizardChangedBadge').className = `pill ${step.changed ? 'changed' : 'same'}`;
  document.getElementById('wizardStateBadge').textContent = stepProgress.done ? 'Done' : 'Pending';

  const noteBox = document.getElementById('wizardNoteBox');
  if (stepProgress.note) {
    noteBox.textContent = stepProgress.note;
    noteBox.classList.remove('hidden');
  } else {
    noteBox.classList.add('hidden');
  }
}

document.querySelectorAll('.big-option').forEach(button => {
  button.addEventListener('click', () => {
    currentConversion = button.dataset.conversion;
    changedOnly = false;
    renderOverview();
    showScreen('screen-overview');
  });
});

document.getElementById('topBackBtn').onclick = () => showScreen('screen-home');
document.getElementById('sectionBackBtn').onclick = () => showScreen('screen-overview');
document.getElementById('startWizardBtn').onclick = () => {
  wizardIndex = 0;
  renderWizard();
  showScreen('screen-wizard');
};

document.getElementById('showAllBtn').onclick = () => {
  changedOnly = false;
  document.getElementById('showAllBtn').classList.add('active');
  document.getElementById('showChangedBtn').classList.remove('active');
  renderOverview();
};

document.getElementById('showChangedBtn').onclick = () => {
  changedOnly = true;
  document.getElementById('showChangedBtn').classList.add('active');
  document.getElementById('showAllBtn').classList.remove('active');
  renderOverview();
};

document.getElementById('sectionShowAllBtn').onclick = () => {
  changedOnly = false;
  renderSection();
};

document.getElementById('sectionShowChangedBtn').onclick = () => {
  changedOnly = true;
  renderSection();
};

document.getElementById('doneBtn').onclick = () => {
  const step = getWizardSteps()[wizardIndex];
  const progress = getProgress();
  progress[step.id] = { ...(progress[step.id] || {}), done: true };
  saveProgress(progress);

  if (wizardIndex < getWizardSteps().length - 1) {
    wizardIndex += 1;
  }

  renderWizard();
  renderOverview();
};

document.getElementById('skipBtn').onclick = () => {
  if (wizardIndex < getWizardSteps().length - 1) {
    wizardIndex += 1;
    renderWizard();
  }
};

document.getElementById('prevBtn').onclick = () => {
  if (wizardIndex > 0) {
    wizardIndex -= 1;
    renderWizard();
  }
};

document.getElementById('noteBtn').onclick = () => {
  const step = getWizardSteps()[wizardIndex];
  currentNoteStepId = step.id;
  document.getElementById('noteTitle').textContent = step.name;
  document.getElementById('noteInput').value = getProgress()[step.id]?.note || '';
  document.getElementById('noteModal').classList.remove('hidden');
};

document.getElementById('cancelNoteBtn').onclick = () => {
  document.getElementById('noteModal').classList.add('hidden');
};

document.getElementById('saveNoteBtn').onclick = () => {
  const progress = getProgress();
  progress[currentNoteStepId] = {
    ...(progress[currentNoteStepId] || {}),
    note: document.getElementById('noteInput').value
  };
  saveProgress(progress);
  document.getElementById('noteModal').classList.add('hidden');
  renderWizard();
  renderSection();
};

document.getElementById('resetBtn').onclick = () => {
  localStorage.removeItem(getStorageKey());
  renderOverview();
};

document.getElementById('wizardBackOverviewBtn').onclick = () => {
  showScreen('screen-overview');
  renderOverview();
};
