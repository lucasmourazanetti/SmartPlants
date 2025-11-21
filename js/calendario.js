
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

const streakData = JSON.parse(localStorage.getItem('streakData')) || {};
let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;


if (!localStorage.getItem("primeiraVez")) {
  console.log("🌿 Primeira vez no site — criando dados iniciais...");

  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  // gera datas dos 4 dias anteriores a ontem
  const streakDataInicial = {};
  for (let i = 4; i >= 1; i--) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    const dataStr = data.toISOString().split("T")[0];
    streakDataInicial[dataStr] = "done";
  }

  // ontem (ainda done), hoje missed
  streakDataInicial[ontem.toISOString().split("T")[0]] = "done";
  streakDataInicial[hoje.toISOString().split("T")[0]] = "missed";

  // grava tudo no localStorage
  localStorage.setItem("streakData", JSON.stringify(streakDataInicial));
  localStorage.setItem("streakCount", "4");
  localStorage.setItem("ultimoDiaContado", ontem.toISOString().split("T")[0]);
  
  
  localStorage.setItem("primeiraVez", "true"); // marca que já inicializou

  console.log("✅ Dados iniciais criados:", streakDataInicial);
}

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

  // Normaliza as chaves do localStorage
  const chavesStreak = Object.keys(streakData).map(key =>
    key.length === 10 ? key : key.replace(/-(\d)-/, "-0$1-").replace(/-(\d)$/, "-0$1")
  );

  // Criar os dias do mês
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataAtual = new Date(ano, mes, dia);
    const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const index = chavesStreak.indexOf(dataStr);
    const estado = index >= 0 ? streakData[Object.keys(streakData)[index]] : null;

    const div = document.createElement("div");
    div.classList.add("day");
    div.textContent = dia;

    const hojeStr = hoje.toISOString().split("T")[0];

    // Dia atual
    if (dataStr === hojeStr) {
      div.classList.add("today");
    }

    // Passados → cor conforme localStorage
    if (dataAtual < hoje) {
      if (estado) div.classList.add(estado);
      else div.classList.add("missed");
    } 
    // Hoje e futuro → azul
    else {
      div.style.background = "#3b5bdb";
    }

    calendar.appendChild(div);
  }
}


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

  // ✅ Só atualiza se HOJE for "done" e ainda não tiver sido contado
  if (statusHoje === "done" && ultimoDiaContado !== hojeStr) {
    if (statusOntem === "done") {
      streakCount += 1; // continua a sequência
    } else {
      streakCount = 1; // começa uma nova sequência
    }

    // guarda a data que já foi contada
    localStorage.setItem("ultimoDiaContado", hojeStr);
  }

  // ❌ Se hoje não for "done" e ontem também não foi "done", zera o streak
  if (statusHoje !== "done" && statusOntem !== "done") {
    streakCount = 0;
  }

  // grava no localStorage
  localStorage.setItem("streakCount", streakCount);

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
generateCalendar();




const streak = calcularStreak();
if (streak > 0) showPlantVideo(streak);
// Exemplo:

function atualizarCalendarioDeCuidados() {
  const regas = JSON.parse(localStorage.getItem("regas")) || {};
  const hoje = new Date().toISOString().split("T")[0];
  const todasPlantas = JSON.parse(localStorage.getItem("plantas")) || []; // se guardas as plantas

  const regadasHoje = regas[hoje] || [];

  let status;
  if (regadasHoje.length === 0) {
    status = "missed"; // vermelho
  } else if (regadasHoje.length < todasPlantas.length) {
    status = "partial"; // laranja
  } else {
    status = "done"; // verde
  }

  // Atualiza o calendário no localStorage
  const date = new Date();
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const streakData = JSON.parse(localStorage.getItem("streakData")) || {};
  streakData[key] = status;

  localStorage.setItem("streakData", JSON.stringify(streakData));
}





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

// ----------------------------------------------------
// Cálculo dinâmico das missões de streak
// ----------------------------------------------------
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

    // ✅ substitui o botão corretamente
    const label = document.createElement("small");
    label.textContent = "✅ Coletada";
    label.style.color = "gold";
    label.style.fontWeight = "700";
    btn.replaceWith(label);
  });
});

  return missoes;
}


const helpBtn = document.getElementById("helpBtn");
const helpBox = document.getElementById("helpBox");

helpBtn.addEventListener("click", () => {
  helpBox.style.display = helpBox.style.display === "block" ? "none" : "block";
});
