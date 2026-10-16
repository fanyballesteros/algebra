/* ==========================================================================
   SIMULADOR 3: L'HORT D'ÀLGEBRA TILES (Tasca 3)
   Manipulatiu virtual de rajoles algebraiques i cancel·lació de parelles zero
   ========================================================================== */

const SimTiles = {
  tiles: [], // llista d'objectes { id, type: 'x2'|'x'|'1', sign: 1|-1 }

  challenges: [
    {
      id: "ch1",
      title: "Repte 1 (🟢 Suport): Sumar termes semblants senzills",
      instruction: "Afegeix 3 rajoles de 'x' i 2 rajoles de '1'. Després afegeix 1 rajola de '-x'. Què queda?",
      targetFormula: "2x + 2"
    },
    {
      id: "ch2",
      title: "Repte 2 (🟡 Estàndard): Parelles zero combinades",
      instruction: "Representa: (2x + 3) + (-3x - 1). Fes clic a 'Cancel·la Parelles Zero'!",
      targetFormula: "-x + 2"
    },
    {
      id: "ch3",
      title: "Repte 3 (🔵 Repte): Monomis de 2n grau",
      instruction: "Representa: (x² + 2x - 3) + (-x² + x + 4). Simplifica al màxim!",
      targetFormula: "3x + 1"
    }
  ],

  currentChallengeIdx: -1, // -1 vol dir mode lliure (Sandbox)

  init() {
    this.renderToolbox();
    this.renderWorkspace();
    this.attachEvents();
  },

  renderToolbox() {
    const box = document.getElementById("tiles-toolbox-container");
    if (!box) return;

    box.innerHTML = `
      <div style="font-size:0.85rem; font-weight:700; width:100%; text-align:center; color:#64748b; margin-bottom:0.3rem;">
        Clica per afegir rajoles a l'espai de treball:
      </div>
      <button class="tile-btn tile-x2-pos" data-type="x2" data-sign="1" title="Afegeix +x²">+x²</button>
      <button class="tile-btn tile-x2-neg" data-type="x2" data-sign="-1" title="Afegeix -x²">-x²</button>
      <button class="tile-btn tile-x-pos" data-type="x" data-sign="1" title="Afegeix +x">+x</button>
      <button class="tile-btn tile-x-neg" data-type="x" data-sign="-1" title="Afegeix -x">-x</button>
      <button class="tile-btn tile-1-pos" data-type="1" data-sign="1" title="Afegeix +1">+1</button>
      <button class="tile-btn tile-1-neg" data-type="1" data-sign="-1" title="Afegeix -1">-1</button>
    `;

    box.querySelectorAll(".tile-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        const sign = parseInt(btn.dataset.sign, 10);
        this.addTile(type, sign);
      });
    });
  },

  addTile(type, sign) {
    const id = Date.now() + Math.random();
    this.tiles.push({ id, type, sign });
    this.renderWorkspace();
    this.updateLiveExpression();
  },

  removeTile(id) {
    this.tiles = this.tiles.filter(t => t.id !== id);
    this.renderWorkspace();
    this.updateLiveExpression();
  },

  renderWorkspace() {
    const ws = document.getElementById("tiles-workspace");
    if (!ws) return;

    ws.innerHTML = "";
    this.tiles.forEach(t => {
      const el = document.createElement("div");
      let cssClass = "";
      let label = "";

      if (t.type === "x2") {
        cssClass = t.sign > 0 ? "tile-x2-pos" : "tile-x2-neg";
        label = t.sign > 0 ? "+x²" : "-x²";
      } else if (t.type === "x") {
        cssClass = t.sign > 0 ? "tile-x-pos" : "tile-x-neg";
        label = t.sign > 0 ? "+x" : "-x";
      } else {
        cssClass = t.sign > 0 ? "tile-1-pos" : "tile-1-neg";
        label = t.sign > 0 ? "+1" : "-1";
      }

      el.className = `board-tile ${cssClass}`;
      el.id = `tile-${t.id}`;
      el.textContent = label;
      el.title = "Fes clic per eliminar aquesta rajola";
      el.addEventListener("click", () => this.removeTile(t.id));
      ws.appendChild(el);
    });
  },

  cancelZeroPairs() {
    // Busca parelles de mateix type amb signes oposats (+1 i -1, +x i -x, +x2 i -x2)
    const types = ['x2', 'x', '1'];
    let cancelledCount = 0;

    types.forEach(tp => {
      while (true) {
        const posIdx = this.tiles.findIndex(t => t.type === tp && t.sign === 1);
        const negIdx = this.tiles.findIndex(t => t.type === tp && t.sign === -1);

        if (posIdx !== -1 && negIdx !== -1) {
          const posId = this.tiles[posIdx].id;
          const negId = this.tiles[negIdx].id;

          const elPos = document.getElementById(`tile-${posId}`);
          const elNeg = document.getElementById(`tile-${negId}`);
          if (elPos) elPos.classList.add("cancelling");
          if (elNeg) elNeg.classList.add("cancelling");

          // Eliminem de la llista
          this.tiles = this.tiles.filter(t => t.id !== posId && t.id !== negId);
          cancelledCount++;
        } else {
          break;
        }
      }
    });

    const fb = document.getElementById("tiles-feedback");
    if (cancelledCount > 0) {
      setTimeout(() => {
        this.renderWorkspace();
        this.updateLiveExpression();
      }, 500);

      if (fb) {
        fb.className = "sim-feedback visible correct";
        fb.innerHTML = `✨ <strong>Cancel·lació feta!</strong> S'han neutralitzat ${cancelledCount} parella(es) zero (+ i - es neutralitzen a 0).`;
      }
    } else {
      if (fb) {
        fb.className = "sim-feedback visible incorrect";
        fb.innerHTML = `No hi ha cap parella oposada (+ i - del mateix tipus) per cancel·lar ara mateix.`;
      }
    }

    this.checkCurrentChallenge();
  },

  updateLiveExpression() {
    const exprEl = document.getElementById("tiles-expression-text");
    if (!exprEl) return;

    let x2 = 0, x = 0, c = 0;
    this.tiles.forEach(t => {
      if (t.type === "x2") x2 += t.sign;
      if (t.type === "x") x += t.sign;
      if (t.type === "1") c += t.sign;
    });

    let parts = [];
    if (x2 !== 0) parts.push(x2 === 1 ? "x²" : x2 === -1 ? "-x²" : `${x2}x²`);
    if (x !== 0) {
      if (parts.length > 0 && x > 0) {
        parts.push(`+ ${x === 1 ? 'x' : x + 'x'}`);
      } else if (parts.length > 0 && x < 0) {
        parts.push(`- ${x === -1 ? 'x' : Math.abs(x) + 'x'}`);
      } else {
        parts.push(x === 1 ? 'x' : x === -1 ? '-x' : `${x}x`);
      }
    }
    if (c !== 0) {
      if (parts.length > 0 && c > 0) parts.push(`+ ${c}`);
      else if (parts.length > 0 && c < 0) parts.push(`- ${Math.abs(c)}`);
      else parts.push(`${c}`);
    }

    const resultStr = parts.length > 0 ? parts.join(" ") : "0";
    exprEl.textContent = resultStr;

    return resultStr.replace(/\s+/g, '');
  },

  checkCurrentChallenge() {
    if (this.currentChallengeIdx < 0) return;
    const ch = this.challenges[this.currentChallengeIdx];
    const current = this.updateLiveExpression();
    const target = ch.targetFormula.replace(/\s+/g, '');

    const fb = document.getElementById("tiles-feedback");
    if (current === target) {
      if (fb) {
        fb.className = "sim-feedback visible correct";
        fb.innerHTML = `🎉 <strong>Molt bé!</strong> Has arribat a l'expressió simplificada correcta: <code>${ch.targetFormula}</code>.`;
      }
      if (window.App) window.App.markTaskProgress("tiles");
    }
  },

  clearAll() {
    this.tiles = [];
    this.renderWorkspace();
    this.updateLiveExpression();
    const fb = document.getElementById("tiles-feedback");
    if (fb) {
      fb.className = "sim-feedback";
      fb.textContent = "";
    }
  },

  attachEvents() {
    const cancelBtn = document.getElementById("tiles-cancel-zeros-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.cancelZeroPairs());
    }

    const clearBtn = document.getElementById("tiles-clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearAll());
    }

    const challengeSel = document.getElementById("tiles-challenge-select");
    if (challengeSel) {
      challengeSel.innerHTML = `
        <option value="-1">Mode lliure (Experimenta i juga)</option>
        ${this.challenges.map((c, i) => `<option value="${i}">${c.title}</option>`).join("")}
      `;
      challengeSel.addEventListener("change", (e) => {
        this.currentChallengeIdx = parseInt(e.target.value, 10);
        const card = document.getElementById("tiles-challenge-info");
        if (this.currentChallengeIdx >= 0) {
          const ch = this.challenges[this.currentChallengeIdx];
          if (card) {
            card.style.display = "block";
            card.innerHTML = `<strong>Objectiu:</strong> ${ch.instruction}`;
          }
        } else {
          if (card) card.style.display = "none";
        }
        this.clearAll();
      });
    }
  }
};

window.SimTiles = SimTiles;
