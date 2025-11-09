/* armazenamento simples */
const CHAVE_LEMBRETES = 'smartplants.lembretes';
const getLembretes = () => JSON.parse(localStorage.getItem(CHAVE_LEMBRETES) || '[]');
const setLembretes = (arr) => localStorage.setItem(CHAVE_LEMBRETES, JSON.stringify(arr));

let lembretes = getLembretes();

/* dados de exemplo caso vazio */
if (lembretes.length === 0) {
  lembretes = [
    { nome: 'Rega Cacto', hora: '09:00', freq: 'Semanalmente', descricao: 'Regar com pouca água.', foto: 'img/exemplos/cacto.jpg', proximaData: new Date().toISOString().split('T')[0] },
    { nome: 'Adubar Lavanda', hora: '10:30', freq: 'Mensalmente', descricao: 'Usar adubo orgânico.', foto: 'img/exemplos/lavanda.jpg', proximaData: new Date().toISOString().split('T')[0] }
  ];
  setLembretes(lembretes);
}

/* refs DOM */
const listaLembretes = document.getElementById('lista_lembretes');
const campoBusca = document.getElementById('campo-busca');
const visor = document.getElementById('visor');
const fecharVisor = document.getElementById('fechar-visor');
const fotoGrande = document.getElementById('foto-grande');
const nomeGrande = document.getElementById('nome-grande');
const especieGrande = document.getElementById('especie-grande');
const textoHoras = document.getElementById('texto-horas-marcada');
const textoDescricao = document.getElementById('texto-descricao-lembrete');
const btnEditar = document.getElementById('botao-editar-lembrete');
const btnExcluir = document.getElementById('botao-excluir');
const btnPlantas = document.getElementById('botao-plantas');

/* Modal criar/editar */
const modal = document.getElementById('modal-criar-lembrete');
const form = document.getElementById('form-criar-lembrete');
const tituloModal = document.getElementById('titulo-modal');
const inputNome = document.getElementById('nome');
const inputHora = document.getElementById('campo-hora');
const inputFreq = document.getElementById('frequencia-lembrete');
const inputDescricao = document.getElementById('descricao');
const inputArquivo = document.getElementById('arquivo-foto');
const preview = document.getElementById('preview');
const btnFoto = document.getElementById('btn-foto');
const btnCancelar = document.getElementById('cancelar');
const idEdicao = document.getElementById('id-edicao');

/* Confirmar exclusão */
const modalConfirm = document.getElementById('modal-confirmar');
const confirmMsg = document.getElementById('confirm-mensagem');
const confirmCancelar = document.getElementById('confirm-cancelar');
const confirmExcluir = document.getElementById('confirm-excluir');

/* Helpers diálogo */
function openDialog(d) {
  try { d.showModal(); } catch { d.setAttribute('open', ''); }
}
function closeDialog(d) {
  try { d.close(); } catch { d.removeAttribute('open'); }
}

/* Redirecionamento abas */
const botaoPlantas = document.getElementById('botao_plantas_principal');
if (botaoPlantas) botaoPlantas.addEventListener('click', () => window.location.href = 'plantas.html');

/* Render cards */
function criarCard(l, idx) {
  const card = document.createElement('button');
  card.className = 'cartao';
  card.dataset.index = idx;
  const foto = document.createElement('div');
  foto.className = 'foto';
  if (l.foto) {
    const img = document.createElement('img');
    img.src = l.foto;
    img.alt = 'Foto lembrete';
    foto.appendChild(img);
  } else {
    foto.textContent = '⏰';
    foto.style.fontSize = '48px';
  }
  const info = document.createElement('div');
  info.className = 'infos';
  info.innerHTML = `<strong>${l.nome}</strong><small>${l.hora || ''}</small>`;
  card.append(foto, info);
  card.addEventListener('click', () => abrirVisor(idx));
  return card;
}

function renderizar() {
  const add = document.getElementById('cartao-adicionar');
  listaLembretes.innerHTML = '';
  listaLembretes.appendChild(add);

  const termo = (campoBusca.value || '').toLowerCase();
  lembretes
    .filter(l => (l.nome || '').toLowerCase().includes(termo))
    .forEach((l, i) => listaLembretes.insertBefore(criarCard(l, i), add));
}
if (campoBusca) campoBusca.addEventListener('input', renderizar);

document.getElementById('cartao-adicionar').addEventListener('click', novoCadastro);

/* VISOR */
let indiceAtual = 0;

function abrirVisor(i) {
  indiceAtual = i;
  const l = lembretes[i];
  if (!l) return;
  if (l.foto) {
    fotoGrande.src = l.foto;
    fotoGrande.style.display = 'block';
  } else {
    fotoGrande.removeAttribute('src');
    fotoGrande.style.display = 'none';
  }
  nomeGrande.textContent = l.nome || 'Sem título';
  especieGrande.textContent = l.freq || '';
  textoHoras.textContent = `Hora: ${l.hora || '—'}`;
  textoDescricao.textContent = l.descricao || '—';
  visor.hidden = false;
}

function fecharVisorFn() { visor.hidden = true; }
fecharVisor.addEventListener('click', fecharVisorFn);
visor.addEventListener('click', e => { if (e.target === visor) fecharVisorFn(); });

btnEditar.addEventListener('click', () => { fecharVisorFn(); abrirEdicao(indiceAtual); });
btnExcluir.addEventListener('click', () => {
  const l = lembretes[indiceAtual];
  confirmMsg.textContent = `Excluir lembrete "${l.nome}"?`;
  openDialog(modalConfirm);
});
confirmCancelar.addEventListener('click', () => closeDialog(modalConfirm));
confirmExcluir.addEventListener('click', () => {
  lembretes.splice(indiceAtual, 1);
  setLembretes(lembretes);
  closeDialog(modalConfirm);
  fecharVisorFn();
  renderizar();
});

/* Upload foto */
btnFoto.addEventListener('click', () => inputArquivo.click());
inputArquivo.addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    preview.innerHTML = `<img src="${rd.result}" alt="Foto">`;
    preview.dataset.src = rd.result;
  };
  rd.readAsDataURL(f);
});

btnCancelar.addEventListener('click', () => closeDialog(modal));

function novoCadastro() {
  tituloModal.textContent = 'Novo Lembrete';
  idEdicao.value = '';
  form.reset();
  preview.innerHTML = '📜';
  delete preview.dataset.src;

  // Verifica se veio da planta
  const params = new URLSearchParams(window.location.search);
  const fotoParam = params.get('foto');
  const nomeParam = params.get('nome');
  const autoParam = params.get('auto');

  if (fotoParam) {
    preview.innerHTML = `<img src="${fotoParam}" alt="Foto">`;
    preview.dataset.src = fotoParam;
  }

  if (nomeParam) {
    inputNome.value = nomeParam;
  }

  openDialog(modal);

  // Se veio da planta (auto=true), foca direto na hora
  if (autoParam === 'true') {
    setTimeout(() => inputHora.focus(), 50);
  } else {
    setTimeout(() => inputNome.focus(), 50);
  }
}


function abrirEdicao(i) {
  const l = lembretes[i];
  tituloModal.textContent = 'Editar Lembrete';
  idEdicao.value = i;
  inputNome.value = l.nome;
  inputHora.value = l.hora;
  inputFreq.value = l.freq;
  inputDescricao.value = l.descricao;
  if (l.foto) {
    preview.innerHTML = `<img src="${l.foto}" alt="Foto">`;
    preview.dataset.src = l.foto;
  } else {
    preview.innerHTML = '📜';
    delete preview.dataset.src;
  }
  openDialog(modal);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const dados = {
    nome: inputNome.value.trim(),
    hora: inputHora.value,
    freq: inputFreq.value,
    descricao: inputDescricao.value.trim(),
    foto: preview.dataset.src || null,
    proximaData: lembretes[idEdicao.value]?.proximaData || new Date().toISOString().split('T')[0]
  };
  if (!dados.nome) return inputNome.focus();

  const idx = idEdicao.value ? Number(idEdicao.value) : -1;
  if (idx >= 0) lembretes[idx] = dados;
  else lembretes.push(dados);
  setLembretes(lembretes);
  closeDialog(modal);
  renderizar();
});

/* notificações de lembretes */

// refs do popup
const popup = document.getElementById('popup-lembrete');
const popupNome = document.getElementById('popup-nome');
const popupDesc = document.getElementById('popup-descricao');
const popupFoto = document.getElementById('popup-foto-img');
const btnJaEsta = document.getElementById('popup-jaesta');
const btnFecharPopup = document.getElementById('popup-fechar');

let lembreteAtivo = null;

// abrir popup
function mostrarPopup(l) {
  if (!l) return;
  lembreteAtivo = l;
  popupNome.textContent = l.nome;
  popupDesc.textContent = l.descricao || '—';
  if (l.foto) {
    popupFoto.src = l.foto;
    popupFoto.style.display = 'block';
  } else {
    popupFoto.removeAttribute('src');
    popupFoto.style.display = 'none';
  }
  popup.removeAttribute('hidden');
}

// fechar popup
function fecharPopup() {
  popup.setAttribute('hidden', '');
  lembreteAtivo = null;
}

// botões do popup
btnFecharPopup.addEventListener('click', fecharPopup);
btnJaEsta.addEventListener('click', () => {
  fecharPopup();

  // marca próxima data conforme frequência
  if (!lembreteAtivo) return;
  const l = lembreteAtivo;
  const idx = lembretes.findIndex(x => x.nome === l.nome && x.hora === l.hora);
  if (idx >= 0) {
    const hoje = new Date();
    const prox = new Date(hoje);

    if (/uma vez/i.test(l.freq)) {
      // Se for lembrete de uma vez, remove-o
      lembretes.splice(idx, 1);
    } 
    else {
      // Caso contrário, reagenda normalmente
      const hoje = new Date();
      const prox = new Date(hoje);

      if (/semanal/i.test(l.freq)) prox.setDate(hoje.getDate() + 7);
      else if (/mensal/i.test(l.freq)) prox.setMonth(hoje.getMonth() + 1);
      else prox.setDate(hoje.getDate() + 1);

      lembretes[idx].proximaData = prox.toISOString().split('T')[0];
      lembretes[idx].ultimoAviso = hoje.toISOString().split('T')[0];
    }

    setLembretes(lembretes);
    renderizar();
  }

});

// função para verificar lembretes
function verificarLembretes() {
  const agora = new Date();
  const horaAtual = agora.toTimeString().slice(0, 5);
  const dataHoje = agora.toISOString().split('T')[0];

  for (const l of lembretes) {
    if (!l.hora || !l.proximaData) continue;

    // impede repetição no mesmo dia
    if (l.ultimoAviso === dataHoje) continue;

    if (l.proximaData === dataHoje && l.hora === horaAtual) {
      mostrarPopup(l);
      l.ultimoAviso = dataHoje; // marca que já foi avisado
      setLembretes(lembretes);
      break;
    }
  }
}

// checar a cada 10 segundos
setInterval(verificarLembretes, 10 * 1000);

// também verifica imediatamente ao abrir a página
verificarLembretes();

// --- Verifica se veio da página de plantas e abre o modal automaticamente ---
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('novo') === '1') {
    const nome = params.get('nome') || '';
    const foto = params.get('foto') || '';

    // abre o modal e pré-preenche nome/foto
    novoCadastro();

    inputNome.value = nome;
    if (foto) {
      preview.innerHTML = `<img src="${foto}" alt="Foto">`;
      preview.dataset.src = foto;
    }

    // 🔹 Limpa a querystring para não reabrir novamente
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});


/* =============================
   INICIAR
============================= */
renderizar();
