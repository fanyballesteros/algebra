/* ==========================================================================
   SIMULADOR 5: DETECTIUS DE PROBLEMES (Tasca 5)
   Taller de resolució pas a pas basat en el mètode de 4 passos de George Pólya
   ========================================================================== */

const SimProblemes = {
  problems: [
    {
      id: "p1-suport",
      level: "support",
      tag: "🟢 Suport · Vida quotidiana",
      title: "La compra a la fruiteria",
      statement: "La Mariona compra 1 pinya que costa 3 € i 2 melons iguals. En total a la caixa paga 11 €. Quant costa cada meló?",
      unknownHint: "x = preu d'un meló (en €)",
      equation: "2x + 3 = 11",
      solution: 4,
      unit: "€",
      finalSentence: "Cada meló costa 4 €.",
      hints: [
        "Identifica què no saps: el preu d'un sol meló. Li diem 'x'.",
        "Dos melons costaran 2x. Suma-hi la pinya (3 €) per igualar als 11 € totals.",
        "Equació: 2x + 3 = 11. Resta 3 a 11 i divideix entre 2."
      ]
    },
    {
      id: "p2-suport",
      level: "support",
      tag: "🟢 Suport · Nombres i repartiment",
      title: "Els cromos d'en Marc i la Laia",
      statement: "En Marc té 6 cromos més que la Laia. Si ajunten tots els seus cromos, en tenen 26 en total. Quants cromos té la Laia?",
      unknownHint: "x = cromos que té la Laia",
      equation: "x + (x + 6) = 26",
      solution: 10,
      unit: "cromos",
      finalSentence: "La Laia té 10 cromos (i en Marc en té 10 + 6 = 16).",
      hints: [
        "Assigna 'x' a qui en té menys: la Laia té 'x' cromos.",
        "Com que en Marc en té 6 més, en Marc té 'x + 6'.",
        "La suma de tots dos és: x + (x + 6) = 26, és a dir, 2x + 6 = 26."
      ]
    },
    {
      id: "p3-standard",
      level: "standard",
      tag: "🟡 Estàndard · Geometria",
      title: "El perímetre de la pista d'atletisme",
      statement: "Una pista rectangular d'entrenament té una llargada que fa el triple que la seva amplada. Si el perímetre total és de 160 metres, quina és l'amplada de la pista?",
      unknownHint: "x = amplada de la pista (en metres)",
      equation: "2x + 2(3x) = 160",
      solution: 20,
      unit: "metres",
      finalSentence: "L'amplada és de 20 metres (i la llargada fa 3 · 20 = 60 metres).",
      hints: [
        "Dibuixa un rectangle. Si l'amplada és 'x', la llargada és '3x'.",
        "El perímetre és la suma dels 4 costats: x + 3x + x + 3x = 160.",
        "Agrupa els termes semblants: 8x = 160. Ara divideix 160 entre 8."
      ]
    },
    {
      id: "p4-standard",
      level: "standard",
      tag: "🟡 Estàndard · Edats",
      title: "L'edat de la mare i en Pol",
      statement: "La mare té 26 anys més que el seu fill Pol. D'aquí a 6 anys, la mare tindrà exactament el triple de l'edat d'en Pol. Quants anys té en Pol actualment?",
      unknownHint: "x = edat actual d'en Pol",
      equation: "(x + 26) + 6 = 3(x + 6)",
      solution: 7,
      unit: "anys",
      finalSentence: "En Pol té 7 anys actualment (la mare en té 33).",
      hints: [
        "Fes una taula amb 'Ara' i 'D'aquí a 6 anys' per a cadascú.",
        "Ara: Pol té 'x' i la mare té 'x + 26'. D'aquí a 6 anys: Pol tindrà 'x + 6' i la mare 'x + 32'.",
        "L'equació diu: x + 32 = 3(x + 6). Aplica la propietat distributiva."
      ]
    },
    {
      id: "p5-challenge",
      level: "challenge",
      tag: "🔵 Repte · Altes Capacitats",
      title: "L'enigma dels dos ciclistes",
      statement: "Dos ciclistes surten a l'hora des de dues ciutats separades per 120 km anant un cap a l'altre. El ciclista A pedala a 25 km/h i el ciclista B pedala a 35 km/h. Quantes hores trigaran a trobar-se?",
      unknownHint: "t = temps en hores fins a l'encontre",
      equation: "25t + 35t = 120",
      solution: 2,
      unit: "hores",
      finalSentence: "Es trobaran al cap de 2 hores exactes.",
      hints: [
        "Recorda la relació física: Distància = Velocitat · Temps.",
        "El ciclista A recorre 25t km i el ciclista B en recorre 35t km.",
        "La suma de les dues distàncies ha de cobrir la separació total: 60t = 120."
      ]
    }
  ],

  currentProblemIdx: 0,

  init() {
    this.renderProblemTabs();
    this.loadProblem(0);
    this.attachEvents();
  },

  renderProblemTabs() {
    const container = document.getElementById("problems-tabs-container");
    if (!container) return;

    container.innerHTML = this.problems.map((p, idx) => `
      <button class="problem-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        ${p.tag.split("·")[0]} ${idx + 1}
      </button>
    `).join("");

    container.querySelectorAll(".problem-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".problem-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.loadProblem(parseInt(btn.dataset.idx, 10));
      });
    });
  },

  loadProblem(idx) {
    this.currentProblemIdx = idx;
    const p = this.problems[idx];

    const titleEl = document.getElementById("prob-title");
    const tagEl = document.getElementById("prob-tag");
    const statementEl = document.getElementById("prob-statement");
    const unknownHintEl = document.getElementById("prob-unknown-hint");
    const hintsContainer = document.getElementById("prob-hints-list");
    const answerInput = document.getElementById("prob-answer-input");
    const fb = document.getElementById("prob-feedback");

    if (titleEl) titleEl.textContent = p.title;
    if (tagEl) tagEl.textContent = p.tag;
    if (statementEl) statementEl.textContent = p.statement;
    if (unknownHintEl) unknownHintEl.textContent = `💡 Què busquem? ${p.unknownHint}`;
    if (answerInput) {
      answerInput.value = "";
      document.getElementById("prob-unit-label").textContent = p.unit;
    }
    if (fb) {
      fb.className = "sim-feedback";
      fb.textContent = "";
    }

    if (hintsContainer) {
      hintsContainer.innerHTML = p.hints.map((h, i) => `
        <div class="hint-pill" onclick="SimProblemes.toggleHint(${i})">
          🔍 Pista ${i + 1} (Fes clic per desplegar)
        </div>
        <div id="hint-content-${i}" class="hint-content">
          ${h}
        </div>
      `).join("");
    }
  },

  toggleHint(idx) {
    const el = document.getElementById(`hint-content-${idx}`);
    if (el) el.classList.toggle("visible");
  },

  checkAnswer() {
    const input = document.getElementById("prob-answer-input");
    const fb = document.getElementById("prob-feedback");
    if (!input || !fb) return;

    const val = parseFloat(input.value.trim());
    const p = this.problems[this.currentProblemIdx];

    if (isNaN(val)) {
      fb.className = "sim-feedback visible incorrect";
      fb.textContent = "Introdueix un nombre com a solució.";
      return;
    }

    if (Math.abs(val - p.solution) < 0.01) {
      fb.className = "sim-feedback visible correct";
      fb.innerHTML = `🎉 <strong>Molt bé, detectiu matemàtic!</strong> Resposta exacta: <strong>${p.solution} ${p.unit}</strong>.<br>📝 <em>Plantejament algebraic:</em> <code>${p.equation}</code>.<br>✅ <em>Comprovació:</em> ${p.finalSentence}`;
      if (window.App) window.App.markTaskProgress("problemes");
    } else {
      fb.className = "sim-feedback visible incorrect";
      fb.innerHTML = `No és ${val} ${p.unit}. Revisa les pistes desplegables a dalt per guiar-te pas a pas!`;
    }
  },

  attachEvents() {
    const checkBtn = document.getElementById("prob-check-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => this.checkAnswer());
    }

    const speakBtn = document.getElementById("prob-speak-btn");
    if (speakBtn) {
      speakBtn.addEventListener("click", () => {
        const p = this.problems[this.currentProblemIdx];
        if (window.App && window.App.speakText) {
          window.App.speakText(`${p.title}. ${p.statement}`);
        }
      });
    }
  }
};

window.SimProblemes = SimProblemes;
