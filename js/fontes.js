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
  // Remove any existing font style so we don't keep stacking rules
  const old = document.getElementById("fonte-style");
  if (old) old.remove();

  // Create CSS that applies the font globally,
  // but explicitly *does not* touch the font-store preview buttons
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


  function comprarOuAplicar(fonte, preco, card) {
    let folhas = parseInt(localStorage.getItem("folhas") || "0");
    let compradas = JSON.parse(localStorage.getItem("fontesCompradas") || "[]");

    if (compradas.includes(fonte)) {
      localStorage.setItem("fonteSelecionada", fonte);
      aplicarFonte(fonte);
      alert(`Fonte "${fonte}" aplicada!`);
      return;
    }

    if (folhas >= preco) {
      folhas -= preco;
      localStorage.setItem("folhas", folhas);
      compradas.push(fonte);
      localStorage.setItem("fontesCompradas", JSON.stringify(compradas));
      localStorage.setItem("fonteSelecionada", fonte);
      aplicarFonte(fonte);
      atualizarCarteira();
      alert(`Fonte "${fonte}" comprada e aplicada!`);
      card.classList.remove("locked");
    } else {
      alert("Você não tem folhas suficientes! 🍃");
    }
  }

  async function init() {
    log("fontes.js initializing");

    // Starting leaves if none exist
    if (!localStorage.getItem("folhas")) {
      localStorage.setItem("folhas", STARTING_LEAVES);
    }

    atualizarCarteira();

    // Apply saved font
    const fonteSalva = localStorage.getItem("fonteSelecionada");
    if (fonteSalva) aplicarFonte(fonteSalva);

    // Font store setup
    const lista = document.getElementById("lista-fontes");
    if (!lista) {
      log("No font list found on this page — skipping setup.");
      return;
    }

    const compradas = JSON.parse(localStorage.getItem("fontesCompradas") || "[]");
    const botoes = lista.querySelectorAll(".cartao");

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
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();