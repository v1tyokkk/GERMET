/**
 * Калькулятор стоимости услуг — этапы разработки:
 * 1. Прайс базовых услуг, наценок и доп. опций
 * 2. Сбор значений из элементов управления формы
 * 3. Расчёт итоговой суммы и расшифровки
 * 4. Мгновенное обновление результата при любом изменении
 */

const SERVICE_PRICES = {
  diagnostics: { label: "Диагностика", base: 30 },
  leak: { label: "Устранение течи", base: 80 },
  install: { label: "Установка сантехники", base: 90 },
  cleaning: { label: "Прочистка канализации", base: 70 },
  heater: { label: "Водонагреватель", base: 110 },
  heating: { label: "Отопление / радиаторы", base: 120 },
};

const URGENCY_FACTORS = {
  normal: { label: "без наценки", factor: 1 },
  priority: { label: "+30%", factor: 1.3 },
  emergency: { label: "+60%", factor: 1.6 },
};

const EXTRA_OPTIONS = {
  materials: { label: "Материалы под ключ", price: 45 },
  area: { label: "Выезд за город", price: 25 },
  warranty: { label: "Расширенная гарантия", price: 35 },
};

function getFormValues(form) {
  const service = form.elements.service.value;
  const units = Math.min(
    20,
    Math.max(1, Number.parseInt(form.elements.units.value, 10) || 1),
  );
  const urgency = form.elements.urgency.value;
  const extras = [...form.querySelectorAll('input[name="extras"]:checked')].map(
    (input) => input.value,
  );

  return { service, units, urgency, extras };
}

function calculateTotal({ service, units, urgency, extras }) {
  const serviceInfo = SERVICE_PRICES[service] || SERVICE_PRICES.install;
  const urgencyInfo = URGENCY_FACTORS[urgency] || URGENCY_FACTORS.normal;
  const extrasSum = extras.reduce(
    (sum, key) => sum + (EXTRA_OPTIONS[key]?.price || 0),
    0,
  );
  const serviceTotal = Math.round(serviceInfo.base * units * urgencyInfo.factor);
  const total = serviceTotal + extrasSum;

  return {
    total,
    serviceInfo,
    urgencyInfo,
    units,
    extras,
    serviceTotal,
    extrasSum,
  };
}

function formatBreakdown(result) {
  const lines = [
    `Базовая услуга «${result.serviceInfo.label}»: <strong>${result.serviceInfo.base} BYN</strong>`,
    `Количество точек: <strong>×${result.units}</strong>`,
    `Срочность: <strong>${result.urgencyInfo.label}</strong>`,
  ];

  result.extras.forEach((key) => {
    const option = EXTRA_OPTIONS[key];

    if (option) {
      lines.push(`${option.label}: <strong>+${option.price} BYN</strong>`);
    }
  });

  return lines.map((line) => `<li>${line}</li>`).join("");
}

function updateResult(form, totalEl, breakdownEl) {
  form.elements.units.value = Math.min(
    20,
    Math.max(1, Number.parseInt(form.elements.units.value, 10) || 1),
  );

  const result = calculateTotal(getFormValues(form));

  totalEl.textContent = String(result.total);
  breakdownEl.innerHTML = formatBreakdown(result);

  return result;
}

function initCalculator() {
  const form = document.getElementById("calc-form");
  const totalEl = document.getElementById("calc-total");
  const breakdownEl = document.getElementById("calc-breakdown");

  if (!form || !totalEl || !breakdownEl) {
    return;
  }

  const refresh = () => updateResult(form, totalEl, breakdownEl);

  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", (event) => event.preventDefault());

  form.querySelectorAll(".calculator__step").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number.parseInt(button.dataset.step, 10) || 0;
      const current = Number.parseInt(form.elements.units.value, 10) || 1;

      form.elements.units.value = Math.min(20, Math.max(1, current + step));
      refresh();
    });
  });

  refresh();
}

document.addEventListener("DOMContentLoaded", initCalculator);
