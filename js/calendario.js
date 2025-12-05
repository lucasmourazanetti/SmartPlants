// -----------------------------
// calendario.js (versão corrigida)
// -----------------------------
const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('monthYear');
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const dayToday = today.getDate();

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

monthYear.textContent = `${monthNames[month]} ${year}`;

const streakDataStored = JSON.parse(localStorage.getItem('streakData')) || {};
// Inicialização "primeira vez" — cria dados iniciais apenas se ainda não existir
if (!localStorage.getItem("primeiraVez") && Object.keys(streakDataStored).length === 0) {
  console.log("🌿 Primeira vez no site — criando dados iniciais...");

  const hoje = new Date();
  // Garante que criamos os 4 dias anteriores a HOJE como done (inclui ontem)
  const streakDataInicial = {};
  for (let i = 4; i >= 1; i--) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    const dataStr = data.toISOString().split("T")[0];
    streakDataInicial[dataStr] = "done";
  }

  // Hoje iniciamos como missed (o utilizador ainda não fez a ação hoje)
  const hojeStr = hoje.toISOString().split("T")[0];
  streakDataInicial[hojeStr] = "missed";

  // grava tudo no localStorage
  localStorage.setItem("streakData", JSON.stringify(streakDataInicial));
  localStorage.setItem("streakCount", "4");
  // ultimoDiaContado fica como ontem (já contado)
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  localStorage.setItem("ultimoDiaContado", ontem.toISOString().split("T")[0]);
  localStorage.setItem("primeiraVez", "true"); // marca que já inicializou

  console.log("✅ Dados iniciais criados:", streakDataInicial);
}

// Função que gera o calendário visual
function generateCalendar() {
  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const primeiroDiaSemana = primeiroDia.getDay();

  const streakData = JSON.parse(localStorage.getItem("streakData")) || {};

  calendar.innerHTML = "";

  // Cabeçalho com mês e ano
  monthYear.textContent = hoje.toLocaleString("pt-PT", {
    month: "long",
    year: "numeric",
  });

  // Preenche espaços antes do primeiro dia
  for (let i = 0; i < primeiroDiaSemana; i++) {
    const vazio = document.createElement("div");
    calendar.appendChild(vazio);
  }

  // Criar os dias do mês
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataAtual = new Date(ano, mes, dia);
    const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const estado = streakData[dataStr] || null;

    const div = document.createElement("div");
    div.classList.add("day");
    div.textContent = dia;
    // --- CLIQUE EM UM DIA ---
    div.addEventListener("click", () => {
       abrirDiaCalendario(dataStr);
    });

    const hojeStr = hoje.toISOString().split("T")[0];

    // Dia atual
    if (dataStr === hojeStr) {
      div.classList.add("today");
    }

    // Passados → cor conforme localStorage (ou missed por padrão)
    if (dataAtual < hoje) {
      if (estado) div.classList.add(estado);
      else div.classList.add("missed");
    } 
    // Hoje e futuro → azul (visual)
    else {
      div.style.background = "#3b5bdb";
    }

    calendar.appendChild(div);
  }
}

function abrirDiaCalendario(dataStr) {
    const painel = document.getElementById("painelDia");
    const titulo = document.getElementById("painelData");
    const lista = document.getElementById("listaPlantasDia");
    const estadoDia = document.getElementById("estadoDia");
    const btnLembrete = document.getElementById("btnCriarLembrete");

    const plantas = JSON.parse(localStorage.getItem("plantas")) || [];
    const regas = JSON.parse(localStorage.getItem("regas")) || {};
    const streakData = JSON.parse(localStorage.getItem("streakData")) || {};

    const hojeStr = new Date().toISOString().split("T")[0];
    const hoje = new Date(hojeStr);
    const dataSelecionada = new Date(dataStr);

    // Mostrar data
    titulo.textContent = `📅 ${dataStr}`;

    // Estado do dia
    const estado = streakData[dataStr] || "future";

    const cores = {
        done:  ["🟢 Dia concluído", "#2e7d32"],
        partial: ["🟠 Parcial", "#f4a261"],
        missed: ["🔴 Perdido", "#e63946"],
        future: ["🔵 Dia futuro", "#3b5bdb"],
        today: ["🟡 Hoje", "#f1c40f"]
    };

    let estadoFinal = estado;
    if (dataStr === hojeStr) estadoFinal = "today";
    if (dataSelecionada > hoje) estadoFinal = "future";

    estadoDia.textContent = cores[estadoFinal][0];
    estadoDia.style.background = cores[estadoFinal][1];
    estadoDia.style.color = "#fff";

    // Listar plantas tratadas
    lista.innerHTML = "";
    const regadas = regas[dataStr] || [];

    if (regadas.length === 0) {
        lista.innerHTML = "<li><span>😕</span> Nenhuma planta</li>";
    } else {
        plantas.forEach(planta => {
            if (regadas.includes(planta.id)) {
                const li = document.createElement("li");
                li.innerHTML = `<span>🌱</span> ${planta.nome}`;
                lista.appendChild(li);
            }
        });
    }

    // Mostrar botão de lembrete apenas para HOJE e FUTURO
    if (dataSelecionada >= hoje) {
        btnLembrete.classList.remove("hidden");
        btnLembrete.onclick = () => criarLembreteParaData(dataStr);
    } else {
        btnLembrete.classList.add("hidden");
    }

    // Mostrar o painel
    painel.classList.add("show");
}

document.getElementById("fecharPainel").addEventListener("click", () => {
    document.getElementById("painelDia").classList.remove("show");
});



function criarLembreteParaData(dataStr) {
    // guarda temporariamente a data no localStorage também:
    localStorage.setItem("lembreteDataPreSelecionada", dataStr);

    // abre a página com a data na querystring
    window.location.href = `lembretes.html?data=${dataStr}`;
}






// Calcula o streak com protecções
function calcularStreak() {
  const streakData = JSON.parse(localStorage.getItem("streakData")) || {};
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const hojeStr = hoje.toISOString().split("T")[0];
  const ontemStr = ontem.toISOString().split("T")[0];

  let streakCount = parseInt(localStorage.getItem("streakCount") || "0", 10);
  const ultimoDiaContado = localStorage.getItem("ultimoDiaContado");

  const statusHoje = streakData[hojeStr];
  const statusOntem = streakData[ontemStr];

  // Se HOJE for "done" e ainda não tiver sido contado -> incrementa lógica
  if (statusHoje === "done" && ultimoDiaContado !== hojeStr) {
    if (statusOntem === "done") {
      streakCount = (isNaN(streakCount) ? 0 : streakCount) + 1; // continua a sequência
    } else {
      streakCount = 1; // começa uma nova sequência
    }
    // guarda a data que já foi contada
    localStorage.setItem("ultimoDiaContado", hojeStr);
  }

  // Se nem hoje nem ontem foram done -> zera o streak
  if (statusHoje !== "done" && statusOntem !== "done") {
    streakCount = 0;
  }

  // grava no localStorage (normaliza NaN)
  if (isNaN(streakCount)) streakCount = 0;
  localStorage.setItem("streakCount", String(streakCount));

  console.log(`🌿 streakCount: ${streakCount} (último contado: ${ultimoDiaContado || "nenhum"})`);
  return streakCount;
}

function showPlantVideo(streakCount) {
  const container = document.getElementById("plantVideoContainer");
  const video = document.getElementById("plantVideo");
  const streakText = document.getElementById("streakText");

  streakText.textContent = streakCount;

  container.classList.add("show-video");
  video.currentTime = 0;
  video.play();

  // Quando o vídeo termina, pausa e mostra o último frame
  video.addEventListener("ended", () => {
    video.pause();
    video.currentTime = video.duration;
  });
}

/* ------------ atualização de cuidados (REGAS) ------------- */
/* Esta função só ACTUALIZA o estado de HOJE e faz-o de forma não destrutiva:
   - se houver um valor existente para hoje, só o substitui se for realmente diferente
   - não mexe em dias passados, para não sobrescrever a inicialização */
function atualizarCalendarioDeCuidados() {
  const regas = JSON.parse(localStorage.getItem("regas")) || {};
  const hoje = new Date();
  const hojeKey = hoje.toISOString().split("T")[0];
  const todasPlantas = JSON.parse(localStorage.getItem("todasPlantas")) || [];

  const regadasHoje = regas[hojeKey] || [];

  let status;
  if (regadasHoje.length === 0) {
    status = "missed"; // vermelho
  } else if (regadasHoje.length < todasPlantas.length) {
    status = "partial"; // laranja
  } else {
    status = "done"; // verde
  }

  const streakData = JSON.parse(localStorage.getItem("streakData")) || {};
  // Só escreve se for diferente (ou inexistente) para evitar sobrescritas indesejadas
  if (!streakData[hojeKey] || streakData[hojeKey] !== status) {
    streakData[hojeKey] = status;
    localStorage.setItem("streakData", JSON.stringify(streakData));
    console.log("🔁 Atualizado streakData[hoje] para:", status);
  }
}

/* ------------ Código das missões e UI (sem alterações funcionais significativas) ------------- */
const botoesTipo = document.querySelectorAll('.tipo-btn');
const btnVoltar = document.getElementById('btn-voltar-missoes');
const lista = document.querySelector('.missoes-lista');

botoesTipo.forEach(btn => {
  btn.addEventListener('click', () => {
    botoesTipo.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');

    const tipo = btn.dataset.tipo;
    atualizarMissoes(tipo);

    document.querySelector('.tipo-missoes').style.display = 'none';
    btnVoltar.style.display = 'block';
  });
});

btnVoltar.addEventListener('click', () => {
  document.querySelector('.tipo-missoes').style.display = 'flex';
  btnVoltar.style.display = 'none';
  lista.innerHTML = '<p style="text-align:center; color:#2e7d32;">Escolhe um tipo de missão acima 🌱</p>';
});

async function atualizarMissoes(tipo) {
  lista.innerHTML = '';

  const missoes = {
    compras: [
      { icone: '🛒', texto: 'Comprar 3 novas plantas', progresso: 1 },
      { icone: '💰', texto: 'Gastar 200 folhas', progresso: 0.4 }
    ],
    cuidados: [
      { icone: '💧', texto: 'Regar todas as plantas hoje', progresso: 0.8 },
      { icone: '🌞', texto: 'Dar luz a 3 plantas', progresso: 0.2 }
    ],
    streak: await calcularMissoesStreak()
  };

  if (!missoes[tipo]) return;

  if (tipo === "streak") return; // já foi renderizado dentro de calcularMissoesStreak()

  missoes[tipo].forEach(m => {
    const missaoEl = document.createElement('div');
    missaoEl.className = 'missao' + (m.completa ? ' completa' : '');
    missaoEl.innerHTML = `
      <div class="icone-progresso" data-progresso="${m.progresso}">
        <svg viewBox="0 0 36 36">
          <path class="bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"/>
          <path class="progresso"
            stroke-dasharray="${m.progresso * 100}, 100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>
        <div class="icone">${m.icone}</div>
      </div>
      <div style="display:flex;flex-direction:column;">
        <p>${m.texto}</p>
        <small style="color:#2e7d32;font-weight:600;">Recompensa: +20 🍃</small>
      </div>
    `;
    lista.appendChild(missaoEl);
  });
}

async function calcularMissoesStreak() {
  const missoes = [];
  const folhas = parseInt(localStorage.getItem("folhas") || "0");
  const streakCount = parseInt(localStorage.getItem("streakCount") || "0");
  const streakData = JSON.parse(localStorage.getItem("streakData") || "{}");
  const recompensasRecebidas = JSON.parse(localStorage.getItem("missoesCompletas") || "[]");

  const diasDone = Object.values(streakData).filter(v => v === "done").length;

  const missao1 = {
    id: "streak-0",
    icone: '🔥',
    texto: 'Obter 5 dias de streak',
    progresso: Math.min(streakCount / 5, 1),
    completa: streakCount >= 5
  };

  const missao2 = {
    id: "streak-1",
    icone: '🌿',
    texto: 'Cuidar das plantas por 10 dias',
    progresso: Math.min(diasDone / 10, 1),
    completa: diasDone >= 10
  };

  missoes.push(missao1, missao2);

  // renderizar as missões
  const lista = document.querySelector('.missoes-lista');
  lista.innerHTML = '';

  missoes.forEach(m => {
    const missaoEl = document.createElement('div');
    missaoEl.className = 'missao' + (m.completa ? ' completa' : '');
    const coletada = recompensasRecebidas.includes(m.id);

    missaoEl.innerHTML = `
      <div class="icone-progresso" data-progresso="${m.progresso}">
        <svg viewBox="0 0 36 36">
          <path class="bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"/>
          <path class="progresso"
            stroke-dasharray="${m.progresso * 100}, 100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>
        <div class="icone">${m.icone}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-start;">
        <p>${m.texto}</p>
        <small style="color:#2e7d32;font-weight:600;">Recompensa: +20 🍃</small>
        ${
          m.completa && !coletada
            ? `<button class="btn-coletar" data-id="${m.id}" style="margin-top:5px;">Coletar</button>`
            : m.completa && coletada
              ? `<small style="color:gold;font-weight:700;">✅ Coletada</small>`
              : ''
        }
      </div>
    `;
    lista.appendChild(missaoEl);
  });

  lista.querySelectorAll('.btn-coletar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (recompensasRecebidas.includes(id)) return;

      let folhasAtual = parseInt(localStorage.getItem("folhas") || "0") + 20;
      recompensasRecebidas.push(id);

      localStorage.setItem("folhas", folhasAtual);
      localStorage.setItem("missoesCompletas", JSON.stringify(recompensasRecebidas));

      const carteira = document.getElementById("carteira-folhas");
      if (carteira) carteira.textContent = folhasAtual;

      const label = document.createElement("small");
      label.textContent = "✅ Coletada";
      label.style.color = "gold";
      label.style.fontWeight = "700";
      btn.replaceWith(label);
    });
  });

  return missoes;
}

/* help box */
const helpBtn = document.getElementById("helpBtn");
const helpBox = document.getElementById("helpBox");

helpBtn.addEventListener("click", () => {
  helpBox.style.display = helpBox.style.display === "block" ? "none" : "block";
});

/* ------------- Inicialização da UI após definições ------------- */
// Gera o calendário (não chama atualizarCalendarioDeCuidados aqui)
generateCalendar();
// Atualiza apenas o estado de HOJE com base nas regas (não sobrescreve outras datas)
atualizarCalendarioDeCuidados();
// Recalcula o streak a partir dos dados atuais (localStorage)
const streak = calcularStreak();
if (streak > 0) showPlantVideo(streak);

// Desativa clique em botões de compras/cuidados (mantém hover)
const btnCompras = document.querySelector('[data-tipo="compras"]');
const btnCuidados = document.querySelector('[data-tipo="cuidados"]');
if (btnCompras) {
  btnCompras.style.pointerEvents = "none";
  btnCompras.classList.add('desativado');
}
if (btnCuidados) {
  btnCuidados.style.pointerEvents = "none";
  btnCuidados.classList.add('desativado');
}
