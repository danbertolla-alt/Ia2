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

function mostrarStatus(msg) {
  alert(msg);
}

function gerarImagem() {
  if (emExecucao) return;

  const { campoPrompt, loading, resultImg } = obterElementos();
  const descricao = campoPrompt ? String(campoPrompt.value || "").trim() : "";

  if (!descricao) {
    mostrarStatus("Digite uma descrição e aperte Enter.");
    return;
  }

  if (!resultImg) {
    mostrarStatus("Elemento de imagem não encontrado na página.");
    return;
  }

  emExecucao = true;
  if (loading) loading.classList.remove("hidden");

  const lock = Date.now();
  const palavras = encodeURIComponent(descricao.split(/\s+/).slice(0, 3).join(","));
  const urlImagem = `https://loremflickr.com/800/600/${palavras}?lock=${lock}`;

  resultImg.onload = () => {
    emExecucao = false;
    if (loading) loading.classList.add("hidden");
    resultImg.classList.remove("hidden");
    resultImg.style.display = "block";
  };

  resultImg.onerror = () => {
    emExecucao = false;
    if (loading) loading.classList.add("hidden");
    mostrarStatus("Não foi possível carregar a imagem agora. Tente novamente.");
  };

  resultImg.src = urlImagem;
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
  const { campoPrompt } = obterElementos();

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
}

window.generateImage = gerarImagem;
window.gerarImagem = gerarImagem;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarEventos);
} else {
  iniciarEventos();
}
