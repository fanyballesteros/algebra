/* ==========================================================================
   SIMULADOR 1: EL DESCODIFICADOR DE PATRONS (Tasca 1)
   Generació visual de figures, màquina de funcions i comprovador de fórmules
   ========================================================================== */

const SimPatrons = {
  patterns: [
    {
      id: "suport-1",
      name: "Patró 1: Les Rajoles Blaves (🟢 Suport)",
      desc: "Comença amb 3 rajoles i a cada pas s'afegeixen 2 rajoles noves.",
      fn: (n) => 2 * n + 1,
      formulaDisplay: "2n + 1",
      color: "#0284c7",
      level: "support"
    },
    {
      id: "standard-1",
      name: "Patró 2: Les Taules i Cadires (🟡 Estàndard)",
      desc: "Taula quadrada: a cada pas sumem 3 cadires al voltant.",
      fn: (n) => 3 * n + 1,
      formulaDisplay: "3n + 1",
      color: "#2563eb",
      level: "standard"
    },
    {
      id: "challenge-1",
      name: "Patró 3: La Piràmide L (🔵 Repte - Altes Capacitats)",
      desc: "Una figura en forma de creu que creix ràpidament: 4 vegades el pas menys 1.",
      fn: (n) => 4 * n - 1,
      formulaDisplay: "4n - 1",
      color: "#7c3aed",
      level: "challenge"
    }
  ],

  currentPatternIdx: 0,

  init() {
    this.renderSelector();
    this.renderVisualization();
    this.attachEvents();
  },

  renderSelector() {
    const selector = document.getElementById("pattern-select");
    if (!selector) return;
    selector.innerHTML = this.patterns.map((p, idx) => `
      <option value="${idx}">${p.name}</option>
    `).join("");
    selector.value = this.currentPatternIdx;
  },

  renderVisualization() {
    const container = document.getElementById("pattern-visual-container");
    if (!container) return;

    const p = this.patterns[this.currentPatternIdx];
    const stepsCount = 4; // Mostrem passos 1, 2, 3 i 4

    let html = `<div class="pattern-steps-grid">`;
    for (let n = 1; n <= stepsCount; n++) {
      const count = p.fn(n);
      html += `
        <div class="pattern-step-col">
          <span class="pattern-step-label">Pas ${n}</span>
          <div class="pattern-dot-canvas">
            ${this.renderDots(n, count, p)}
          </div>
          <strong style="color: #475569; font-size: 0.95rem;">Total: ${count}</strong>
        </div>
      `;
    }
    html += `</div>`;
    container.innerHTML = html;

    // Actualitza descripció
    const descEl = document.getElementById("pattern-task-desc");
    if (descEl) descEl.textContent = p.desc;

    // Neteja feedback anterior
    const fb = document.getElementById("pattern-feedback");
    if (fb) {
      fb.className = "sim-feedback";
      fb.textContent = "";
    }
  },

  renderDots(step, total, pattern) {
    // Genera una graella visual intuïtiva de quadradets
    let rowsHtml = '';
    const cols = Math.min(total, step + 2);
    let placed = 0;

    while (placed < total) {
      const currentBatch = Math.min(cols, total - placed);
      let dots = '';
      for (let i = 0; i < currentBatch; i++) {
        // Destaquem els elements afegits respecte al pas anterior
        const prevCount = step > 1 ? pattern.fn(step - 1) : 0;
        const isNew = (placed + i) >= prevCount && step > 1;
        dots += `<div class="dot-unit ${isNew ? 'new-item' : ''}" style="${isNew ? '' : `background-color: ${pattern.color};`}" title="Element ${placed + i + 1}"></div>`;
      }
      rowsHtml += `<div class="dot-row">${dots}</div>`;
      placed += currentBatch;
    }
    return rowsHtml;
  },

  checkFormula() {
    const input = document.getElementById("pattern-formula-input");
    const fb = document.getElementById("pattern-feedback");
    if (!input || !fb) return;

    const userRaw = input.value.trim().toLowerCase().replace(/\s+/g, '');
    if (!userRaw) {
      fb.className = "sim-feedback visible incorrect";
      fb.textContent = "Introdueix una fórmula (per exemple: 2n + 1)";
      return;
    }

    const p = this.patterns[this.currentPatternIdx];

    // Funció segura per avaluar l'expressió de l'alumne per n = 1, 2, 3, 4, 10
    let isCorrect = true;
    const testValues = [1, 2, 3, 4, 10];

    // Adaptem formats admesos: 2n, 2*n, 2x, 2*x
    const cleanExpr = userRaw.replace(/x/g, 'n').replace(/(\d+)n/g, '$1*n');

    try {
      for (const val of testValues) {
        // Avaluació matemàtica segura
        const userCalculated = Function('n', `"use strict"; return (${cleanExpr});`)(val);
        const expected = p.fn(val);
        if (Math.abs(userCalculated - expected) > 0.001) {
          isCorrect = false;
          break;
        }
      }
    } catch (err) {
      fb.className = "sim-feedback visible incorrect";
      fb.textContent = "No hem entès la fórmula. Recorda fer servir 'n' com a pas (ex: 2n + 1)";
      return;
    }

    if (isCorrect) {
      fb.className = "sim-feedback visible correct";
      fb.innerHTML = `🎉 <strong>Molt bé!</strong> La regla general és exacta: <code>${p.formulaDisplay}</code>. Has descodificat el patró! Si n = 100, hi haurà exactament ${p.fn(100)} elements.`;
      if (window.App) window.App.markTaskProgress("patrons");
    } else {
      fb.className = "sim-feedback visible incorrect";
      fb.innerHTML = `Encara no coincideix amb tots els passos. Fixa't quantes rajoles s'afegeixen a cada nou pas!`;
    }
  },

  testStep() {
    const stepInput = document.getElementById("pattern-test-step-input");
    const resultSpan = document.getElementById("pattern-test-step-result");
    if (!stepInput || !resultSpan) return;

    const val = parseInt(stepInput.value, 10);
    if (isNaN(val) || val < 1) {
      resultSpan.textContent = "Introdueix un nombre vàlid (> 0)";
      return;
    }

    const p = this.patterns[this.currentPatternIdx];
    const total = p.fn(val);
    resultSpan.innerHTML = `Al <strong>Pas ${val}</strong> hi haurà <span style="color:#0284c7; font-weight:800; font-size:1.1rem;">${total}</span> elements.`;
  },

  attachEvents() {
    const selector = document.getElementById("pattern-select");
    if (selector) {
      selector.addEventListener("change", (e) => {
        this.currentPatternIdx = parseInt(e.target.value, 10);
        this.renderVisualization();
      });
    }

    const checkBtn = document.getElementById("pattern-check-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => this.checkFormula());
    }

    const testBtn = document.getElementById("pattern-test-btn");
    if (testBtn) {
      testBtn.addEventListener("click", () => this.testStep());
    }
  }
};

window.SimPatrons = SimPatrons;
