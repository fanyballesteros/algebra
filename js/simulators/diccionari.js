/* ==========================================================================
   SIMULADOR 2: EL DICCIONARI ALGEBRAIC (Tasca 2)
   Laboratori d'emparellament interactiu Llenguatge Quotidià <-> Llenguatge Algebraic
   ========================================================================== */

const SimDiccionari = {
  datasets: {
    support: [
      { id: 1, text: "El doble d'un nombre", math: "2x", hint: "Doble vol dir multiplicar per 2" },
      { id: 2, text: "Un nombre augmentat en 4", math: "x + 4", hint: "Augmentar significa sumar" },
      { id: 3, text: "La meitat d'un nombre", math: "x / 2", hint: "La meitat vol dir dividir en 2 parts" },
      { id: 4, text: "Un nombre menys 3", math: "x - 3", hint: "Menys significa restar" }
    ],
    standard: [
      { id: 5, text: "El triple d'un nombre més 5", math: "3x + 5", hint: "Primer tripliquem (3x) i després sumem 5" },
      { id: 6, text: "El doble de: la suma d'un nombre i 4", math: "2(x + 4)", hint: "Com que afecta a tota la suma, cal fer servir parèntesi" },
      { id: 7, text: "La suma de dos nombres consecutius", math: "x + (x + 1)", hint: "Si el primer és x, el següent és x + 1" },
      { id: 8, text: "El quadrat d'un nombre disminuït en 7", math: "x² - 7", hint: "Quadrat és x elevat a 2" }
    ],
    challenge: [
      { id: 9, text: "La diferència entre el quadrat d'un nombre i el seu doble", math: "x² - 2x", hint: "Diferència = resta de dos termes" },
      { id: 10, text: "La suma de tres nombres parells consecutius", math: "2x + (2x + 2) + (2x + 4)", hint: "Tot nombre parell té la forma 2x" },
      { id: 11, text: "La meitat del producte de dos nombres diferents", math: "(x · y) / 2", hint: "Dues incògnites diferents: x i y" },
      { id: 12, text: "Tres vegades la diferència entre un nombre i el seu terç", math: "3(x - x/3)", hint: "Parèntesi per a la diferència abans de triplicar" }
    ]
  },

  currentLevel: "standard",
  selectedLeftId: null,
  selectedRightId: null,
  matchedPairs: new Set(),

  init() {
    this.renderLevelSelector();
    this.loadCards();
    this.attachEvents();
  },

  renderLevelSelector() {
    const sel = document.getElementById("dict-level-select");
    if (!sel) return;
    sel.value = this.currentLevel;
  },

  loadCards() {
    this.matchedPairs.clear();
    this.selectedLeftId = null;
    this.selectedRightId = null;

    const pairs = this.datasets[this.currentLevel] || this.datasets.standard;
    const leftContainer = document.getElementById("dict-phrases-col");
    const rightContainer = document.getElementById("dict-maths-col");
    const fb = document.getElementById("dict-feedback");

    if (fb) {
      fb.className = "sim-feedback";
      fb.textContent = "";
    }

    if (!leftContainer || !rightContainer) return;

    // Barregem la columna dreta per fer el repte interactiu
    const shuffledRight = [...pairs].sort(() => Math.random() - 0.5);

    leftContainer.innerHTML = pairs.map(item => `
      <div class="dict-card dict-card-left" data-id="${item.id}">
        <span>💬 ${item.text}</span>
        <button class="speak-btn-card" data-speak="${item.text}" title="Escolta la frase" style="background:none;border:none;cursor:pointer;font-size:1.1rem;">🔊</button>
      </div>
    `).join("");

    rightContainer.innerHTML = shuffledRight.map(item => `
      <div class="dict-card dict-card-right" data-id="${item.id}">
        <span class="card-math">${item.math}</span>
      </div>
    `).join("");

    this.attachCardClickEvents();
  },

  attachCardClickEvents() {
    const leftCards = document.querySelectorAll(".dict-card-left");
    const rightCards = document.querySelectorAll(".dict-card-right");

    leftCards.forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".speak-btn-card")) {
          const text = e.target.closest(".speak-btn-card").dataset.speak;
          if (window.App && window.App.speakText) window.App.speakText(text);
          return;
        }
        if (card.classList.contains("matched")) return;

        leftCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedLeftId = parseInt(card.dataset.id, 10);
        this.checkMatch();
      });
    });

    rightCards.forEach(card => {
      card.addEventListener("click", () => {
        if (card.classList.contains("matched")) return;

        rightCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedRightId = parseInt(card.dataset.id, 10);
        this.checkMatch();
      });
    });
  },

  checkMatch() {
    if (!this.selectedLeftId || !this.selectedRightId) return;

    const fb = document.getElementById("dict-feedback");
    const leftCard = document.querySelector(`.dict-card-left[data-id="${this.selectedLeftId}"]`);
    const rightCard = document.querySelector(`.dict-card-right[data-id="${this.selectedRightId}"]`);

    if (this.selectedLeftId === this.selectedRightId) {
      // Correcte!
      this.matchedPairs.add(this.selectedLeftId);
      if (leftCard) {
        leftCard.classList.remove("selected");
        leftCard.classList.add("matched");
        leftCard.innerHTML += " ✅";
      }
      if (rightCard) {
        rightCard.classList.remove("selected");
        rightCard.classList.add("matched");
        rightCard.innerHTML += " ✅";
      }

      this.selectedLeftId = null;
      this.selectedRightId = null;

      const totalPairs = this.datasets[this.currentLevel].length;
      if (this.matchedPairs.size === totalPairs) {
        if (fb) {
          fb.className = "sim-feedback visible correct";
          fb.innerHTML = `🌟 <strong>Fantàstic!</strong> Has emparellat totes les expressions del nivell correctament!`;
        }
        if (window.App) window.App.markTaskProgress("diccionari");
      }
    } else {
      // Incorrecte: donem una pista pedagògica
      const pairs = this.datasets[this.currentLevel];
      const target = pairs.find(p => p.id === this.selectedLeftId);
      if (fb) {
        fb.className = "sim-feedback visible incorrect";
        fb.innerHTML = `No coincideixen exactament. 💡 <em>Pista per a la frase seleccionada: ${target ? target.hint : 'revisa els termes'}</em>`;
      }
      setTimeout(() => {
        if (leftCard) leftCard.classList.remove("selected");
        if (rightCard) rightCard.classList.remove("selected");
        this.selectedLeftId = null;
        this.selectedRightId = null;
      }, 900);
    }
  },

  attachEvents() {
    const sel = document.getElementById("dict-level-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        this.currentLevel = e.target.value;
        this.loadCards();
      });
    }

    const resetBtn = document.getElementById("dict-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.loadCards());
    }
  }
};

window.SimDiccionari = SimDiccionari;
