let emExecucao = false;

function obterElementos() {
  const campoPrompt =
    document.getElementById("prompt") ||
    document.querySelector("textarea, input[type='text'], input[type='search'], input:not([type])");

  const loading =
    document.getElementById("loading") ||
    document.querySelector("[id*='load'], [class*='load']");

  const resultImg =
    document.getElementById("result-img") ||
    document.querySelector("img");

  return { campoPrompt, loading, resultImg };
}

function hashTexto(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gerarImagemNoCanvas(descricao) {
  const largura = 800;
  const altura = 500;
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");

  const semente = hashTexto(descricao.toLowerCase());
  const textoMinusculo = descricao.toLowerCase();

  let corCeuTopo = "#0f172a";
  let corCeuBaixo = "#1e3a8a";
  let corSol = "#38bdf8";

  if (textoMinusculo.includes("sol azul") || (textoMinusculo.includes("sol") && textoMinusculo.includes("azul"))) {
    corCeuTopo = "#020617";
    corCeuBaixo = "#0369a1";
    corSol = "#38bdf8";
  } else if (textoMinusculo.includes("sol") || textoMinusculo.includes("por do sol") || textoMinusculo.includes("pôr do sol")) {
    corCeuTopo = "#1e1b4b";
    corCeuBaixo = "#ea580c";
    corSol = "#facc15";
  } else if (textoMinusculo.includes("noite") || textoMinusculo.includes("lua")) {
    corCeuTopo = "#020617";
    corCeuBaixo = "#1e1b4b";
    corSol = "#e2e8f0";
  } else {
    const hue = semente % 360;
    corCeuTopo = `hsl(${hue}, 55%, 14%)`;
    corCeuBaixo = `hsl(${(hue + 40) % 360}, 65%, 32%)`;
    corSol = `hsl(${(hue + 160) % 360}, 90%, 65%)`;
  }

  // Fundo em gradiente
  const gradCeu = ctx.createLinearGradient(0, 0, 0, altura);
  gradCeu.addColorStop(0, corCeuTopo);
  gradCeu.addColorStop(1, corCeuBaixo);
  ctx.fillStyle = gradCeu;
  ctx.fillRect(0, 0, largura, altura);

  // Estrelas / pontos de luz
  for (let i = 0; i < 45; i++) {
    const px = ((semente * (i + 7) * 9301 + 49297) % largura);
    const py = ((semente * (i + 13) * 233280 + 104729) % (altura * 0.65));
    const raio = (i % 3) + 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.arc(px, py, raio, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sol / astro com brilho
  const solX = largura * 0.5;
  const solY = altura * 0.42;
  const raioSol = 68;

  const brilho = ctx.createRadialGradient(solX, solY, raioSol * 0.2, solX, solY, raioSol * 2.8);
  brilho.addColorStop(0, corSol);
  brilho.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = brilho;
  ctx.beginPath();
  ctx.arc(solX, solY, raioSol * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = corSol;
  ctx.beginPath();
  ctx.arc(solX, solY, raioSol, 0, Math.PI * 2);
  ctx.fill();

  // Montanhas / horizonte
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.beginPath();
  ctx.moveTo(0, altura);
  ctx.lineTo(0, altura * 0.68);
  ctx.lineTo(largura * 0.25, altura * 0.54);
  ctx.lineTo(largura * 0.52, altura * 0.70);
  ctx.lineTo(largura * 0.78, altura * 0.52);
  ctx.lineTo(largura, altura * 0.66);
  ctx.lineTo(largura, altura);
  ctx.closePath();
  ctx.fill();

  // Faixa de texto com o que foi digitado
  ctx.fillStyle = "rgba(2, 6, 23, 0.65)";
  ctx.fillRect(0, altura - 64, largura, 64);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(descricao.slice(0, 60), largura / 2, altura - 24);

  return canvas.toDataURL("image/png");
}

function gerarImagem() {
  if (emExecucao) return;

  const { campoPrompt, loading, resultImg } = obterElementos();
  const descricao = campoPrompt ? String(campoPrompt.value || "").trim() : "";

  if (!descricao) {
    alert("Digite o que você quer ver e aperte Enter.");
    return;
  }

  if (!resultImg) {
    alert("Elemento de imagem não encontrado na página.");
    return;
  }

  emExecucao = true;
  if (loading) loading.classList.remove("hidden");

  try {
    const dataUrl = gerarImagemNoCanvas(descricao);
    resultImg.src = dataUrl;
    resultImg.classList.remove("hidden");
    resultImg.style.display = "block";
  } finally {
    emExecucao = false;
    if (loading) loading.classList.add("hidden");
  }
}

function aoPressionarEnter(ev) {
  const teclaEnter = ev.key === "Enter" || ev.keyCode === 13;
  if (teclaEnter && !ev.shiftKey) {
    ev.preventDefault();
    ev.stopPropagation();
    gerarImagem();
  }
}

function iniciarEventos() {
  const { campoPrompt, btn } = obterElementos();

  document.querySelectorAll("form").forEach((form) => {
    form.setAttribute("novalidate", "true");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      gerarImagem();
    });
  });

  if (campoPrompt) {
    campoPrompt.addEventListener("keydown", aoPressionarEnter);
  }

  const botao = document.getElementById("generate-btn") || document.querySelector("button");
  if (botao) {
    botao.type = "button";
    botao.addEventListener("click", (ev) => {
      ev.preventDefault();
      gerarImagem();
    });
  }
}

window.generateImage = gerarImagem;
window.gerarImagem = gerarImagem;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarEventos);
} else {
  iniciarEventos();
}
