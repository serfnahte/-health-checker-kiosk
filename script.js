
const SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwnOl_0TTe4wnwkjjtZNC-tlT20EQpY5MvPu_-XSDIV1FSAUQegQRZ2yYheEm0ZYVU/exec';

// ==========================================================================
// Element references
// ==========================================================================
const form = document.getElementById('bmiForm');
const resultCard = document.getElementById('resultCard');
const resultName = document.getElementById('resultName');
const resultBmi = document.getElementById('resultBmi');
const resultCategory = document.getElementById('resultCategory');
const resultMessage = document.getElementById('resultMessage');
const gaugeMarker = document.getElementById('gaugeMarker');
const newCheckBtn = document.getElementById('newCheckBtn');

function getValidationRules() {
  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value;
  const sex = document.getElementById('sex').value;
  const weight = document.getElementById('weight').value;
  const height = document.getElementById('height').value;

  return [
    {
      id: 'name',
      valid: name.length > 0,
      message: 'Please enter your full name.'
    },
    {
      id: 'age',
      valid: age !== '' && Number(age) >= 1 && Number(age) <= 120,
      message: 'Enter an age between 1 and 120.'
    },
    {
      id: 'sex',
      valid: sex === 'Female' || sex === 'Male',
      message: 'Please select a sex.'
    },
    {
      id: 'weight',
      valid: weight !== '' && Number(weight) > 0,
      message: 'Enter a weight greater than 0.'
    },
    {
      id: 'height',
      valid: height !== '' && Number(height) > 0,
      message: 'Enter a height greater than 0.'
    }
  ];
}

function runValidation() {
  const rules = getValidationRules();
  let allValid = true;

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const input = document.getElementById(rule.id);
    const errorEl = document.getElementById('err-' + rule.id);

    if (rule.valid) {
      input.classList.remove('invalid');
      errorEl.textContent = '';
    } else {
      input.classList.add('invalid');
      errorEl.textContent = rule.message;
      allValid = false;
    }
  }

  return allValid;
}

function calculateBmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

function classifyBmi(bmi) {
  let category, message, state;

  switch (true) {
    case bmi < 18.5:
      category = 'Underweight';
      state = 'under';
      message = 'You are below the typical healthy range. Consider a balanced, calorie-sufficient diet and talk to a nurse if this is a big change for you.';
      break;
    case bmi < 25:
      category = 'Normal';
      state = 'normal';
      message = 'Your BMI is within the healthy range. Keep up your current habits around diet and activity.';
      break;
    case bmi < 30:
      category = 'Overweight';
      state = 'over';
      message = 'You are slightly above the healthy range. Try adding more physical activity and mindful eating to your routine.';
      break;
    default:
      category = 'Obese';
      state = 'obese';
      message = 'Your BMI is well above the healthy range. We recommend speaking with a healthcare provider for guidance.';
  }

  return { category, message, state };
}


function positionGaugeMarker(bmi) {

  const clamped = Math.min(Math.max(bmi, 15), 40);
  const percent = ((clamped - 15) / (40 - 15)) * 100;
  gaugeMarker.style.left = percent + '%';
}

function showResult(name, bmi, category, message, state) {
  resultName.textContent = name;
  resultBmi.textContent = bmi.toFixed(1);
  resultCategory.textContent = category;
  resultMessage.textContent = message;

  resultCard.classList.remove('hidden', 'state-under', 'state-normal', 'state-over', 'state-obese');
  resultCard.classList.add('state-' + state);

  positionGaugeMarker(bmi);
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function recordSubmission(record) {
  if (!SHEET_WEB_APP_URL) {
    console.warn('Sheet logging skipped: set SHEET_WEB_APP_URL in script.js.');
    return;
  }

  fetch(SHEET_WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(record)
  }).catch(function (err) {
    console.error('Could not log submission to the sheet:', err);
  });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!runValidation()) {
    return;
  }

  const name = document.getElementById('name').value.trim();
  const age = Number(document.getElementById('age').value);
  const sex = document.getElementById('sex').value;
  const weight = Number(document.getElementById('weight').value);
  const heightCm = Number(document.getElementById('height').value);

  const bmi = calculateBmi(weight, heightCm);
  const { category, message, state } = classifyBmi(bmi);

  showResult(name, bmi, category, message, state);

  const record = { name, age, sex, weight, heightCm, bmi, category, state };
  recordSubmission(record);
});

newCheckBtn.addEventListener('click', function () {
  form.reset();
  resultCard.classList.add('hidden');
  document.getElementById('name').focus();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
});