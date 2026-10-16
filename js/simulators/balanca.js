/* ==========================================================================
   SIMULADOR 4: LA BALANÇA D'EQUACIONS DE 1R GRAU (Tasca 4)
   Balança interactiva física i resolució manipulativa d'equacions lineals
   ========================================================================== */

const SimBalanca = {
  presets: [
    {
      id: "preset-suport",
      name: "Equació 1 (🟢 Suport): x + 3 = 8",
      leftX: 1, leftC: 3,
      rightX: 0, rightC: 8,
      solution: 5,
      level: "support",
      hint: "Treu 3 peses de cada plat per deixar la caixa 'x' sola!"
    },
    {
      id: "preset-standard",
      name: "Equació 2 (🟡 Estàndard): 2x + 4 = 10",
      leftX: 2, leftC: 4,
      rightX: 0, rightC: 10,
      solution: 3,
      level: "standard",
      hint: "Primer resta 4 a tots dos plats. Després divideix entre 2!"
    },
    {
      id: "preset-challenge",
      name: "Equació 3 (🔵 Repte): 3x + 2 = x + 8",
      leftX: 3, leftC: 2,
      rightX: 1, rightC: 8,
      solution: 3,
      level: "challenge",
      hint: "Treu 1 caixa 'x' de cada plat perquè només quedi la incògnita a l'esquerra!"
    }
  ],

  currentPresetIdx: 0,
  state: {
    leftX: 1,
    leftC: 3,
    rightX: 0,
    rightC: 8,
    xValue: 5 // valor real secret de x
  },

  history: [],

  init() {
    this.renderPresets();
    this.loadPreset(0);
    this.attachEvents();
  },

  renderPresets() {
    const sel = document.getElementById("balance-preset-select");
    if (!sel) return;

    sel.innerHTML = this.presets.map((p, idx) => `
      <option value="${idx}">${p.name}</option>
    `).join("");
  },

  loadPreset(idx) {
    this.currentPresetIdx = idx;
    const p = this.presets[idx];
    this.state = {
      leftX: p.leftX,
      leftC: p.leftC,
      rightX: p.rightX,
      rightC: p.rightC,
      xValue: p.solution
    };
    this.history = [];
    this.updateUI();

    const hintEl = document.getElementById("balance-hint-text");
    if (hintEl) hintEl.textContent = p.hint;

    const fb = document.getElementById("balance-feedback");
    if (fb) {
      fb.className = "sim-feedback";
      fb.textContent = "";
    }
  },

  updateUI() {
    this.renderEquationText();
    this.renderPlatesContent();
    this.updateTilt();
    this.checkVictory();
  },

  formatSide(xCount, cCount) {
    let parts = [];
    if (xCount > 0) parts.push(xCount === 1 ? 'x' : `${xCount}x`);
    if (cCount > 0) {
      if (parts.length > 0) parts.push(`+ ${cCount}`);
      else parts.push(`${cCount}`);
    } else if (cCount < 0) {
      if (parts.length > 0) parts.push(`- ${Math.abs(cCount)}`);
      else parts.push(`${cCount}`);
    }
    return parts.length > 0 ? parts.join(" ") : "0";
  },

  renderEquationText() {
    const leftEl = document.getElementById("balance-eq-left");
    const rightEl = document.getElementById("balance-eq-right");
    if (leftEl) leftEl.textContent = this.formatSide(this.state.leftX, this.state.leftC);
    if (rightEl) rightEl.textContent = this.formatSide(this.state.rightX, this.state.rightC);
  },

  renderPlatesContent() {
    const leftPlate = document.getElementById("balance-plate-left");
    const rightPlate = document.getElementById("balance-plate-right");

    if (leftPlate) {
      let items = "";
      for (let i = 0; i < this.state.leftX; i++) items += `<div class="scale-box-x" title="Caixa misteriosa x">x</div>`;
      for (let i = 0; i < Math.min(this.state.leftC, 15); i++) items += `<div class="scale-weight-1" title="Pesa de 1">1</div>`;
      if (this.state.leftC > 15) items += `<div class="scale-weight-1" style="background:#dc2626">+${this.state.leftC - 15}</div>`;
      leftPlate.innerHTML = items || "<span style='font-size:0.75rem; color:#94a3b8;'>Buit</span>";
    }

    if (rightPlate) {
      let items = "";
      for (let i = 0; i < this.state.rightX; i++) items += `<div class="scale-box-x" title="Caixa misteriosa x">x</div>`;
      for (let i = 0; i < Math.min(this.state.rightC, 15); i++) items += `<div class="scale-weight-1" title="Pesa de 1">1</div>`;
      if (this.state.rightC > 15) items += `<div class="scale-weight-1" style="background:#dc2626">+${this.state.rightC - 15}</div>`;
      rightPlate.innerHTML = items || "<span style='font-size:0.75rem; color:#94a3b8;'>Buit</span>";
    }
  },

  updateTilt() {
    const beam = document.getElementById("balance-beam");
    if (!beam) return;

    // Càlcul del pes real a cada banda
    const leftTotalWeight = this.state.leftX * this.state.xValue + this.state.leftC;
    const rightTotalWeight = this.state.rightX * this.state.xValue + this.state.rightC;

    const diff = rightTotalWeight - leftTotalWeight;
    let angle = 0;

    if (diff > 0) {
      angle = Math.min(14, diff * 2.5); // s'inclina cap a la dreta
    } else if (diff < 0) {
      angle = Math.max(-14, diff * 2.5); // s'inclina cap a l'esquerra
    }

    beam.style.transform = `rotate(${angle}deg)`;
  },

  // Operacions legítimes que mantenen la balança en equilibri
  applyOperation(op, value) {
    this.history.push({ ...this.state });

    if (op === "addC") {
      this.state.leftC += value;
      this.state.rightC += value;
    } else if (op === "subC") {
      if (this.state.leftC - value < 0 && this.state.rightC - value < 0) {
        alert("No podem treure més peses positives que les que hi ha ara mateix.");
        return;
      }
      this.state.leftC -= value;
      this.state.rightC -= value;
    } else if (op === "subX") {
      if (this.state.leftX < value || this.state.rightX < value) {
        alert("No hi ha caixes 'x' suficients a ambdós plats per treure'n.");
        return;
      }
      this.state.leftX -= value;
      this.state.rightX -= value;
    } else if (op === "div") {
      if (this.state.leftX % value !== 0 || this.state.leftC % value !== 0 ||
          this.state.rightX % value !== 0 || this.state.rightC % value !== 0) {
        alert(`No tots els termes són divisibles exactament entre ${value}.`);
        return;
      }
      this.state.leftX /= value;
      this.state.leftC /= value;
      this.state.rightX /= value;
      this.state.rightC /= value;
    }

    this.updateUI();
  },

  checkVictory() {
    const fb = document.getElementById("balance-feedback");
    if (!fb) return;

    // Resolució aconseguida quan: (leftX === 1, leftC === 0, rightX === 0) o viceversa
    if (this.state.leftX === 1 && this.state.leftC === 0 && this.state.rightX === 0) {
      fb.className = "sim-feedback visible correct";
      fb.innerHTML = `🎉 <strong>EQUACIÓ RESOLTA!</strong> La incògnita <code>x = ${this.state.rightC}</code>. Cada caixa misteriosa 'x' pesa exactament ${this.state.rightC} unitats!`;
      if (window.App) window.App.markTaskProgress("balanca");
    } else if (this.state.rightX === 1 && this.state.rightC === 0 && this.state.leftX === 0) {
      fb.className = "sim-feedback visible correct";
      fb.innerHTML = `🎉 <strong>EQUACIÓ RESOLTA!</strong> La incògnita <code>x = ${this.state.leftC}</code>.`;
      if (window.App) window.App.markTaskProgress("balanca");
    }
  },

  resetCurrent() {
    this.loadPreset(this.currentPresetIdx);
  },

  attachEvents() {
    const sel = document.getElementById("balance-preset-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        this.loadPreset(parseInt(e.target.value, 10));
      });
    }

    const resetBtn = document.getElementById("balance-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetCurrent());
    }

    // Botons d'operacions simultànies
    document.querySelectorAll(".balance-op-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const op = btn.dataset.op;
        const val = parseInt(btn.dataset.val, 10);
        this.applyOperation(op, val);
      });
    });
  }
};

window.SimBalanca = SimBalanca;
