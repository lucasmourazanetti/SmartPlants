(function () {
  const LOG = true;
  const log = (...a) => LOG && console.log("[fontes.js]", ...a);

  const PRECOS = [20, 20, 20, 20, 40, 40, 40, 40];
  const STARTING_LEAVES = 100;

  function atualizarCarteira() {
    const folhas = parseInt(localStorage.getItem("folhas") || "0");
    const el = document.getElementById("carteira-folhas");
    if (el) el.textContent = folhas;
    return folhas;
  }

  function aplicarFonte(fonte) {
    const old = document.getElementById("fonte-style");
    if (old) old.remove();

    const css = `
      /* Everything except inside #lista-fontes */
      body *:not(#lista-fontes):not(#lista-fontes *):not(.preco-overlay) {
        font-family: '${fonte}', sans-serif !important;
      }
    `;

    const style = document.createElement("style");
    style.id = "fonte-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function comprarOuAplicar(fonte, preco, card) {
    let folhas = parseInt(localStorage.getItem("folhas") || "0");
    let compradas = JSON.parse(localStorage.getItem("fontesCompradas") || "[]");

    // Já comprada → aplicar direto
    if (compradas.includes(fonte)) {
      localStorage.setItem("fonteSelecionada", fonte);
      aplicarFonte(fonte);
      await alert(`Fonte "${fonte}" aplicada!`);
      return;
    }

    // Não comprada → pedir confirmação
    const confirmar = await confirm(`Tens certeza que queres comprar a fonte "${fonte}"?`);
    if (!confirmar) return;

    // Comprar
    if (folhas >= preco) {
      folhas -= preco;
      localStorage.setItem("folhas", folhas);
      compradas.push(fonte);
      localStorage.setItem("fontesCompradas", JSON.stringify(compradas));
      localStorage.setItem("fonteSelecionada", fonte);
      aplicarFonte(fonte);
      atualizarCarteira();
      card.classList.remove("locked");

      await alert(`Fonte "${fonte}" comprada e aplicada!`);
    } else {
      await alert("Você não tem folhas suficientes! 🍃");
    }
  }

  async function init() {
    log("fontes.js initializing");

    if (!localStorage.getItem("folhas")) {
      localStorage.setItem("folhas", STARTING_LEAVES);
    }

    atualizarCarteira();

    const fonteSalva = localStorage.getItem("fonteSelecionada");
    if (fonteSalva) aplicarFonte(fonteSalva);

    // Botão de reset
    const resetBtn = document.getElementById("reset-fonte");
    if (resetBtn) {
      resetBtn.addEventListener("click", async () => {
        const confirmar = await confirm("Tens certeza que queres restaurar a fonte padrão?");
        if (confirmar) {
          localStorage.removeItem("fonteSelecionada");
          const old = document.getElementById("fonte-style");
          if (old) old.remove();
          await alert("Fonte padrão restaurada!");
        }
      });
    }

    const lista = document.getElementById("lista-fontes");
    if (!lista) {
      log("No font list found on this page – skipping setup.");
      return;
    }

    const compradas = JSON.parse(localStorage.getItem("fontesCompradas") || "[]");
    const botoes = lista.querySelectorAll(".cartao-fonte");

    botoes.forEach((card, i) => {
      const fonte = card.dataset.font;
      const preco = PRECOS[i] || 40;
      card.dataset.preco = preco;
      card.style.fontFamily = `'${fonte}', sans-serif`;

      const overlay = document.createElement("div");
      overlay.className = "preco-overlay";
      overlay.textContent = `${preco} 🍃`;
      card.appendChild(overlay);

      if (!compradas.includes(fonte)) card.classList.add("locked");

      card.addEventListener("click", () => comprarOuAplicar(fonte, preco, card));
    });

    log("Font cards setup complete");
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// MODAL OVERRIDE - Separate IIFE that runs AFTER DOM is ready
(function () {
  function setupModals() {
    const modal = document.getElementById("alert-modal");
    const text = document.getElementById("alert-text");
    const btn = document.getElementById("alert-ok");

    const confirmModal = document.getElementById("confirm-modal");
    const confirmText = document.getElementById("confirm-text");
    const btnYes = document.getElementById("confirm-yes");
    const btnNo = document.getElementById("confirm-no");

    if (!modal || !text || !btn || !confirmModal || !confirmText || !btnYes || !btnNo) {
      console.warn("[fontes.js] Modal UI not found – using default alert/confirm.");
      console.log("[fontes.js] Modal elements:", {modal, text, btn, confirmModal, confirmText, btnYes, btnNo});
      return false;
    }

    console.log("[fontes.js] Setting up custom modals");

    window.alert = function (msg) {
      console.log("[fontes.js] Custom alert called:", msg);
      text.textContent = msg;
      modal.classList.remove("hidden");
      
      // Force display
      modal.style.display = "flex";
      console.log("[fontes.js] Alert modal display set to flex");

      return new Promise(resolve => {
        const close = () => {
          modal.classList.add("hidden");
          modal.style.display = "none";
          btn.removeEventListener("click", close);
          resolve();
        };
        btn.addEventListener("click", close);
      });
    };

    window.confirm = function (msg) {
      console.log("[fontes.js] Custom confirm called:", msg);
      confirmText.textContent = msg;
      confirmModal.classList.remove("hidden");
      
      // Force display
      confirmModal.style.display = "flex";
      console.log("[fontes.js] Modal display set to flex, classes:", confirmModal.className);

      return new Promise(resolve => {
        const cleanup = () => {
          btnYes.removeEventListener("click", yes);
          btnNo.removeEventListener("click", no);
        };

        const yes = () => {
          confirmModal.classList.add("hidden");
          confirmModal.style.display = "none";
          cleanup();
          resolve(true);
        };

        const no = () => {
          confirmModal.classList.add("hidden");
          confirmModal.style.display = "none";
          cleanup();
          resolve(false);
        };

        btnYes.addEventListener("click", yes);
        btnNo.addEventListener("click", no);
      });
    };

    console.log("[fontes.js] Custom modals installed successfully");
    return true;
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", setupModals);
  } else {
    setupModals();
  }
})();