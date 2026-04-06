let wizardSteps = [];

function getWizardSteps() {
  return changedOnly
    ? selectedSection.steps.filter(step => step.changed)
    : selectedSection.steps;
}

document.getElementById('startWizardBtn').onclick = () => {
  wizardSteps = getWizardSteps();
  wizardIndex = 0;

  if (wizardSteps.length === 0) {
    alert('No visible steps to show');
    return;
  }

  renderWizard();
  showScreen('screen-wizard');
};

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
