/**
 * Arx Tessera - Interactive Engine Scripts
 * High-performance, vanilla JS handling calculations, faq accordion, and form handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initRoiCalculator();
  initFaqAccordion();
  initAuditForm();
  initCurrentYear();
});

/* 1. STICKY NAVBAR STATE */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* 2. MOBILE MENU TOGGLE */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
    });
  });
}

/* 3. BUSINESS OWNER ROI & WASTE CALCULATOR */
function initRoiCalculator() {
  const empSlider = document.getElementById('employeeCount');
  const saasSlider = document.getElementById('saasPerUser');
  const hoursSlider = document.getElementById('manualHours');
  const rateSlider = document.getElementById('hourlyRate');

  if (!empSlider || !saasSlider || !hoursSlider || !rateSlider) return;

  const valEmp = document.getElementById('valEmployeeCount');
  const valSaas = document.getElementById('valSaasPerUser');
  const valHours = document.getElementById('valManualHours');
  const valRate = document.getElementById('valHourlyRate');

  const totalDrainEl = document.getElementById('totalAnnualWaste');
  const annualSaasEl = document.getElementById('annualSaasWaste');
  const annualLaborEl = document.getElementById('annualLaborWaste');
  const recapturedEl = document.getElementById('recapturedSavings');
  const paybackEl = document.getElementById('paybackMonths');

  function calculate() {
    const employees = parseFloat(empSlider.value);
    const saasCostPerMonth = parseFloat(saasSlider.value);
    const manualHoursPerWeek = parseFloat(hoursSlider.value);
    const hourlyRate = parseFloat(rateSlider.value);

    // Label updates
    valEmp.textContent = `${employees} team members`;
    valSaas.textContent = `$${saasCostPerMonth} / person / month`;
    valHours.textContent = `${manualHoursPerWeek} hours / week`;
    valRate.textContent = `$${hourlyRate} / hour`;

    // Mathematical calculations
    // Annual SaaS Waste: employees * monthly cost * 12
    const annualSaas = employees * saasCostPerMonth * 12;
    // Annual Labor Waste: employees * manual hours * hourly rate * 50 working weeks
    const annualLabor = employees * manualHoursPerWeek * hourlyRate * 50;
    const totalDrain = annualSaas + annualLabor;

    // Projected Recaptured Savings (conservative 70% recapture through custom automation)
    const recapturedSavings = Math.round(totalDrain * 0.70);

    // Payback calculation based on typical custom architecture investment (~$45k avg)
    const avgProjectCapex = 45000;
    const monthlySavings = recapturedSavings / 12;
    const paybackMonths = (avgProjectCapex / Math.max(monthlySavings, 1000)).toFixed(1);

    // Render formatted values
    totalDrainEl.textContent = formatCurrency(totalDrain);
    annualSaasEl.textContent = `${formatCurrency(annualSaas)} / yr`;
    annualLaborEl.textContent = `${formatCurrency(annualLabor)} / yr`;
    recapturedEl.textContent = `${formatCurrency(recapturedSavings)} / yr`;
    if (paybackEl) {
      paybackEl.textContent = `${paybackMonths} months`;
    }
  }

  function formatCurrency(num) {
    return '$' + Math.round(num).toLocaleString('en-US');
  }

  [empSlider, saasSlider, hoursSlider, rateSlider].forEach(slider => {
    slider.addEventListener('input', calculate);
  });

  calculate();
}

/* 4. FAQ ACCORDION LOGIC */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherPanel = other.querySelector('.faq-panel');
        const otherTrigger = other.querySelector('.faq-trigger');
        if (otherPanel) otherPanel.style.maxHeight = null;
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* 5. AUDIT FORM SUBMISSION & EMAIL ROUTING */
function initAuditForm() {
  const form = document.getElementById('auditForm');
  const alertBox = document.getElementById('formSuccessAlert');
  const errorBox = document.getElementById('formErrorAlert');
  const errorText = document.getElementById('formErrorText');
  const submitBtn = document.getElementById('submitFormBtn');

  if (!form) return;

  const defaultBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Book Free Consultation Call</span>';

  function showError(msg) {
    if (alertBox) alertBox.style.display = 'none';
    if (errorBox && errorText) {
      errorText.textContent = msg;
      errorBox.style.display = 'flex';
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert(msg);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (errorBox) errorBox.style.display = 'none';
    if (alertBox) alertBox.style.display = 'none';

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('workEmail').value.trim();
    const company = document.getElementById('companyName').value.trim();
    const phoneEl = document.getElementById('phone');
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const scope = document.getElementById('projectScope').value.trim();
    const honeypotEl = document.getElementById('website_url');
    const website_url = honeypotEl ? honeypotEl.value.trim() : '';

    if (!name || !email || !company || !scope) {
      showError('Please fill out the required fields marked with * so we can prepare for our conversation.');
      return;
    }

    const interests = Array.from(form.querySelectorAll('input[name="interest"]:checked')).map(cb => cb.value);

    const totalAnnualWasteEl = document.getElementById('totalAnnualWaste');
    const recapturedSavingsEl = document.getElementById('recapturedSavings');

    const payload = {
      fullName: name,
      workEmail: email,
      companyName: company,
      phone,
      interests,
      projectScope: scope,
      website_url,
      roiSnapshot: {
        totalAnnualWaste: totalAnnualWasteEl ? totalAnnualWasteEl.textContent : null,
        recapturedSavings: recapturedSavingsEl ? recapturedSavingsEl.textContent : null
      }
    };

    submitBtn.innerHTML = `<span>Routing Your Request...</span>`;
    submitBtn.disabled = true;

    // Resolve API endpoint: use relative /api/contact (works on Vercel & Nginx proxy on port 3002),
    // with automatic fallback to http://localhost:8082/api/contact if opened directly without proxy.
    const endpoints = ['/api/contact'];
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
      endpoints.push('http://localhost:8082/api/contact');
    }

    let succeeded = false;
    let lastErrorMsg = 'Unable to send your request right now. Please email contact@najialess.io directly.';

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          succeeded = true;
          break;
        } else if (res.status === 400 || res.status === 429) {
          lastErrorMsg = data.error || lastErrorMsg;
          break; // Validation or rate-limit error, do not retry fallback URL
        } else if (data.error) {
          lastErrorMsg = data.error;
        }
      } catch (err) {
        // Try next endpoint if available
      }
    }

    if (succeeded) {
      form.reset();
      submitBtn.innerHTML = `<span>Request Transmitted Successfully ✓</span>`;
      submitBtn.disabled = false;
      if (alertBox) {
        alertBox.style.display = 'flex';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      setTimeout(() => {
        submitBtn.innerHTML = defaultBtnHtml;
      }, 5000);
    } else {
      submitBtn.innerHTML = defaultBtnHtml;
      submitBtn.disabled = false;
      showError(lastErrorMsg);
    }
  });
}

function initCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
