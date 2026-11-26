const MODELOS_SUPORTADOS = [
  "black-forest-labs/FLUX.1-Krea-dev",
  "ByteDance/Hyper-SD",
  "Qwen/Qwen-Image",
];

let tokenSessao = "";
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

function obterToken() {
  if (tokenSessao) return tokenSessao;

  let digitado = "";
  try {
    digitado = window.prompt("Cole seu token do Hugging Face:") || "";
  } catch (_) {
    digitado = "";
  }

  digitado = digitado.trim();
  if (!digitado) {
    mostrarStatus("Informe um token válido do Hugging Face para gerar a imagem.");
    return "";
  }

  tokenSessao = digitado;
  return tokenSessao;
}

async function chamarModelo(modelo, promptTexto, token) {
  const url = `https://router.huggingface.co/hf-inference/models/${modelo}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: promptTexto }),
  });

  if (!resp.ok) {
    if (resp.status === 401) {
      tokenSessao = "";
    }

    let detalhe = "";
    try {
      const textoErro = await resp.text();
      detalhe = textoErro;
    } catch (_) {
      detalhe = "Sem detalhes na resposta";
    }

    throw new Error(`HTTP ${resp.status} (${modelo}): ${detalhe}`);
  }

  const contentType = (resp.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    const jsonResp = await resp.json();
    throw new Error(`Resposta JSON inesperada (${modelo}): ${JSON.stringify(jsonResp)}`);
  }

  return await resp.blob();
}

async function generateImage() {
  if (emExecucao) return;

  const { campoPrompt, loading, resultImg } = obterElementos();
  const descricao = campoPrompt ? String(campoPrompt.value || "").trim() : "";

  if (!descricao) {
    mostrarStatus("Digite uma descrição e aperte Enter.");
    return;
  }

  const token = obterToken();
  if (!token) return;

  emExecucao = true;
  if (loading) loading.classList.remove("hidden");

  try {
    let ultimoErro = "Nenhum modelo respondeu.";

    for (let i = 0; i < MODELOS_SUPORTADOS.length; i++) {
      const modelo = MODELOS_SUPORTADOS[i];
      try {
        const blob = await chamarModelo(modelo, descricao, token);
        if (resultImg) {
          const urlImagem = URL.createObjectURL(blob);
          resultImg.src = urlImagem;
          resultImg.classList.remove("hidden");
          resultImg.style.display = "block";
        }
        return;
      } catch (err) {
        ultimoErro = err && err.message ? err.message : String(err);
        if (!tokenSessao) break;
      }
    }

    mostrarStatus(`Falha ao gerar imagem:\n${ultimoErro}`);
  } catch (err) {
    mostrarStatus(`Erro inesperado:\n${err && err.message ? err.message : String(err)}`);
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
