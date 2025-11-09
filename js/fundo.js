// fundo.js — persistent background selector + leaf store system
(function () {
  const LOG = true;
  const log = (...a) => LOG && console.log("[fundo.js]", ...a);

  // 🌿 CONFIG
  const PRECOS = [20, 20, 20, 20, 40, 40, 40, 40];
  const STARTING_LEAVES = 100;

  // --- Helpers ---
  function normalizePath(p) {
    if (!p) return p;
    return p.replace(/\\/g, "/").trim().replace(/^\.\//, "");
  }

  function testImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function resolveWorkingUrl(storedPath) {
    if (!storedPath) return null;
    storedPath = normalizePath(storedPath);

    const candidates = [
      storedPath,
      "/" + storedPath,
      "../" + storedPath,
    ];
    if (window.location.protocol.startsWith("http")) {
      candidates.push(window.location.origin + "/" + storedPath);
    }

    const uniq = [...new Set(candidates)];
    log("resolve candidates:", uniq);

    for (const c of uniq) {
      if (await testImage(c)) {
        log("resolved working url:", c);
        return c;
      }
    }
    return null;
  }

  function applyBackgroundUrl(url) {
    if (!url) return;
    const target = document.querySelector(".app") || document.body;
    if (!target) return;

    target.style.setProperty("background", `url('${url}') center / cover no-repeat fixed`, "important");
    target.style.setProperty("background-size", "cover", "important");
    target.style.setProperty("background-repeat", "no-repeat", "important");
    target.style.setProperty("background-position", "center", "important");

    log("Applied background:", url);
  }

  function atualizarCarteira() {
    const folhas = parseInt(localStorage.getItem("folhas") || "0");
    const el = document.getElementById("carteira-folhas");
    if (el) el.textContent = folhas;
    return folhas;
  }

  // --- Store logic ---
  function comprarOuAplicar(imgSrc, preco, card) {
    let folhas = parseInt(localStorage.getItem("folhas") || "0");
    let comprados = JSON.parse(localStorage.getItem("fundosComprados") || "[]");

    if (comprados.includes(imgSrc)) {
      localStorage.setItem("fundoSelecionado", imgSrc);
      applyBackgroundUrl(imgSrc);
      alert("Fundo aplicado!");
      return;
    }

    if (folhas >= preco) {
      folhas -= preco;
      localStorage.setItem("folhas", folhas);
      comprados.push(imgSrc);
      localStorage.setItem("fundosComprados", JSON.stringify(comprados));
      localStorage.setItem("fundoSelecionado", imgSrc);
      applyBackgroundUrl(imgSrc);
      atualizarCarteira();
      alert("Fundo comprado e aplicado!");
      card.classList.remove("locked");
    } else {
      alert("Não tens folhas suficientes! 🍃");
    }
  }

  // --- Init ---
  async function init() {
    log("fundo.js initializing on:", window.location.pathname);

    // Starting leaves for first-time users
    if (!localStorage.getItem("folhas")) {
      localStorage.setItem("folhas", STARTING_LEAVES);
    }

    atualizarCarteira();

    // Apply saved background
    const saved = localStorage.getItem("fundoSelecionado");
    if (saved) {
      const resolved = await resolveWorkingUrl(saved);
      if (resolved) applyBackgroundUrl(resolved);
    }

    // Fundo store logic (only on loja.html)
    const lista = document.getElementById("lista-fundos");
    if (!lista) {
      log("No fundo list here — skipping store setup.");
      return;
    }

    const comprados = JSON.parse(localStorage.getItem("fundosComprados") || "[]");

    const botoes = lista.querySelectorAll(".cartao");
    botoes.forEach((card, i) => {
      const img = card.querySelector("img");
      if (!img) return;
      const preco = PRECOS[i] || 40;
      const src = normalizePath(img.getAttribute("src"));
      card.dataset.preco = preco;

      // overlay
      let overlay = document.createElement("div");
      overlay.className = "preco-overlay";
      overlay.textContent = `${preco} 🍃`;
      card.appendChild(overlay);

      // mark locked
      if (!comprados.includes(src)) card.classList.add("locked");

      card.addEventListener("click", () => comprarOuAplicar(src, preco, card));
    });
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
