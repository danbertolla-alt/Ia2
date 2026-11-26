let chaveSessao = "";
let emExecucao = false;

function obterElementos() {
  const campoPrompt =
    document.getElementById("prompt") ||
    document.querySelector(
      "textarea, input[type='text'], input[type='search'], input:not([type])"
    );

  const loading =
    document.getElementById("loading") ||
    document.querySelector("[id*='load'], [class*='load']");

  const resultImg =
    document.getElementById("result-img") || document.querySelector("img");

  return { campoPrompt, loading, resultImg };
}

function setLoading(loading, ativo) {
  if (!loading) return;
  if (ativo) {
    loading.classList.remove("hidden");
    loading.style.display = "block";
  } else {
    loading.classList.add("hidden");
    loading.style.display = "";
  }
}

function obterChaveGoogle() {
  if (chaveSessao) return chaveSessao;

  let digitada = "";
  try {
    const res = window.prompt("Cole sua chave API do Google AI Studio (AIza...):");
    if (typeof res === "string") {
      digitada = res.trim();
    }
  } catch (_) {
    digitada = "";
  }

  if (!digitada) {
    alert(
      "Nenhuma chave foi informada (ou o navegador bloqueou a janela de prompt). Cole uma chave válida do Google AI Studio (AIza...)."
    );
    return "";
  }

  chaveSessao = digitada;
  return chaveSessao;
}

async function gerarFotoRealistaGoogle(promptTexto, apiKey) {
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

  const promptFotografico =
    `Realistic photograph of ${promptTexto}. ` +
    `Captured on a full-frame camera, natural lighting, sharp focus, authentic textures, lifelike details, no watermark, no text overlay.`;

  const resp = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptFotografico }],
        },
      ],
    }),
  });

  const textoBruto = await resp.text();
  let dados = null;
  try {
    dados = textoBruto ? JSON.parse(textoBruto) : null;
  } catch (_) {
    dados = null;
  }

  if (!resp.ok) {
    if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
      chaveSessao = "";
    }
    const msgApi =
      dados && dados.error && dados.error.message
        ? dados.error.message
        : textoBruto || `HTTP ${resp.status}`;
    throw new Error(`HTTP ${resp.status}: ${msgApi}`);
  }

  const candidatos = (dados && dados.candidates) || [];
  for (const cand of candidatos) {
    const partes = (cand && cand.content && cand.content.parts) || [];
    for (const parte of partes) {
      const inline = parte.inlineData || parte.inline_data;
      if (inline && inline.data) {
        const mime = inline.mimeType || inline.mime_type || "image/png";
        return `data:${mime};base64,${inline.data}`;
      }
    }
  }

  throw new Error("A resposta da API não retornou nenhuma imagem.");
}

async function gerarImagem() {
  if (emExecucao) return;

  const { campoPrompt, loading, resultImg } = obterElementos();
  const descricao = campoPrompt ? String(campoPrompt.value || "").trim() : "";

  if (!descricao) {
    alert("Digite o que você quer ver na foto e aperte Enter.");
    return;
  }

  if (!resultImg) {
    alert("Não encontrei um elemento <img> na página para exibir a foto.");
    return;
  }

  const apiKey = obterChaveGoogle();
  if (!apiKey) return;

  emExecucao = true;
  setLoading(loading, true);

  try {
    const srcImagem = await gerarFotoRealistaGoogle(descricao, apiKey);
    resultImg.src = srcImagem;
    resultImg.classList.remove("hidden", "d-none");
    resultImg.style.display = "block";
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    alert(`Erro ao gerar foto:\n${msg}`);
  } finally {
    emExecucao = false;
    setLoading(loading, false);
  }
}

function aoPressionarEnter(ev) {
  const isEnter = ev.key === "Enter" || ev.keyCode === 13;
  if (isEnter && !ev.shiftKey && !ev.isComposing) {
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

  const botao =
    document.getElementById("generate-btn") || document.querySelector("button");
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
