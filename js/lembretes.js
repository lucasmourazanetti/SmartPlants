/* ==========================================================
   LocalStorage
========================================================== */
const CHAVE_LEMBRETES = 'smartplants.lembretes';
const getLembretes = () => JSON.parse(localStorage.getItem(CHAVE_LEMBRETES) || '[]');
const setLembretes = (arr) => localStorage.setItem(CHAVE_LEMBRETES, JSON.stringify(arr));

let lembretes = getLembretes();

/* Dados iniciais se estiver vazio */
if (lembretes.length === 0) {
  lembretes = [
    {
      nome: 'Rega Cacto',
      hora: '09:00',
      freq: 'Semanalmente',
      diaSemana: 1,
      descricao: 'Regar com pouca água.',
      foto: 'img/exemplos/cacto.jpg',
      proximaData: new Date().toISOString().split('T')[0]
    },
    {
      nome: 'Adubar Lavanda',
      hora: '10:30',
      freq: 'Mensalmente',
      diaMes: 5,
      descricao: 'Usar adubo orgânico.',
      foto: 'img/exemplos/lavanda.jpg',
      proximaData: new Date().toISOString().split('T')[0]
    }
  ];
  setLembretes(lembretes);
}

/* ==========================================================
   Refs DOM
========================================================== */
const listaLembretes        = document.getElementById('lista_lembretes');
const campoBusca            = document.getElementById('campo-busca');
const visor                 = document.getElementById('visor');
const fecharVisor           = document.getElementById('fechar-visor');
const fotoGrande            = document.getElementById('foto-grande');
const nomeGrande            = document.getElementById('nome-grande');
const especieGrande         = document.getElementById('especie-grande');
const textoHoras            = document.getElementById('texto-horas-marcada');
const textoDescricao        = document.getElementById('texto-descricao-lembrete');
const btnEditar             = document.getElementById('botao-editar-lembrete');
const btnExcluir            = document.getElementById('botao-excluir');

const btnAnterior           = document.getElementById('anterior');
const btnProximo            = document.getElementById('proximo');

/* Modal criar/editar */
const modal                 = document.getElementById('modal-criar-lembrete');
const form                  = document.getElementById('form-criar-lembrete');
const tituloModal           = document.getElementById('titulo-modal');
const inputNome             = document.getElementById('nome');
const inputHora             = document.getElementById('campo-hora');
const inputFreq             = document.getElementById('frequencia-lembrete');
const inputDescricao        = document.getElementById('descricao');
const inputArquivo          = document.getElementById('arquivo-foto');
const preview               = document.getElementById('preview');
const btnFoto               = document.getElementById('btn-foto');
const btnCancelar           = document.getElementById('cancelar');
const idEdicao              = document.getElementById('id-edicao');

/* Campos de dia */
const campoDiaContainer     = document.getElementById('campo-dia-container');
const inputDiaSemana        = document.getElementById('dia-semana');
const inputDiaMes           = document.getElementById('dia-mes');
const inputDiaUnico         = document.getElementById('dia-unico');

/* Popup */
const popup                 = document.getElementById('popup-lembrete');
const popupNome             = document.getElementById('popup-nome');
const popupDesc             = document.getElementById('popup-descricao');
const popupFoto             = document.getElementById('popup-foto-img');
const btnJaEsta             = document.getElementById('popup-jaesta');
const btnFecharPopup        = document.getElementById('popup-fechar');

/* Confirmar exclusão */
const modalConfirm          = document.getElementById('modal-confirmar');
const confirmMsg            = document.getElementById('confirm-mensagem');
const confirmCancelar       = document.getElementById('confirm-cancelar');
const confirmExcluir        = document.getElementById('confirm-excluir');

/* ==========================================================
   Helpers de diálogos
========================================================== */
function openDialog(d) {
  try { d.showModal(); } catch { d.setAttribute('open', ''); }
}

function closeDialog(d) {
  try { d.close(); } catch { d.removeAttribute('open'); }
}

/* ==========================================================
   Renderizar lista
========================================================== */
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

campoBusca.addEventListener('input', renderizar);
document.getElementById('cartao-adicionar').addEventListener('click', novoCadastro);

/* ==========================================================
   VISOR — visualizar lembrete
========================================================== */
let indiceAtual = 0;

function abrirVisor(i) {
  indiceAtual = i;
  atualizarVisor();
  visor.hidden = false;
}

function atualizarVisor() {
  const l = lembretes[indiceAtual];
  if (!l) return;

  fotoGrande.src = l.foto || '';
  fotoGrande.style.display = l.foto ? 'block' : 'none';

  nomeGrande.textContent = l.nome;
  especieGrande.textContent = l.freq;
  textoHoras.innerHTML = `Hora: ${l.hora}`;

  // ➜ Exibir o dia correspondente
  let extra = '';

  if (l.freq.includes('Semanal') && l.diaSemana !== undefined) {
    const nomes = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    extra = `<br>Dia da semana: <strong>${nomes[l.diaSemana]}</strong>`;
  }

  else if (l.freq.includes('Mensal') && l.diaMes !== undefined) {
    extra = `<br>Dia do mês: <strong>${l.diaMes}</strong>`;
  }

  else if (l.freq.includes('Uma vez') && l.diaUnico) {
    const d = new Date(l.diaUnico);
    const format = d.toLocaleDateString('pt-PT');
    extra = `<br>Data única: <strong>${format}</strong>`;
  }

  textoHoras.innerHTML += extra;

  textoDescricao.textContent = l.descricao || '—';
}


function fecharVisorFn() {
  visor.hidden = true;
}

fecharVisor.addEventListener('click', fecharVisorFn);
visor.addEventListener('click', e => { if (e.target === visor) fecharVisorFn(); });

/* Navegação no visor */
btnAnterior.addEventListener('click', () => {
  indiceAtual = (indiceAtual - 1 + lembretes.length) % lembretes.length;
  atualizarVisor();
});

btnProximo.addEventListener('click', () => {
  indiceAtual = (indiceAtual + 1) % lembretes.length;
  atualizarVisor();
});

/* ==========================================================
   Abrir modal para criar
========================================================== */
function resetCampoDias() {
  campoDiaContainer.hidden = true;
  inputDiaSemana.hidden = true;
  inputDiaMes.hidden = true;
  inputDiaUnico.hidden = true;

  inputDiaSemana.value = '';
  inputDiaMes.value = '';
  inputDiaUnico.value = '';
}

function atualizarCamposDeDia() {
  resetCampoDias();

  const f = inputFreq.value.toLowerCase();

  if (f.includes('semanal')) {
    campoDiaContainer.hidden = false;
    inputDiaSemana.hidden = false;
  } 
  else if (f.includes('mensal')) {
    campoDiaContainer.hidden = false;
    inputDiaMes.hidden = false;
  }
  else if (f.includes('uma vez')) {
    campoDiaContainer.hidden = false;
    inputDiaUnico.hidden = false;
  }
}

inputFreq.addEventListener('change', atualizarCamposDeDia);

function novoCadastro() {
  tituloModal.textContent = 'Novo Lembrete';
  idEdicao.value = '';
  form.reset();
  resetCampoDias();
  preview.innerHTML = '📜';
  delete preview.dataset.src;

  // Verificar se veio da planta
  const params = new URLSearchParams(window.location.search);
  if (params.get('nome')) inputNome.value = params.get('nome');
  if (params.get('foto')) {
    preview.innerHTML = `<img src="${params.get('foto')}" alt="Foto">`;
    preview.dataset.src = params.get('foto');
  }

  openDialog(modal);

  setTimeout(() => inputNome.focus(), 50);
}

/* ==========================================================
   Abrir modal para editar
========================================================== */
function abrirEdicao(i) {
  const l = lembretes[i];

  tituloModal.textContent = 'Editar Lembrete';
  idEdicao.value = i;

  inputNome.value = l.nome;
  inputHora.value = l.hora;
  inputFreq.value = l.freq;
  inputDescricao.value = l.descricao;

  resetCampoDias();
  atualizarCamposDeDia();

  if (l.diaSemana !== undefined) inputDiaSemana.value = l.diaSemana;
  if (l.diaMes !== undefined) inputDiaMes.value = l.diaMes;
  if (l.diaUnico !== undefined) inputDiaUnico.value = l.diaUnico;

  if (l.foto) {
    preview.innerHTML = `<img src="${l.foto}" alt="Foto">`;
    preview.dataset.src = l.foto;
  } else {
    preview.innerHTML = '📜';
    delete preview.dataset.src;
  }

  openDialog(modal);
}

/* ==========================================================
   Salvar (Criar / Editar)
========================================================== */
form.addEventListener('submit', e => {
  e.preventDefault();

  const freq = inputFreq.value;

  const dados = {
    nome: inputNome.value.trim(),
    hora: inputHora.value,
    freq: freq,
    descricao: inputDescricao.value.trim(),
    foto: preview.dataset.src || null,
  };

  // SALVAR DIA
  if (freq.includes('Semanal')) {
    dados.diaSemana = Number(inputDiaSemana.value);
    dados.proximaData = calcularProximaSemanal(dados.diaSemana);
  }
  else if (freq.includes('Mensal')) {
    dados.diaMes = Number(inputDiaMes.value);
    dados.proximaData = calcularProximaMensal(dados.diaMes);
  }
  else if (freq.includes('Uma vez')) {
    dados.diaUnico = inputDiaUnico.value;
    dados.proximaData = dados.diaUnico;
  }
  else { // diário
    dados.proximaData = new Date().toISOString().split('T')[0];
  }

  const idx = idEdicao.value ? Number(idEdicao.value) : -1;
  if (idx >= 0) lembretes[idx] = dados;
  else lembretes.push(dados);

  setLembretes(lembretes);
  closeDialog(modal);
  renderizar();
});

/* ==========================================================
   Cálculo das próximas ocorrências
========================================================== */
function calcularProximaSemanal(diaSemana) {
  const hoje = new Date();
  const prox = new Date();

  const diff = (diaSemana - hoje.getDay() + 7) % 7;
  prox.setDate(hoje.getDate() + diff);

  return prox.toISOString().split('T')[0];
}

function calcularProximaMensal(dia) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  let d = new Date(ano, mes, dia);

  if (d < hoje) d = new Date(ano, mes + 1, dia);

  return d.toISOString().split('T')[0];
}

/* ==========================================================
   Exclusão
========================================================== */
btnEditar.addEventListener('click', () => {
  fecharVisorFn();
  abrirEdicao(indiceAtual);
});

btnExcluir.addEventListener('click', () => {
  const l = lembretes[indiceAtual];
  confirmMsg.textContent = `Excluir lembrete "${l.nome}"?`;
  openDialog(modalConfirm);
});

btnCancelar.addEventListener('click', () => closeDialog(modal));
confirmCancelar.addEventListener('click', () => closeDialog(modalConfirm));

confirmExcluir.addEventListener('click', () => {
  lembretes.splice(indiceAtual, 1);
  setLembretes(lembretes);
  closeDialog(modalConfirm);
  fecharVisorFn();
  renderizar();
});

/* ==========================================================
   Upload de foto
========================================================== */
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

/* ==========================================================
   Popup de lembretes
========================================================== */
let lembreteAtivo = null;

function mostrarPopup(l) {
  lembreteAtivo = l;

  popupNome.textContent = l.nome;
  popupDesc.textContent = l.descricao || '—';

  if (l.foto) {
    popupFoto.src = l.foto;
    popupFoto.style.display = 'block';
  } else {
    popupFoto.style.display = 'none';
  }

  popup.removeAttribute('hidden');
}

function fecharPopup() {
  popup.setAttribute('hidden', '');
  lembreteAtivo = null;
}

btnFecharPopup.addEventListener('click', fecharPopup);

/* Marcar como feito */
btnJaEsta.addEventListener('click', () => {
  if (!lembreteAtivo) return;
  const l = lembreteAtivo;

  // Atualiza próxima data
  if (l.freq.includes('Semanal')) {
    l.proximaData = calcularProximaSemanal(l.diaSemana);
  }
  else if (l.freq.includes('Mensal')) {
    l.proximaData = calcularProximaMensal(l.diaMes);
  }
  else if (l.freq.includes('Uma vez')) {
    // remover o lembrete
    lembretes = lembretes.filter(x => x !== l);
    setLembretes(lembretes);
    fecharPopup();
    renderizar();
    return;
  }
  else { // diário
    const d = new Date();
    d.setDate(d.getDate() + 1);
    l.proximaData = d.toISOString().split('T')[0];
  }

  l.ultimoAviso = new Date().toISOString().split('T')[0];
  setLembretes(lembretes);

  fecharPopup();
  renderizar();
});

/* ==========================================================
   Verificação automática
========================================================== */
function verificarLembretes() {
  const agora = new Date();
  const horaAtual = agora.toTimeString().slice(0, 5);
  const dataHoje = agora.toISOString().split('T')[0];

  for (const l of lembretes) {
    if (!l.hora || !l.proximaData) continue;
    if (l.ultimoAviso === dataHoje) continue;

    if (l.proximaData === dataHoje && l.hora === horaAtual) {
      mostrarPopup(l);
      l.ultimoAviso = dataHoje;
      setLembretes(lembretes);
      break;
    }
  }
}

setInterval(verificarLembretes, 10 * 1000);
verificarLembretes();

/* ==========================================================
   Iniciar
========================================================== */
renderizar();

