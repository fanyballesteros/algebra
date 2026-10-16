/* ==========================================================================
   ÀLGEBRA EN ACCIÓ - 2N D'ESO (CONTROLADOR PRINCIPAL)
   Gestió de Navegació, DUA, Síntesi de Veu i Progrés de l'Alumne
   ========================================================================== */

const App = {
  currentTab: "inici",
  currentRoute: "standard", // 'support', 'standard', 'challenge'
  completedTasks: new Set(),
  isSpeaking: false,

  init() {
    this.loadStoredPreferences();
    this.setupNavigation();
    this.setupDuaToolbar();
    this.setupItinerarySelector();
    this.initSimulators();
    this.updateProgressBadge();
  },

  loadStoredPreferences() {
    try {
      const savedRoute = localStorage.getItem("algebra_route");
      if (savedRoute) this.currentRoute = savedRoute;

      const savedEasyRead = localStorage.getItem("algebra_easy_read");
      if (savedEasyRead === "true") {
        document.body.classList.add("easy-read-mode");
        const btn = document.getElementById("btn-easy-read");
        if (btn) btn.classList.add("active");
      }

      const savedFontSize = localStorage.getItem("algebra_font_size");
      if (savedFontSize) {
        document.body.classList.add(savedFontSize);
      }

      const savedProgress = localStorage.getItem("algebra_completed_tasks");
      if (savedProgress) {
        this.completedTasks = new Set(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.warn("Storage not accessible:", e);
    }
  },

  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetTab = item.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    // Enllaços ràpids dins de la pàgina d'inici
    document.querySelectorAll("[data-nav-target]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.navTarget);
      });
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Actualitza pestanyes de navegació
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.tab === tabId);
    });

    // Mostra contingut actiu
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `tab-${tabId}`);
    });

    // Desplaça a dalt suaument
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Si canvia a una tasca amb simulador, assegura't que s'ajusta
    if (tabId === "tasca4" && window.SimBalanca) {
      setTimeout(() => window.SimBalanca.updateUI(), 100);
    }
  },

  setupDuaToolbar() {
    // Mode Lectura Fàcil
    const easyReadBtn = document.getElementById("btn-easy-read");
    if (easyReadBtn) {
      easyReadBtn.addEventListener("click", () => {
        const isActive = document.body.classList.toggle("easy-read-mode");
        easyReadBtn.classList.toggle("active", isActive);
        localStorage.setItem("algebra_easy_read", isActive);
      });
    }

    // Mida de lletra A- / A+
    const fontPlusBtn = document.getElementById("btn-font-plus");
    const fontMinusBtn = document.getElementById("btn-font-minus");

    if (fontPlusBtn) {
      fontPlusBtn.addEventListener("click", () => {
        if (!document.body.classList.contains("font-lg") && !document.body.classList.contains("font-xl")) {
          document.body.classList.add("font-lg");
          localStorage.setItem("algebra_font_size", "font-lg");
        } else if (document.body.classList.contains("font-lg")) {
          document.body.classList.remove("font-lg");
          document.body.classList.add("font-xl");
          localStorage.setItem("algebra_font_size", "font-xl");
        }
      });
    }

    if (fontMinusBtn) {
      fontMinusBtn.addEventListener("click", () => {
        if (document.body.classList.contains("font-xl")) {
          document.body.classList.remove("font-xl");
          document.body.classList.add("font-lg");
          localStorage.setItem("algebra_font_size", "font-lg");
        } else if (document.body.classList.contains("font-lg")) {
          document.body.classList.remove("font-lg");
          localStorage.removeItem("algebra_font_size");
        }
      });
    }

    // Síntesi de Veu Global
    const speechBtn = document.getElementById("btn-speak-global");
    if (speechBtn) {
      speechBtn.addEventListener("click", () => {
        if (this.isSpeaking) {
          window.speechSynthesis.cancel();
          this.isSpeaking = false;
          speechBtn.classList.remove("active");
          speechBtn.innerHTML = `🔊 Llegeix`;
          return;
        }

        // Troba el text rellevant de la tasca actual
        const activePane = document.querySelector(".tab-pane.active");
        if (!activePane) return;

        const selection = window.getSelection().toString();
        const textToRead = selection || activePane.innerText;
        this.speakText(textToRead.slice(0, 450)); // llegeix el bloc inicial
      });
    }
  },

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert("El teu navegador no admet síntesi de veu directa.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ca-ES"; // català
    utterance.rate = 0.95; // ritme còmode per a TEL i comprensió

    const globalBtn = document.getElementById("btn-speak-global");

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (globalBtn) {
        globalBtn.classList.add("active");
        globalBtn.innerHTML = `⏹️ Atura`;
      }
    };

    utterance.onend = utterance.onerror = () => {
      this.isSpeaking = false;
      if (globalBtn) {
        globalBtn.classList.remove("active");
        globalBtn.innerHTML = `🔊 Llegeix`;
      }
    };

    window.speechSynthesis.speak(utterance);
  },

  setupItinerarySelector() {
    const pills = document.querySelectorAll(".itinerary-pill");
    pills.forEach(pill => {
      if (pill.dataset.route === this.currentRoute) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }

      pill.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.setRoute(pill.dataset.route);
      });
    });

    this.applyRouteStyles();
  },

  setRoute(route) {
    this.currentRoute = route;
    localStorage.setItem("algebra_route", route);
    this.applyRouteStyles();
  },

  applyRouteStyles() {
    // Ressalta les seccions d'acord amb l'itinerari seleccionat
    document.querySelectorAll(".route-section").forEach(sec => {
      if (sec.classList.contains(`${this.currentRoute}-content`)) {
        sec.style.opacity = "1";
        sec.style.borderLeftWidth = "5px";
      } else {
        sec.style.opacity = "0.75";
        sec.style.borderLeftWidth = "2px";
      }
    });

    // Notifica els simuladors per adaptar el seu nivell si tenen mètodes d'itinerari
    if (window.SimDiccionari && window.SimDiccionari.datasets[this.currentRoute]) {
      window.SimDiccionari.currentLevel = this.currentRoute;
      window.SimDiccionari.loadCards();
      const sel = document.getElementById("dict-level-select");
      if (sel) sel.value = this.currentRoute;
    }
  },

  markTaskProgress(taskId) {
    this.completedTasks.add(taskId);
    localStorage.setItem("algebra_completed_tasks", JSON.stringify([...this.completedTasks]));
    this.updateProgressBadge();
  },

  updateProgressBadge() {
    const badge = document.getElementById("student-progress-badge");
    if (!badge) return;

    const totalTasks = 5;
    const completed = this.completedTasks.size;
    badge.innerHTML = `🏆 Tasques assolides: <strong>${completed} de ${totalTasks}</strong>`;
  },

  initSimulators() {
    // Inicialitza tots els simuladors si estan carregats
    if (window.SimPatrons) window.SimPatrons.init();
    if (window.SimDiccionari) window.SimDiccionari.init();
    if (window.SimTiles) window.SimTiles.init();
    if (window.SimBalanca) window.SimBalanca.init();
    if (window.SimProblemes) window.SimProblemes.init();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.App = App;
  App.init();
});
