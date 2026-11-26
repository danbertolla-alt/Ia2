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

async function gerarComPollinations(promptTexto) {
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptTexto)}?model=flux&seed=${seed}&nologo=true`;

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} no Pollinations`);
  }
  return await resp.blob();
}

async function generateImage() {
  if (emExecucao) return;

  const { campoPrompt, loading, resultImg } = obterElementos();
  const descricao = campoPrompt ? String(campoPrompt.value || "").trim() : "";

  if (!descricao) {
    mostrarStatus("Digite uma descrição para a imagem e aperte Enter.");
    return;
  }

  emExecucao = true;
  if (loading) loading.classList.remove("hidden");

  try {
    const blob = await gerarComPollinations(descricao);

    if (resultImg) {
      const urlImagem = URL.createObjectURL(blob);
      resultImg.src = urlImagem;
      resultImg.classList.remove("hidden");
      resultImg.style.display = "block";
    }
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    mostrarStatus(`Falha ao gerar imagem:\n${msg}`);
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
    generateImage();
  }
}

function iniciarEventos() {
  const { campoPrompt } = obterElementos();

  document.querySelectorAll("form").forEach((form) => {
    form.setAttribute("novalidate", "true");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      generateImage();
    });
  });

  if (campoPrompt) {
    campoPrompt.addEventListener("keydown", aoPressionarEnter);
  }
}

window.generateImage = generateImage;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarEventos);
} else {
  iniciarEventos();
}
