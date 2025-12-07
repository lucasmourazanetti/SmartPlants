(function () {
  try {
    const LOG = true;
    const log = (...a) => LOG && console.log("[fundo.js]", ...a);

    // 🍃 CONFIG
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

      // Use style properties but avoid throwing if style not writable
      try {
        target.style.setProperty("background", `url('${url}') center / cover no-repeat fixed`, "important");
        target.style.setProperty("background-size", "cover", "important");
        target.style.setProperty("background-repeat", "no-repeat", "important");
        target.style.setProperty("background-position", "center", "important");
        log("Applied background:", url);
      } catch (err) {
        console.warn("[fundo.js] Could not apply background style:", err);
      }
    }

    function atualizarCarteira() {
      const folhas = parseInt(localStorage.getItem("folhas") || "0");
      const el = document.getElementById("carteira-folhas");
      if (el) el.textContent = folhas;
      return folhas;
    }

    async function comprarOuAplicar(imgSrc, preco, card) {
      try {
        // normalize stored values
        imgSrc = normalizePath(imgSrc);

        let folhas = parseInt(localStorage.getItem("folhas") || "0");
        let comprados = JSON.parse(localStorage.getItem("fundosComprados") || "[]")
                       .map(normalizePath);

        // If already purchased, only apply
        if (comprados.includes(imgSrc)) {
          localStorage.setItem("fundoSelecionado", imgSrc);
          applyBackgroundUrl(imgSrc);
          await alert("Fundo aplicado!");
          return;
        }

        // Ask confirmation only when not purchased
        const querComprar = await confirm("Tens a certeza que queres comprar este fundo?");
        if (!querComprar) return;

        // If not purchased, attempt to buy
        if (folhas >= preco) {
          folhas -= preco;
          localStorage.setItem("folhas", folhas);
          comprados.push(imgSrc);
          localStorage.setItem("fundosComprados", JSON.stringify(comprados));
          localStorage.setItem("fundoSelecionado", imgSrc);

          applyBackgroundUrl(imgSrc);
          atualizarCarteira();
          if (card && card.classList) card.classList.remove("locked");

          await alert("Fundo comprado e aplicado!");
        } else {
          await alert("Não tens folhas suficientes! 🍃");
        }
      } catch (err) {
        console.error("[fundo.js] comprarOuAplicar error:", err);
        // avoid throwing so other scripts still run
      }
    }

    // --- Init ---
    async function init() {
      try {
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
          log("No fundo list here - skipping store setup.");
          return;
        }

        const comprados = JSON.parse(localStorage.getItem("fundosComprados") || "[]").map(normalizePath);

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

        // Reset button functionality
        const btnReset = document.getElementById("reset-fundo");
        if (btnReset) {
          btnReset.addEventListener("click", async () => {
            const confirmReset = await confirm("Restaurar o fundo padrão?");
            if (confirmReset) {
              localStorage.removeItem("fundoSelecionado");
              const target = document.querySelector(".app") || document.body;
              if (target) {
                target.style.removeProperty("background");
                target.style.removeProperty("background-size");
                target.style.removeProperty("background-repeat");
                target.style.removeProperty("background-position");
              }
              await alert("Fundo padrão restaurado!");
            }
          });
        }
      } catch (err) {
        console.error("[fundo.js] init() error:", err);
        // do not rethrow
      }
    }

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }

    // Expose for debugging if desired (optional)
    window.__fundo = { comprarOuAplicar, applyBackgroundUrl, atualizarCarteira };

    // --- Safe modal override IIFE ---
    // ONLY override alert/confirm if we're on loja.html (backgrounds page)
    (function () {
      try {
        // Check if we're on the fonts page - if so, DON'T override
        const listaFontes = document.getElementById("lista-fontes");
        if (listaFontes) {
          log("Fonts page detected - NOT overriding alert/confirm");
          return;
        }

        const modal = document.getElementById("alert-modal");
        const text = document.getElementById("alert-text");
        const btn = document.getElementById("alert-ok");

        const confirmModal = document.getElementById("confirm-modal");
        const confirmText = document.getElementById("confirm-text");
        const btnYes = document.getElementById("confirm-yes");
        const btnNo = document.getElementById("confirm-no");

        // If modals do not exist on this page – DO NOT override alert/confirm.
        if (!modal || !text || !btn || !confirmModal || !confirmText || !btnYes || !btnNo) {
          console.warn("[fundo.js] Modal UI not found - skipping alert/confirm override.");
          return;
        }

        // Custom alert
        window.alert = function (msg) {
          text.textContent = msg;
          modal.classList.remove("hidden");

          return new Promise(resolve => {
            const close = () => {
              modal.classList.add("hidden");
              btn.removeEventListener("click", close);
              resolve();
            };
            btn.addEventListener("click", close);
          });
        };

        // Custom confirm
        window.confirm = function (msg) {
          confirmText.textContent = msg;
          confirmModal.classList.remove("hidden");

          return new Promise(resolve => {
            const cleanup = () => {
              btnYes.removeEventListener("click", yes);
              btnNo.removeEventListener("click", no);
            };

            const yes = () => {
              confirmModal.classList.add("hidden");
              cleanup();
              resolve(true);
            };

            const no = () => {
              confirmModal.classList.add("hidden");
              cleanup();
              resolve(false);
            };

            btnYes.addEventListener("click", yes);
            btnNo.addEventListener("click", no);
          });
        };

        log("fundo.js modal override installed");
      } catch (err) {
        console.error("[fundo.js] modal IIFE error:", err);
      }
    })();

  } catch (err) {
    // Top-level safety net: never break other scripts
    console.error("[fundo.js] TOP-LEVEL ERROR (caught):", err);
  }
})();