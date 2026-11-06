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
  initWorkspaceShowcase();
  initInteractiveBridges();
  initStoryBlueprints();
  initIndustryFilter();
  initLegalModals();
});

/* 1. STICKY NAVBAR & FLOATING CTA PILL */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const floatingCta = document.getElementById('floatingCta');
  const calculatorSection = document.getElementById('calculator');
  const founderCard = document.querySelector('.founder-letter-card');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    if (navbar) {
      if (scrollTop > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (floatingCta) {
      let hidePill = false;
      if (calculatorSection) {
        const rect = calculatorSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          hidePill = true;
        }
      }
      if (founderCard) {
        const fRect = founderCard.getBoundingClientRect();
        if (fRect.top < window.innerHeight * 0.85 && fRect.bottom > 0) {
          hidePill = true;
        }
      }

      if (scrollTop > 650 && !hidePill) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
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

  const sliders = [empSlider, saasSlider, hoursSlider, rateSlider];

  function updateSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    slider.style.setProperty('--fill-pct', `${pct.toFixed(1)}%`);
  }

  let pulseTimer = null;
  function pulseDrainNumber() {
    if (!totalDrainEl) return;
    totalDrainEl.classList.add('is-updating');
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => {
      totalDrainEl.classList.remove('is-updating');
    }, 260);
  }

  function calculate() {
    const employees = parseFloat(empSlider.value);
    const saasCostPerMonth = parseFloat(saasSlider.value);
    const manualHoursPerWeek = parseFloat(hoursSlider.value);
    const hourlyRate = parseFloat(rateSlider.value);

    // Dynamic slider track fill for all sliders
    sliders.forEach(updateSliderFill);

    // Label updates (concise to prevent layout wrapping)
    valEmp.textContent = `${employees} people`;
    valSaas.textContent = `$${saasCostPerMonth} / mo`;
    valHours.textContent = `${manualHoursPerWeek} hrs / wk`;
    valRate.textContent = `$${hourlyRate} / hr`;

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

    // Trigger pulse on the waste number
    pulseDrainNumber();

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

  sliders.forEach(slider => {
    updateSliderFill(slider);
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
    const honeypotEl = document.getElementById('security_honeypot') || document.getElementById('website_url');
    const security_honeypot = honeypotEl ? honeypotEl.value.trim() : '';

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
      security_honeypot,
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
      endpoints.push('http://127.0.0.1:8082/api/contact');
    }

    let succeeded = false;
    let lastErrorMsg = 'Unable to send your request right now. Please email alessionaji1@gmail.com directly.';

    console.log('[Arx Tessera] Submitting consultation inquiry...', { company: payload.companyName, email: payload.workEmail });

    for (const url of endpoints) {
      try {
        console.log(`[Arx Tessera] Attempting POST to: ${url}`);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        console.log(`[Arx Tessera] Response from ${url}: status ${res.status}`, data);

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
        console.warn(`[Arx Tessera] Connection failed for ${url}:`, err.message);
        // Try next endpoint if available
      }
    }

    if (succeeded) {
      form.reset();
      submitBtn.innerHTML = `<span>Request Transmitted Successfully</span>`;
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

/* 6. INTERACTIVE BEFORE & AFTER WORKSPACE SHOWCASE (3-WAY AUDIT BENCH) */
let win98AudioCtx = null;
function playWin98Sound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!win98AudioCtx) win98AudioCtx = new AudioContextClass();
    if (win98AudioCtx.state === 'suspended') win98AudioCtx.resume();

    const now = win98AudioCtx.currentTime;
    if (type === 'error' || type === 'chord') {
      // Classic Windows error chord (dissonant two-tone chord)
      const osc1 = win98AudioCtx.createOscillator();
      const osc2 = win98AudioCtx.createOscillator();
      const gain = win98AudioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(155, now);
      osc2.frequency.setValueAtTime(233, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(win98AudioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.48);
      osc2.stop(now + 0.48);
    } else if (type === 'floppy') {
      // Floppy drive stepper seek clicks
      for (let i = 0; i < 4; i++) {
        const osc = win98AudioCtx.createOscillator();
        const gain = win98AudioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(80 + (i % 2) * 50, now + (i * 0.08));
        gain.gain.setValueAtTime(0.1, now + (i * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.04);
        osc.connect(gain);
        gain.connect(win98AudioCtx.destination);
        osc.start(now + (i * 0.08));
        osc.stop(now + (i * 0.08) + 0.05);
      }
    } else if (type === 'printer') {
      // Dot matrix head screech buzz
      for (let i = 0; i < 6; i++) {
        const osc = win98AudioCtx.createOscillator();
        const gain = win98AudioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340 + (i % 3) * 60, now + (i * 0.06));
        gain.gain.setValueAtTime(0.08, now + (i * 0.06));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.06) + 0.04);
        osc.connect(gain);
        gain.connect(win98AudioCtx.destination);
        osc.start(now + (i * 0.06));
        osc.stop(now + (i * 0.06) + 0.05);
      }
    }
  } catch (e) {
    // Graceful fallback if audio is not permitted
  }
}

function initWorkspaceShowcase() {
  const btnSaaS = document.getElementById('btnShowSaaS');
  const btnLegacy = document.getElementById('btnShowLegacy');
  const btnCustom = document.getElementById('btnShowCustom');

  const stageSaaS = document.getElementById('stageSaaS');
  const stageLegacy = document.getElementById('stageLegacy');
  const stageCustom = document.getElementById('stageCustom');

  const urlBar = document.getElementById('mockupUrlBar');
  const speedBadge = document.getElementById('mockupSpeedBadge');

  if (!btnSaaS || !btnLegacy || !btnCustom || !stageSaaS || !stageLegacy || !stageCustom) return;

  function switchTab(activeBtn, activeStage, urlText, speedText, badgeClass) {
    [btnSaaS, btnLegacy, btnCustom].forEach(b => {
      b.classList.remove('active-crimson', 'active-blue', 'active-emerald');
      b.setAttribute('aria-selected', 'false');
    });
    [stageSaaS, stageLegacy, stageCustom].forEach(s => s.classList.add('hidden-stage'));

    activeStage.classList.remove('hidden-stage');
    activeBtn.setAttribute('aria-selected', 'true');

    if (urlBar) urlBar.textContent = urlText;
    if (speedBadge) {
      speedBadge.textContent = speedText;
      speedBadge.className = 'mockup-latency-badge ' + badgeClass;
    }
  }

  btnSaaS.addEventListener('click', () => {
    switchTab(
      btnSaaS,
      stageSaaS,
      'STACK AUDIT: THE PAID CRM TRAP (RENTED CLOUD • $3,800/MO • AI NOBODY USES • 214 MANDATORY FIELDS)',
      'LOAD: 4.8s • $165/USER/MO',
      'badge-slow'
    );
    btnSaaS.classList.add('active-crimson');
  });

  btnLegacy.addEventListener('click', () => {
    switchTab(
      btnLegacy,
      stageLegacy,
      'STACK AUDIT: CLUNKY LEGACY SYSTEM (SHARED DESKTOP FILE • LOCKED BY SHARON • BUILT IN 2002)',
      'LOAD: 12.4s • DUSTY BACK-OFFICE PC',
      'badge-win98'
    );
    btnLegacy.classList.add('active-blue');
  });

  btnCustom.addEventListener('click', () => {
    switchTab(
      btnCustom,
      stageCustom,
      'STACK AUDIT: ARX TESSERA HUB (PRIVATE CLOUD • UNLIMITED LOGINS • 100% OWNED)',
      'LOAD: 0.18s • $0/SEAT FOREVER',
      'badge-fast'
    );
    btnCustom.classList.add('active-emerald');
  });

  // =========================================================================
  // ENTERPRISE CRM TRAP MICRO-INTERACTIONS (STAGE 1)
  // =========================================================================
  const crmToast = document.getElementById('crmToast');
  const crmToastText = document.getElementById('crmToastText');
  const crmToastClose = document.getElementById('crmToastClose');
  let crmToastTimer = null;

  function showCrmToast(htmlContent, duration = 4000) {
    if (!crmToast || !crmToastText) return;
    if (crmToastTimer) clearTimeout(crmToastTimer);
    crmToastText.innerHTML = htmlContent;
    crmToast.style.display = 'flex';
    crmToastTimer = setTimeout(() => {
      crmToast.style.display = 'none';
    }, duration);
  }

  crmToastClose?.addEventListener('click', () => {
    if (crmToastTimer) clearTimeout(crmToastTimer);
    if (crmToast) crmToast.style.display = 'none';
  });

  // Save Deal (Locked) Button
  const btnCrmSave = document.getElementById('btnCrmSave');
  const crmFieldsContainer = document.getElementById('crmFieldsContainer');
  btnCrmSave?.addEventListener('click', () => {
    playWin98Sound('error');
    btnCrmSave.classList.add('crm-shake');
    crmFieldsContainer?.classList.add('crm-shake');
    setTimeout(() => {
      btnCrmSave.classList.remove('crm-shake');
      crmFieldsContainer?.classList.remove('crm-shake');
    }, 450);

    showCrmToast(
      '<strong>System Validation Error: Unable to save Deal #4819.</strong><br>' +
      '14 mandatory compliance fields are incomplete. Contact your enterprise systems administrator.'
    );
  });

  // Ask AI & Generate AI Copilot Responses (Rotating satirical responses in plain words)
  const btnCrmAskAi = document.getElementById('btnCrmAskAi');
  const btnCrmGenerateAi = document.getElementById('btnCrmGenerateAi');
  const crmAiPromptInput = document.getElementById('crmAiPromptInput');
  const crmAiPromptResponse = document.getElementById('crmAiPromptResponse');
  const crmAiHeader = document.getElementById('crmAiHeader');

  const crmAiResponses = [
    '<strong>AI COPILOT:</strong> &ldquo;Leverage cross-functional alignment vectors to re-architect client touchpoints into a unified synergies dashboard. Estimated ROI: Negative $800/mo.&rdquo;',
    '<strong>AI COPILOT:</strong> &ldquo;Natural language sentiment analysis indicates client wants pipe fast. Recommendation: Schedule a 90-minute stakeholder workshop to brainstorm why the pipe has not been loaded onto the flatbed yet.&rdquo;',
    '<strong>AI COPILOT:</strong> &ldquo;Sentiment Confidence Index: 63.4%. Recommended Action: Auto-send the customer an AI-generated 14-page whitepaper on holistic pipe synergy instead of giving the driver an address.&rdquo;',
    '<strong>AI COPILOT:</strong> &ldquo;Autonomous Deal Prediction: Customer has high propensity to re-engage if you upgrade to Enterprise AI Plus ($1,400/mo).&rdquo;'
  ];
  let crmAiIndex = 0;

  function triggerAiResponse() {
    if (!crmAiPromptResponse) return;
    playWin98Sound('chord');
    crmAiPromptResponse.style.display = 'block';
    crmAiPromptResponse.innerHTML = crmAiResponses[crmAiIndex % crmAiResponses.length];
    crmAiIndex++;

    crmAiHeader?.classList.add('crm-highlight-purple');
    setTimeout(() => crmAiHeader?.classList.remove('crm-highlight-purple'), 1200);
  }

  btnCrmAskAi?.addEventListener('click', () => {
    triggerAiResponse();
    crmAiPromptInput?.focus();
  });

  btnCrmGenerateAi?.addEventListener('click', triggerAiResponse);
  crmAiPromptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      triggerAiResponse();
    }
  });

  // Global Search Dropdown & Shortcuts
  const crmSearchContainer = document.getElementById('crmSearchContainer');
  const crmSearchInput = document.getElementById('crmSearchInput');
  const crmSearchDropdown = document.getElementById('crmSearchDropdown');

  crmSearchContainer?.addEventListener('click', (e) => {
    e.stopPropagation();
    crmSearchDropdown?.classList.toggle('show-dropdown');
  });

  document.querySelectorAll('.crm-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      crmSearchDropdown?.classList.remove('show-dropdown');
      playWin98Sound('chord');
      showCrmToast(
        '<strong>Search Query Blocked:</strong><br>' +
        'Global search index paused by administrator to preserve cloud server compute credits.'
      );
    });
  });

  document.addEventListener('click', () => {
    crmSearchDropdown?.classList.remove('show-dropdown');
  });

  // Bell Alert Badge
  document.getElementById('crmBellBtn')?.addEventListener('click', () => {
    playWin98Sound('chord');
    showCrmToast(
      '<strong>14 Unread System Alerts:</strong><br>' +
      '19 QuickBooks sync errors, 4 license seat overages, and 1 AI sentiment calibration failure.'
    );
  });

  // User Chip
  document.getElementById('crmUserChip')?.addEventListener('click', () => {
    showCrmToast(
      '<strong>Seat License: Enterprise Admin ($165/seat/mo)</strong><br>' +
      'Billing cycle renews on the 1st. Adding coordinators will cost +$165/user/month.'
    );
  });

  // Screen Performance Badge
  document.getElementById('crmPerfBadge')?.addEventListener('click', () => {
    showCrmToast(
      '<strong>Network Diagnostic:</strong><br>' +
      '4.8s load time caused by 42 analytics trackers and bloated Enterprise JavaScript bundles.'
    );
  });

  // App Launcher (Waffle) Icon
  document.getElementById('crmWaffleBtn')?.addEventListener('click', () => {
    showCrmToast(
      '<strong>Enterprise App Launcher:</strong><br>' +
      '47 corporate modules installed. Your team only uses 2 of them.'
    );
  });

  // Pipeline Chevrons
  document.querySelectorAll('#crmPipelineBar .crm-chevron').forEach(chevron => {
    chevron.addEventListener('click', () => {
      const stage = chevron.getAttribute('data-stage');
      if (stage === '1' || stage === '2') {
        showCrmToast(
          '<strong>Stage ' + stage + ' Complete:</strong><br>' +
          'Customer approved quote 2 hours ago. Driver is ready, but stage 3 is blocked by mandatory compliance fields.'
        );
      } else if (stage === '3') {
        playWin98Sound('error');
        chevron.classList.add('crm-shake');
        setTimeout(() => chevron.classList.remove('crm-shake'), 450);
        showCrmToast(
          '<strong>Stage 3 Locked:</strong><br>' +
          'Cannot dispatch truck until EMEA Sub-Territory Code and Global Channel Partner Matrix are populated.'
        );
      } else {
        playWin98Sound('chord');
        showCrmToast(
          '<strong>Action Denied:</strong><br>' +
          'You cannot dispatch or invoice until you fill out all 214 mandatory fields or purchase the Enterprise Pipeline Bypass Add-on ($350/mo).'
        );
      }
    });
  });

  // Edit Button
  document.getElementById('btnCrmEdit')?.addEventListener('click', () => {
    playWin98Sound('chord');
    showCrmToast(
      '<strong>Permission Restricted:</strong><br>' +
      'Editing this record requires Enterprise Cloud v14.2 Tier 3 Security Clearance or a $250/seat privilege upgrade.'
    );
  });

  // Clickable Form Fields
  document.querySelectorAll('.crm-clickable-field').forEach(field => {
    field.addEventListener('click', () => {
      playWin98Sound('error');
      showCrmToast(
        '<strong>Mandatory Field:</strong><br>' +
        'Cannot leave empty. Fill out this corporate compliance box to proceed.'
      );
    });
  });

  // CRM Navigation Tabs
  const crmTabs = document.querySelectorAll('#crmTabStrip .crm-tab');
  crmTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.getAttribute('data-crm-tab');
      crmTabs.forEach(t => t.classList.remove('active-crm-tab'));
      tab.classList.add('active-crm-tab');

      if (tabType === 'deals') {
        const card = document.getElementById('crmMandatoryFieldsCard');
        card?.classList.add('crm-highlight-red');
        setTimeout(() => card?.classList.remove('crm-highlight-red'), 1200);
      } else if (tabType === 'ai' || tabType === 'sentiment' || tabType === 'email') {
        const target = tabType === 'sentiment' ? document.getElementById('crmSentimentCard') :
                       tabType === 'email' ? document.getElementById('crmEmailCard') :
                       document.getElementById('crmAiHeader');
        target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        target?.classList.add('crm-highlight-purple');
        setTimeout(() => target?.classList.remove('crm-highlight-purple'), 1200);
      } else if (tabType === 'zapier') {
        const zapier = document.getElementById('crmZapierCard');
        zapier?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        zapier?.classList.add('crm-highlight-red');
        setTimeout(() => zapier?.classList.remove('crm-highlight-red'), 1200);
      } else if (tabType === 'plugins') {
        showCrmToast(
          '<strong>AppExchange Marketplace:</strong><br>' +
          '14 third-party plugins installed ($1,240/mo total). 9 of them haven\'t been opened since 2022.'
        );
      } else if (tabType === 'home') {
        showCrmToast(
          '<strong>Home Dashboard:</strong><br>' +
          '38 widgets loading... Please wait 4.8 seconds.'
        );
      }
    });
  });

  // Windows 98 Dialog & Toolbar Micro-Interactions (Layman Shop Edition)
  const win98Title = document.getElementById('win98ModalTitle');
  const win98Msg = document.getElementById('win98ModalMsg');
  const win98Status = document.getElementById('win98StatusText');
  const win98Modal = document.getElementById('win98AlertModal');

  document.getElementById('btnWin98Retry')?.addEventListener('click', () => {
    playWin98Sound('floppy');
    if (win98Title && win98Msg) {
      win98Title.textContent = 'STILL WAITING: SHARON IS ON PAGE 3 OF PAYROLL';
      win98Msg.innerHTML = 'Your mouse cursor turned into an hourglass. The computer is completely frozen. Sharon says she will be done in 45 minutes.';
    }
    if (win98Status) win98Status.textContent = 'COMPUTER FROZEN: Please wait for Sharon to finish payroll...';
  });

  document.getElementById('btnWin98Paper')?.addEventListener('click', () => {
    playWin98Sound('printer');
    if (win98Title && win98Msg) {
      win98Title.textContent = 'THE STICKY NOTE TECH STACK';
      win98Msg.innerHTML = 'Dispatcher wrote the $1,420 rate on a yellow sticky note. Someone bumped the desk and it fell behind the filing cabinet. The customer got billed $0.';
    }
    if (win98Status) win98Status.textContent = 'ORDER STATUS: Lost behind filing cabinet.';
  });

  document.getElementById('btnWin98SeatTax')?.addEventListener('click', () => {
    playWin98Sound('chord');
    if (win98Title && win98Msg) {
      win98Title.textContent = 'BILLING NOTICE: CREDIT CARD CHARGED +$495/MO';
      win98Msg.innerHTML = 'You paid +$495/mo to provision user seats for your 3 new coordinators. But Salesforce still takes 5 seconds to load and demands 214 mandatory boxes, so your coordinators closed the browser and went back to writing jobs on paper anyway.';
    }
    if (win98Status) win98Status.textContent = 'CREDIT CARD BILLED +$495/MO: 3 coordinators still using sticky notes.';
  });

  document.getElementById('btnWin98Abort')?.addEventListener('click', () => {
    playWin98Sound('error');
    if (win98Title && win98Msg) {
      win98Title.textContent = 'BLUE SCREEN: POWER BUTTON PRESSED';
      win98Msg.innerHTML = 'You held the power button down for 10 seconds. The screen went black. When it restarted, the database file was damaged and 6 orders entered this morning are gone forever.';
    }
    if (win98Status) win98Status.textContent = 'SYSTEM CRASHED: 6 customer orders vanished into thin air.';
  });

  function handleWin98Close() {
    if (win98Modal) {
      win98Modal.style.display = 'none';
      if (win98Status) win98Status.textContent = 'Dialog dismissed. Underlying shop database running in unstable mode.';
      setTimeout(() => {
        playWin98Sound('error');
        win98Modal.style.display = 'block';
        if (win98Title && win98Msg) {
          win98Title.textContent = 'CANNOT CLOSE: THE SOFTWARE IS STILL BROKEN';
          win98Msg.innerHTML = 'You cannot close this alert. The $3,800/mo CRM is still frozen with 214 blank boxes, and Sharon is still running payroll on this desktop.';
        }
      }, 1200);
    }
  }

  document.getElementById('btnWin98CloseX')?.addEventListener('click', handleWin98Close);
  document.getElementById('btnWin98TitleClose')?.addEventListener('click', handleWin98Close);

  document.getElementById('btnW98Save')?.addEventListener('click', () => {
    playWin98Sound('floppy');
    if (win98Status) win98Status.textContent = 'Saving Order... [Loud grinding noise]... Floppy disk is full! Order was NOT saved.';
  });

  document.getElementById('btnW98Print')?.addEventListener('click', () => {
    playWin98Sound('printer');
    if (win98Status) win98Status.textContent = 'Printing on LPT1... Dot-matrix printer screaming! Tractor-feed carbon paper jammed on ink ribbon.';
  });

  const handleSync = () => {
    playWin98Sound('error');
    if (win98Status) win98Status.textContent = 'Zapier Task #8841 Failed Silently: 19 customer orders never made it into QuickBooks. Nobody noticed for 4 days.';
    if (win98Title && win98Msg) {
      win98Title.textContent = 'ZAPIER CLOUD SYNC: TASK FAILED SILENTLY';
      win98Msg.innerHTML = '19 customer orders from email never made it into QuickBooks. Nobody noticed for 4 days until angry clients called asking where their pipe and hotshot trucks were.';
    }
    if (win98Modal) win98Modal.style.display = 'block';
  };
  document.getElementById('btnW98SyncTool')?.addEventListener('click', handleSync);
  document.getElementById('menuW98Sync')?.addEventListener('click', handleSync);

  const handleSeatTool = () => {
    playWin98Sound('chord');
    if (win98Status) win98Status.textContent = 'SEAT TAX NOTICE: Pay +$495/mo to unlock user seats for 3 new coordinators.';
    if (win98Title && win98Msg) {
      win98Title.textContent = 'SEAT TAX NOTICE: +$495/MO TO UNLOCK 3 LOGINS';
      win98Msg.innerHTML = 'Your commercial CRM demands another $495/month just because you hired 3 new shop coordinators. Or upgrade to Enterprise ($250/seat/month).';
    }
    if (win98Modal) win98Modal.style.display = 'block';
  };
  document.getElementById('btnW98SeatTaxTool')?.addEventListener('click', handleSeatTool);
  document.getElementById('menuW98Seats')?.addEventListener('click', handleSeatTool);

  const handleChuck = () => {
    if (win98Status) win98Status.textContent = 'Calling Chuck (713-555-0199)... Chuck\'s voicemail: "I retired to Florida in 2008. Stop calling me about the Access database."';
  };
  document.getElementById('btnW98ChuckTool')?.addEventListener('click', handleChuck);
  document.getElementById('menuW98Chuck')?.addEventListener('click', handleChuck);

  const handleKick = () => {
    playWin98Sound('error');
    if (win98Status) win98Status.textContent = 'Wiggled power cord under desk... Power supply sparked! Computer shut down. Entire office lost their work.';
  };
  document.getElementById('btnW98KickTool')?.addEventListener('click', handleKick);
  document.getElementById('menuW98Kick')?.addEventListener('click', handleKick);

  document.getElementById('btnW98Reindex')?.addEventListener('click', () => {
    if (win98Status) win98Status.textContent = 'Fixing database: 1% complete... Estimated finish time: Thursday at 4:30 PM. Nobody can work.';
  });

  document.getElementById('menuW98File')?.addEventListener('click', () => {
    if (win98Status) win98Status.textContent = 'File menu: Floppy disk write-protected. Cannot export customer file.';
  });
  document.getElementById('menuW98Orders')?.addEventListener('click', () => {
    if (win98Status) win98Status.textContent = 'Customer Orders: 18 dispatchers currently locked out by Sharon.';
  });
  document.getElementById('menuW98Quotes')?.addEventListener('click', () => {
    if (win98Status) win98Status.textContent = 'Quotes: Price sheet hasn\'t been updated since 2012.';
  });
  document.getElementById('menuW98Help')?.addEventListener('click', () => {
    if (win98Status) win98Status.textContent = 'Help: The printed manual was lost in the 2004 shop move across town.';
  });

  // Stage 3: Custom Hub Micro-Interactions
  document.getElementById('btnCustomNewOrder')?.addEventListener('click', () => {
    playWin98Sound('chord');
    const speedBadge = document.getElementById('mockupSpeedBadge');
    if (speedBadge) {
      const orig = speedBadge.textContent;
      speedBadge.textContent = 'ORDER #004823 CREATED IN 0.18s';
      setTimeout(() => {
        speedBadge.textContent = orig;
      }, 2500);
    }
  });

  document.getElementById('btnCustomQuickBooks')?.addEventListener('click', () => {
    playWin98Sound('chord');
    const speedBadge = document.getElementById('mockupSpeedBadge');
    if (speedBadge) {
      const orig = speedBadge.textContent;
      speedBadge.textContent = 'QUICKBOOKS SYNCED: 0 FAILURES (0.12s)';
      setTimeout(() => {
        speedBadge.textContent = orig;
      }, 2500);
    }
  });
}

/* 7. CALCULATOR-TO-FORM BRIDGE, PRICING TIER PREFILL & COPY EMAIL */
function initInteractiveBridges() {
  const attachCalcBtn = document.getElementById('attachCalcBtn');
  const scopeInput = document.getElementById('projectScope');
  const contactSection = document.getElementById('contact');

  if (attachCalcBtn && scopeInput) {
    attachCalcBtn.addEventListener('click', () => {
      const emp = document.getElementById('employeeCount')?.value || '25';
      const saas = document.getElementById('saasPerUser')?.value || '150';
      const hours = document.getElementById('manualHours')?.value || '5';
      const waste = document.getElementById('totalAnnualWaste')?.textContent || '$282,500';
      const savings = document.getElementById('recapturedSavings')?.textContent || '$197,750 / yr';

      const calcText = `We have ${emp} team members spending ~$${saas}/seat/mo on software and ~${hours} hrs/wk each on manual busywork (Estimated annual waste: ${waste} | Projected savings: ${savings}). We want to explore replacing our current setup with custom software.`;

      scopeInput.value = calcText;
      scopeInput.focus();
      scopeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const originalBtnText = attachCalcBtn.innerHTML;
      attachCalcBtn.innerHTML = `<span>Numbers Attached to Form</span>`;
      scopeInput.style.borderColor = 'var(--copper)';
      setTimeout(() => {
        attachCalcBtn.innerHTML = originalBtnText;
        scopeInput.style.borderColor = '';
      }, 2500);
    });
  }

  // Pricing tier selection prefill
  document.querySelectorAll('[data-select-tier]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tierName = btn.getAttribute('data-select-tier');
      if (scopeInput && tierName && !scopeInput.value.includes(tierName)) {
        scopeInput.value = `[Interested in: ${tierName}] ` + scopeInput.value;
      }
      const target = document.getElementById('calculator') || document.getElementById('contact');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => scopeInput?.focus(), 600);
    });
  });

  // 1-Click Copy Email button
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyText = document.getElementById('copyEmailText');
  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('alessionaji1@gmail.com');
        copyText.textContent = 'Copied';
        setTimeout(() => {
          copyText.textContent = 'Copy Email';
        }, 2500);
      } catch {
        window.location.href = 'mailto:alessionaji1@gmail.com';
      }
    });
  }
}

/* 8. EXPANDABLE ARCHITECTURE BLUEPRINTS */
function initStoryBlueprints() {
  const expandBtns = document.querySelectorAll('.story-expand-btn');
  expandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const drawer = btn.nextElementSibling;
      if (!drawer) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        drawer.style.maxHeight = '0px';
        drawer.classList.remove('is-open');
        const textSpan = btn.querySelector('.expand-btn-text');
        if (textSpan) textSpan.innerHTML = 'How We Fixed This (Plain English)';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        drawer.classList.add('is-open');
        drawer.style.maxHeight = `${drawer.scrollHeight + 30}px`;
        const textSpan = btn.querySelector('.expand-btn-text');
        if (textSpan) textSpan.innerHTML = 'Hide How We Fixed This';
      }
    });
  });
}

/* 9. INDUSTRY BLUEPRINT FILTER TABS */
function initIndustryFilter() {
  const filterPills = document.querySelectorAll('.industry-filter-bar .filter-pill');
  const storyCards = document.querySelectorAll('.case-grid .story-card');
  if (!filterPills.length || !storyCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter') || 'all';

      storyCards.forEach(card => {
        const industries = (card.getAttribute('data-industry') || '').split(' ');
        if (filter === 'all' || industries.includes(filter)) {
          card.classList.remove('is-filtered-out');
        } else {
          card.classList.add('is-filtered-out');
        }
      });
    });
  });
}

/* 10. PRIVACY POLICY & TERMS OF SERVICE MODALS */
function initLegalModals() {
  const backdrop = document.getElementById('legalModalBackdrop');
  const closeBtn = document.getElementById('closeLegalModal');
  const titleEl = document.getElementById('legalModalTitle');
  const bodyEl = document.getElementById('legalModalBody');
  const privacyLink = document.getElementById('openPrivacyModal');
  const termsLink = document.getElementById('openTermsModal');

  if (!backdrop || !titleEl || !bodyEl) return;

  const legalDocs = {
    privacy: {
      title: 'Privacy Policy — Arx Tessera (najialess.io)',
      html: `
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p><strong>1. Strict Confidentiality & Zero Data Resale:</strong> Arx Tessera ("we", "our") respects your business privacy. Any contact details, operational metrics, or project descriptions submitted through najialess.io are used strictly to prepare for and conduct your requested consultation. We never sell, rent, or share your information with third-party marketers.</p>
        <p><strong>2. Mutual NDA Protection:</strong> All software audits, CRM schemas, workflows, and proprietary business data shared with Arx Tessera are treated as strictly confidential trade secrets.</p>
        <p><strong>3. Security & Encryption:</strong> All form transmissions are encrypted via TLS/HTTPS and routed directly to our principal engineering inbox (alessionaji1@gmail.com).</p>
        <p><strong>4. Contact & Deletion Requests:</strong> You may request complete deletion of your inquiry records at any time by emailing <strong>alessionaji1@gmail.com</strong>.</p>
      `
    },
    terms: {
      title: 'Terms of Service & 100% Ownership Standard',
      html: `
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p><strong>1. 100% Client Intellectual Property Ownership:</strong> Upon final milestone completion of any custom software, CRM rebuild, or automation project with Arx Tessera, 100% of the source code, database schemas, and intellectual property belong exclusively to your company. We charge zero recurring per-seat licensing fees.</p>
        <p><strong>2. Fixed-Scope Blueprints:</strong> Every engineering engagement is governed by a written Statement of Work (SOW) with fixed milestone deliverables, clear timelines, and a 90-day bug-free warranty.</p>
        <p><strong>3. ROI & Calculator Estimates:</strong> The savings calculator on najialess.io provides illustrative financial projections based on user-supplied inputs. Exact project savings and timelines are confirmed during your free 30-minute practical audit.</p>
      `
    }
  };

  function openModal(type) {
    const doc = legalDocs[type];
    if (!doc) return;
    titleEl.textContent = doc.title;
    bodyEl.innerHTML = doc.html;
    backdrop.classList.add('open');
    backdrop.style.display = 'flex';
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('open');
    backdrop.style.display = 'none';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('privacy');
    });
  }

  if (termsLink) {
    termsLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('terms');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
