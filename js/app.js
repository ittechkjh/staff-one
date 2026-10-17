/**
 * 스탭 원라인 (STAFF-ONE) 2026 Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initLucideIcons();
  initPortfolioFilter();
  initCalculator();
  initContactForm();
  initSmoothScroll();
});

// Initialize Lucide Icons
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Mobile Menu Drawer
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-backdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Portfolio Filter
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const items = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));
      filterBtns.forEach(b => b.classList.add('bg-slate-800', 'text-slate-300'));
      btn.classList.add('active', 'bg-blue-600', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-300');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          item.style.display = 'block';
          item.classList.add('animate-fadeIn');
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Estimate Calculator
const STAFF_RATES = {
  operations: { name: '운영스탭', daily: 130000, half: 85000 },
  guide: { name: '안내/등록스탭', daily: 140000, half: 90000 },
  leader: { name: '진행팀장 (현장관리)', daily: 220000, half: 140000 },
  protocol: { name: '시상식/VIP 의전도우미', daily: 180000, half: 120000 },
  interpreter: { name: '전문 통역 / 리에종', daily: 250000, half: 160000 },
  promoter: { name: '부스 홍보 / 프로모터', daily: 150000, half: 95000 },
  audience: { name: '방송/행사 방청객', daily: 50000, half: 35000 }
};

const RENTAL_RATES = {
  radio: { name: '행사용 무전기 (이어마이크)', price: 15000 },
  baton: { name: '안전 경광봉 (건전지 포함)', price: 6000 },
  tshirt: { name: '스탭 전용 티셔츠 (반팔)', price: 5000 },
  lanyard: { name: '카드형 스탭 목걸이', price: 0 }, // 무료제공
  belt: { name: '고급형 블랙 벨트 차단봉', price: 15000 },
  banner_in: { name: '실내 배너대 (600*1800)', price: 5000 },
  banner_out: { name: '실외 물통 배너대 (600*1800)', price: 10000 },
  banner_steel: { name: '철제 프리미엄 배너대 (600*1500)', price: 20000 }
};

let calcState = {
  staffCounts: {
    operations: 2,
    guide: 2,
    leader: 1,
    protocol: 0,
    interpreter: 0,
    promoter: 0,
    audience: 0
  },
  shiftType: 'daily', // 'daily' or 'half'
  days: 1,
  rentalChecked: {
    radio: true,
    baton: false,
    tshirt: true,
    lanyard: true,
    belt: false,
    banner_in: false,
    banner_out: false,
    banner_steel: false
  },
  rentalQty: {
    radio: 5,
    baton: 2,
    tshirt: 5,
    lanyard: 5,
    belt: 2,
    banner_in: 2,
    banner_out: 2,
    banner_steel: 2
  },
  includeVAT: true
};

function initCalculator() {
  const daysSlider = document.getElementById('calc-days-slider');
  const daysDisplay = document.getElementById('calc-days-display');
  const shiftSelects = document.querySelectorAll('input[name="shift-type"]');
  const vatCheckbox = document.getElementById('calc-vat-toggle');

  // Days Slider
  if (daysSlider && daysDisplay) {
    daysSlider.addEventListener('input', (e) => {
      calcState.days = parseInt(e.target.value, 10);
      daysDisplay.textContent = `${calcState.days}일`;
      updateCalculation();
    });
  }

  // Shift Type
  shiftSelects.forEach(radio => {
    radio.addEventListener('change', (e) => {
      calcState.shiftType = e.target.value;
      updateCalculation();
    });
  });

  // VAT Toggle
  if (vatCheckbox) {
    vatCheckbox.addEventListener('change', (e) => {
      calcState.includeVAT = e.target.checked;
      updateCalculation();
    });
  }

  // Staff Count +/-
  document.querySelectorAll('[data-staff-type]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-staff-type');
      const action = btn.getAttribute('data-action');
      if (action === 'plus') {
        calcState.staffCounts[type] = (calcState.staffCounts[type] || 0) + 1;
      } else if (action === 'minus') {
        calcState.staffCounts[type] = Math.max(0, (calcState.staffCounts[type] || 0) - 1);
      }
      const countEl = document.getElementById(`count-${type}`);
      if (countEl) countEl.textContent = calcState.staffCounts[type];
      updateCalculation();
    });
  });

  // Rental Checkboxes & Qty
  Object.keys(RENTAL_RATES).forEach(itemKey => {
    const chk = document.getElementById(`rental-chk-${itemKey}`);
    const qtyInput = document.getElementById(`rental-qty-${itemKey}`);

    if (chk) {
      chk.addEventListener('change', (e) => {
        calcState.rentalChecked[itemKey] = e.target.checked;
        if (qtyInput) qtyInput.disabled = !e.target.checked;
        updateCalculation();
      });
    }

    if (qtyInput) {
      qtyInput.addEventListener('input', (e) => {
        calcState.rentalQty[itemKey] = Math.max(1, parseInt(e.target.value, 10) || 1);
        updateCalculation();
      });
    }
  });

  // Quick Add from Equipment Catalog
  document.querySelectorAll('[data-add-rental]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemKey = btn.getAttribute('data-add-rental');
      if (calcState.rentalChecked.hasOwnProperty(itemKey)) {
        calcState.rentalChecked[itemKey] = true;
        const chk = document.getElementById(`rental-chk-${itemKey}`);
        const qtyInput = document.getElementById(`rental-qty-${itemKey}`);
        if (chk) chk.checked = true;
        if (qtyInput) qtyInput.disabled = false;

        updateCalculation();
        showToast(`'${RENTAL_RATES[itemKey].name}'이(가) 견적 계산기에 추가되었습니다.`);

        // Smooth scroll to calculator
        const calcSection = document.getElementById('calculator');
        if (calcSection) {
          calcSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Buttons in Calculator Summary
  const copyBtn = document.getElementById('btn-copy-estimate');
  const formFillBtn = document.getElementById('btn-fill-form');

  if (copyBtn) copyBtn.addEventListener('click', copyEstimateToClipboard);
  if (formFillBtn) formFillBtn.addEventListener('click', fillEstimateToForm);

  // Initial Calculation
  updateCalculation();
}

function updateCalculation() {
  let staffTotal = 0;
  let totalStaffMembers = 0;
  const shiftKey = calcState.shiftType; // 'daily' or 'half'

  // Calculate Staff Costs
  Object.keys(calcState.staffCounts).forEach(type => {
    const count = calcState.staffCounts[type];
    if (count > 0 && STAFF_RATES[type]) {
      const rate = STAFF_RATES[type][shiftKey];
      staffTotal += rate * count * calcState.days;
      totalStaffMembers += count;
    }
  });

  // Calculate Rental Costs
  let rentalTotal = 0;
  let selectedRentalCount = 0;
  Object.keys(calcState.rentalChecked).forEach(itemKey => {
    if (calcState.rentalChecked[itemKey] && RENTAL_RATES[itemKey]) {
      const price = RENTAL_RATES[itemKey].price;
      const qty = calcState.rentalQty[itemKey] || 1;
      rentalTotal += price * qty;
      selectedRentalCount++;
    }
  });

  const subtotal = staffTotal + rentalTotal;
  const vatAmount = calcState.includeVAT ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = subtotal + vatAmount;

  // Render to DOM
  const staffTotalEl = document.getElementById('calc-staff-subtotal');
  const rentalTotalEl = document.getElementById('calc-rental-subtotal');
  const vatTotalEl = document.getElementById('calc-vat-amount');
  const grandTotalEl = document.getElementById('calc-grand-total');
  const staffSummaryEl = document.getElementById('calc-staff-summary-badge');

  if (staffTotalEl) staffTotalEl.textContent = `${staffTotal.toLocaleString('ko-KR')}원`;
  if (rentalTotalEl) rentalTotalEl.textContent = `${rentalTotal.toLocaleString('ko-KR')}원`;
  if (vatTotalEl) vatTotalEl.textContent = `${vatAmount.toLocaleString('ko-KR')}원`;
  if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toLocaleString('ko-KR')}원`;
  if (staffSummaryEl) staffSummaryEl.textContent = `총 인원 ${totalStaffMembers}명 / ${calcState.days}일간`;
}

// Generate Text Summary for Estimate
function generateEstimateText() {
  let text = `[스탭 원라인(STAFF-ONE) 실시간 견적 산출 내역]\n`;
  text += `--------------------------------------\n`;
  text += `■ 행사 일정: ${calcState.days}일간 (${calcState.shiftType === 'daily' ? '전일 8시간 근무' : '반일 4시간 근무'})\n\n`;
  text += `■ 투입 스탭 구성:\n`;

  let hasStaff = false;
  Object.keys(calcState.staffCounts).forEach(type => {
    const count = calcState.staffCounts[type];
    if (count > 0 && STAFF_RATES[type]) {
      hasStaff = true;
      const rate = STAFF_RATES[type][calcState.shiftType];
      text += ` - ${STAFF_RATES[type].name}: ${count}명 (단가: ${rate.toLocaleString()}원/일)\n`;
    }
  });
  if (!hasStaff) text += ` - 선택된 인력 없음\n`;

  text += `\n■ 운영물품 렌탈:\n`;
  let hasRental = false;
  Object.keys(calcState.rentalChecked).forEach(itemKey => {
    if (calcState.rentalChecked[itemKey] && RENTAL_RATES[itemKey]) {
      hasRental = true;
      const r = RENTAL_RATES[itemKey];
      const qty = calcState.rentalQty[itemKey] || 1;
      const priceText = r.price === 0 ? '무료 제공' : `${(r.price * qty).toLocaleString()}원 (${qty}개)`;
      text += ` - ${r.name}: ${priceText}\n`;
    }
  });
  if (!hasRental) text += ` - 선택된 렌탈 물품 없음\n`;

  // Calculate final numbers
  let staffTotal = 0;
  Object.keys(calcState.staffCounts).forEach(type => {
    const count = calcState.staffCounts[type];
    if (count > 0) staffTotal += STAFF_RATES[type][calcState.shiftType] * count * calcState.days;
  });
  let rentalTotal = 0;
  Object.keys(calcState.rentalChecked).forEach(itemKey => {
    if (calcState.rentalChecked[itemKey]) rentalTotal += RENTAL_RATES[itemKey].price * (calcState.rentalQty[itemKey] || 1);
  });
  const subtotal = staffTotal + rentalTotal;
  const vat = calcState.includeVAT ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + vat;

  text += `--------------------------------------\n`;
  text += `■ 인건비 소계: ${staffTotal.toLocaleString()}원\n`;
  text += `■ 렌탈비 소계: ${rentalTotal.toLocaleString()}원\n`;
  if (calcState.includeVAT) {
    text += `■ 부가세(VAT 10%): ${vat.toLocaleString()}원\n`;
  }
  text += `★ 총 예상 금액: ${total.toLocaleString()}원 (${calcState.includeVAT ? 'VAT 포함' : 'VAT 별도'})\n`;
  text += `--------------------------------------\n`;
  text += `※ 실제 행사의 세부 시간대, 야간수당, 지방출장 여부에 따라 일부 변동될 수 있습니다.\n`;
  text += `※ 섭외문의: 김용 실장 (010-8827-0486) / staff_one@naver.com\n`;
  return text;
}

// Copy to Clipboard
function copyEstimateToClipboard() {
  const text = generateEstimateText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('견적 내역이 클립보드에 복사되었습니다! 카카오톡이나 메일에 바로 붙여넣어 문의해보세요.');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('견적 내역이 클립보드에 복사되었습니다!');
  } catch (err) {
    alert('클립보드 복사에 실패했습니다. 아래 폼을 통해 문의해주세요.');
  }
  document.body.removeChild(textArea);
}

// Fill Estimate to Form
function fillEstimateToForm() {
  const text = generateEstimateText();
  const contactTextarea = document.getElementById('contact-details');
  const contactSection = document.getElementById('contact');

  if (contactTextarea) {
    contactTextarea.value = text;
  }
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    showToast('산출된 견적 정보가 상담 문의 내용에 자동으로 입력되었습니다.');
  }
}

// Toast Notice Utility
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="text-blue-400 font-bold">✓</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Contact Form Handler
function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const eventDate = document.getElementById('contact-date').value.trim();
    const eventLocation = document.getElementById('contact-location').value.trim();
    const details = document.getElementById('contact-details').value.trim();
    const privacy = document.getElementById('contact-privacy').checked;

    if (!name || !phone) {
      alert('담당자 이름과 연락처를 입력해 주세요.');
      return;
    }

    if (!privacy) {
      alert('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    // Build mailto body
    const subject = encodeURIComponent(`[스탭원라인 섭외문의] ${name}님 (${phone})`);
    const body = encodeURIComponent(
      `담당자/소속: ${name}\n` +
      `연락처: ${phone}\n` +
      `이메일: ${email}\n` +
      `행사일정: ${eventDate}\n` +
      `행사장소: ${eventLocation}\n\n` +
      `[상세 섭외 및 견적 내용]\n${details}\n`
    );

    // Open mail client or show direct guide
    const mailtoUrl = `mailto:staff_one@naver.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    showToast('메일 프로그램이 열립니다. 즉각적인 상담을 원하시면 김용 실장(010-8827-0486)으로 전화주세요!');
  });
}

// Smooth Scroll for in-page anchors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
