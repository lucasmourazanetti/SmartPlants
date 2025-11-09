/* armazenamento simples */
const CHAVE = 'smartplants.plantas';
const getPlantas = () => JSON.parse(localStorage.getItem(CHAVE) || '[]');
const setPlantas = (p) => localStorage.setItem(CHAVE, JSON.stringify(p));

let plantas = getPlantas();

/* dados de exemplo caso vazio */
if (plantas.length === 0) {
plantas = [
    { nome:'Cacto', especie:'Epipremnum aureum', data: '2023-01-01', descricao:'Luz indireta. Rega 2×/sem.', tipo:'Indoor', foto:'img/exemplos/cacto.jpg' },
    { nome:'Manjericão', especie:'Ficus lyrata', data: '2023-02-01', descricao:'Prefere luminosidade alta.', tipo:'Indoor', foto:'img/exemplos/manjericao.jpg' },
    { nome:'Lavanda', especie:'Lavandula', data: '2023-03-01', descricao:'Gosta de sol e solo drenado.', tipo:'Outdoor', foto:'img/exemplos/lavanda.jpg' }
];
  setPlantas(plantas);
} else {
  // Migração: se exemplos conhecidos estão sem foto, define imagens padrão
  let ajustou = false;
  plantas = plantas.map(p => {
    if (!p || p.foto) return p;
    const nome = (p.nome||'').toLowerCase();
    if (nome.includes('cacto')) { ajustou = true; return { ...p, foto: 'img/exemplos/jiboia.svg' }; }
    if (nome.includes('manjericão')) { ajustou = true; return { ...p, foto: 'img/exemplos/ficus.svg' }; }
    if (nome.includes('lavanda')) { ajustou = true; return { ...p, foto: 'img/exemplos/lavanda.svg' }; }
    return p;
  });
  if (ajustou) setPlantas(plantas);
}

/* refs DOM */
const lista = document.getElementById('lista-plantas');
const campoBusca = document.getElementById('campo-busca');

/* VISOR refs */
const visor = document.getElementById('visor');
const fecharVisor = document.getElementById('fechar-visor');
const btnAnterior = document.getElementById('anterior');
const btnProximo = document.getElementById('proximo');
const fotoGrande = document.getElementById('foto-grande');
const nomeGrande = document.getElementById('nome-grande');
const especieGrande = document.getElementById('especie-grande');
const textoDescricao = document.getElementById('texto-descricao');
const textoAjudas = document.getElementById('texto-ajudas');
const btnEditar = document.getElementById('botao-editar');
const btnExcluir = document.getElementById('botao-excluir');
const btnLembrete = document.getElementById('botao-lembretes');

/* MODAL refs (criar/editar) */
const modal = document.getElementById('modal-planta');
const form = document.getElementById('form-planta');
const tituloModal = document.getElementById('titulo-modal');
const idEdicao = document.getElementById('id-edicao');
const inputNome = document.getElementById('nome');
const inputEspecie = document.getElementById('especie');
const inputData = document.getElementById('data');
const inputTipo = document.getElementById('tipo');
const inputDescricao = document.getElementById('descricao');
const preview = document.getElementById('preview');
const btnFoto = document.getElementById('btn-foto');
const inputArquivoFoto = document.getElementById('arquivo-foto');
const btnCancelar = document.getElementById('cancelar');

/* MODAL confirmar exclusão */
const modalConfirm = document.getElementById('modal-confirmar');
const confirmMsg = document.getElementById('confirm-mensagem');
const confirmCancelar = document.getElementById('confirm-cancelar');
const confirmExcluir = document.getElementById('confirm-excluir');

// Helpers para abrir/fechar <dialog> com fallback
function openDialog(d){
  try {
    if (d && typeof d.showModal === 'function') d.showModal();
    else if (d) d.setAttribute('open','');
  } catch (_) {
    if (d) d.setAttribute('open','');
  }
}
function closeDialog(d){
  try {
    if (d && typeof d.close === 'function') d.close();
    else if (d) d.removeAttribute('open');
  } catch (_) {
    if (d) d.removeAttribute('open');
  }
}

/* Lembrete automático da planta selecionada */

if (btnLembrete) {
  btnLembrete.addEventListener('click', () => {
    const nome = nomeGrande.textContent || '';
    const foto = fotoGrande.src || '';
    const params = new URLSearchParams({ nome, foto, novo: '1' });
    window.location.href = `lembretes.html?${params.toString()}`;
  });
}



/* render cards */
function criarCard(planta, idx) {
  const card = document.createElement('button');
  card.className = 'cartao';
  card.dataset.index = String(idx);
  const foto = document.createElement('div');
  foto.className = 'foto';
  if (planta.foto) {
    const img = document.createElement('img');
    img.src = planta.foto;
    img.alt = `Foto de ${planta.nome}`;
    foto.appendChild(img);
  } else {
    foto.textContent = '🪴';
    foto.style.fontSize = '56px';
  }
  const info = document.createElement('div');
  info.className = 'infos';
  info.innerHTML = `<strong>${planta.nome || 'Sem nome'}</strong><small>${planta.especie || ''}</small>`;
  card.append(foto, info);
  card.addEventListener('click', () => abrirVisor(idx));
  return card;
}

function renderizar() {
  const add = document.getElementById('cartao-adicionar');
  lista.innerHTML = '';
  lista.appendChild(add);

  const termo = ((campoBusca && campoBusca.value) || '').toLowerCase();
  plantas
    .filter(p => [p.nome,p.especie].some(v => (v||'').toLowerCase().includes(termo)))
    .forEach((p,i) => lista.insertBefore(criarCard(p,i), add));
}

if (campoBusca) campoBusca.addEventListener('input', renderizar);
document.getElementById('cartao-adicionar').addEventListener('click', novoCadastro);
// Delegação como reforço: garante funcionamento se o botão for reanexado
lista.addEventListener('click', (e)=>{
  const alvo = e.target.closest && e.target.closest('#cartao-adicionar');
  if (alvo) { e.preventDefault(); novoCadastro(); }
});

/* -------- VISOR (visualização e setas) -------- */
let indiceAtual = 0;

function abrirVisor(indice) {
  indiceAtual = indice;
  atualizarVisor();
  visor.hidden = false; // centralizado via CSS
}

function atualizarVisor() {
  const p = plantas[indiceAtual];
  if (!p) return;
  if (p.foto) {
    fotoGrande.src = p.foto;
    fotoGrande.style.display = 'block';
  } else {
    fotoGrande.removeAttribute('src');
    fotoGrande.style.display = 'none';
  }
  nomeGrande.textContent = p.nome || 'Sem nome';
  especieGrande.textContent = p.especie || '';
  // Painel direito: descrição + informações
  const infos = [
    p.especie ? `<strong>Espécie:</strong> ${p.especie}` : '',
    p.tipo ? `<strong>Tipo:</strong> ${p.tipo}` : '',
    p.data ? `<strong>Desde:</strong> ${p.data}` : ''
  ].filter(Boolean).join('<br>');
  textoDescricao.innerHTML = `${p.descricao ? `<p>${p.descricao}</p>` : ''}${infos ? `<div style="margin-top:6px">${infos}</div>` : ''}` || '—';
  // Painel esquerdo: ajudas rápidas por tipo
  let dica = 'Cuidados: rega conforme necessidade.';
  const t = (p.tipo||'').toLowerCase();
  if (t.includes('sucu') || t.includes('cacto')) dica = 'Luz forte, pouca água. Regue só quando o solo secar.';
  else if (t.includes('indoor')) dica = 'Luz indireta e rega moderada. Evite sol direto.';
  else if (t.includes('out')) dica = 'Prefere sol parcial e solo bem drenado.';
  textoAjudas.textContent = `• ${dica}` + `\n• Verifique drenagem do vaso.` + `\n• Limpe folhas periodicamente.`;
}

function fecharVisorFn(){ visor.hidden = true; }
fecharVisor.addEventListener('click', fecharVisorFn);
visor.addEventListener('click', (e)=>{ if(e.target === visor) fecharVisorFn(); });

btnAnterior.addEventListener('click', ()=>{
  indiceAtual = (indiceAtual - 1 + plantas.length) % plantas.length;
  atualizarVisor();
});
btnProximo.addEventListener('click', ()=>{
  indiceAtual = (indiceAtual + 1) % plantas.length;
  atualizarVisor();
});

/* atalhos teclado no visor */
document.addEventListener('keydown', (e)=>{
  if (visor.hidden) return;
  if (e.key === 'ArrowLeft') btnAnterior.click();
  if (e.key === 'ArrowRight') btnProximo.click();
  if (e.key === 'Escape') fecharVisorFn();
});

/* botões do visor */
btnEditar.addEventListener('click', ()=>{
  fecharVisorFn();
  abrirEdicao(indiceAtual);
});
if (btnExcluir) btnExcluir.addEventListener('click', ()=>{
  const p = plantas[indiceAtual];
  if (!modalConfirm) {
    if (!confirm(`Tem certeza que deseja excluir "${(p && p.nome) || 'esta planta'}"?`)) return;
    realizarExclusao();
    return;
  }
  if (confirmMsg) confirmMsg.textContent = `Tem certeza que deseja excluir "${(p && p.nome) || 'esta planta'}"?`;
  openDialog(modalConfirm);
});

if (confirmCancelar) confirmCancelar.addEventListener('click', ()=> closeDialog(modalConfirm));
if (confirmExcluir) confirmExcluir.addEventListener('click', ()=>{
  plantas.splice(indiceAtual,1);
  setPlantas(plantas);
  closeDialog(modalConfirm);
  if (plantas.length === 0) { fecharVisorFn(); renderizar(); return; }
  indiceAtual = Math.max(0, indiceAtual - 1);
  fecharVisorFn();
  renderizar();
  atualizarVisor();
});

/* -------- Modal Criar/Editar -------- */
btnFoto.addEventListener('click', ()=> inputArquivoFoto.click());
inputArquivoFoto.addEventListener('change', (e)=>{
  const files = e.target && e.target.files; const f = files && files[0]; if(!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = rd.result;
    preview.appendChild(img);
    preview.dataset.src = rd.result;
  };
  rd.readAsDataURL(f);
});

btnCancelar.addEventListener('click', ()=> closeDialog(modal));

function novoCadastro(){
  tituloModal.textContent = 'Nova Planta';
  idEdicao.value = '';
  form.reset();
  preview.innerHTML = '🪴';
  delete preview.dataset.src;
  openDialog(modal);
  // foca o campo nome ao abrir o modal
  setTimeout(()=> { if (inputNome) inputNome.focus(); }, 50);
}

function abrirEdicao(i){
  const p = plantas[i];
  tituloModal.textContent = 'Editar Planta';
  idEdicao.value = String(i);
  inputNome.value = p.nome || '';
  inputEspecie.value = p.especie || '';
  inputData.value = p.data || '';
  inputTipo.value = p.tipo || '';
  inputDescricao.value = p.descricao || '';
  preview.innerHTML = p.foto ? `<img src="${p.foto}" alt="Foto">` : '🪴';
  if (p.foto) preview.dataset.src = p.foto; else delete preview.dataset.src;
  openDialog(modal);
  setTimeout(()=> { if (inputNome) inputNome.focus(); }, 50);
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  e.stopPropagation();
  const dados = {
    nome: inputNome.value.trim(),
    especie: inputEspecie.value.trim(),
    data: inputData.value,
    tipo: inputTipo.value,
    descricao: inputDescricao.value.trim(),
    foto: preview.dataset.src || null
  };
  if (!dados.nome) { inputNome.focus(); return; }

  const idx = idEdicao.value ? Number(idEdicao.value) : -1;
  if (idx >= 0) plantas[idx] = dados;
  else plantas.push(dados);

  try { setPlantas(plantas); } catch (_) { /* fallback: mantém em memória */ }
  const novoIdx = idx >= 0 ? idx : (plantas.length - 1);
  closeDialog(modal);
  renderizar();
  // pequena animação no card salvo
  const salvo = document.querySelector(`.cartao[data-index="${novoIdx}"]`);
  if (salvo) {
    salvo.classList.add('recent');
    setTimeout(()=> salvo.classList.remove('recent'), 800);
  }
  abrirVisor(novoIdx);
});

/* iniciar */
renderizar();
