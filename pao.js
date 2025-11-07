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

function generateCalendar() {
  calendar.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();


  const startOffset = (firstDay + 6) % 7;

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('day');
    dayEl.textContent = day;

    const key = `${year}-${month}-${day}`;
    const status = streakData[key];

    if (status === 'done') dayEl.classList.add('done');
    else if (status === 'partial') dayEl.classList.add('partial');
    else if (status === 'missed') dayEl.classList.add('missed');

    if (day === dayToday) dayEl.classList.add('today');

    calendar.appendChild(dayEl);
  }
}
function calcularStreak() {
  let count = 0;
  let dias = Object.keys(streakData).sort();
  for (let i = dias.length - 1; i >= 0; i--) {
    if (streakData[dias[i]] === "done") count++;
    else break;
  }
  streakCount = count;
  localStorage.setItem('streakCount', streakCount);
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
showPlantVideo(8);
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
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const streakData = JSON.parse(localStorage.getItem("streakData")) || {};
  streakData[key] = status;

  localStorage.setItem("streakData", JSON.stringify(streakData));
}