let chaveSessao = "";
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

function obterChaveGoogle() {
  if (chaveSessao) return chaveSessao;

  let digitada = "";
  try {
    digitada = window.prompt("Cole sua chave API do Google AI Studio (AIza...):") || "";
  } catch (_) {
    digitada = "";
  }

  digitada = digitada.trim();
  if (!digitada) {
    alert("Você precisa colar sua chave do Google AI Studio para gerar a foto.");
    return "";
  }

  chaveSessao = digitada;
  return chaveSessao;
}

async function gerarFotoRealistaGoogle(promptTexto, apiKey) {
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

  // Instrução acoplada para forçar estilo fotográfico e ultrarrealista
  const promptEnriquecido = `A realistic high-resolution photograph of: ${promptTexto}. Highly detailed, 8k resolution, photorealistic, natural lighting, professional photography.`;

  const resp = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptEnriquecido }],
        },
      ],
    }),
  });

  const dados = await resp.json();

  if (!resp.ok) {
    if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
      chaveSessao = "";
    }
    const detalheErro =
      (dados && dados.error && dados.error.message) ||
      JSON.stringify(dados) ||
      `HTTP ${resp.status}`;
    throw new Error(`HTTP ${resp.status}: ${detalheErro}`);
  }

  const candidatos = (dados && dados.candidates) || [];
  for (const cand of candidatos) {
    const partes = (cand && cand.content && cand.content.parts) || [];
    for (const parte of partes) {
      if (parte.inlineData && parte.inlineData.data) {
        const mime = parte.inlineData.mimeType || "image/png";
        return `data:${mime};base64,${parte.inlineData.data}`;
      }
    }
  }

  throw new Error("A API não retornou a imagem gerada.");
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
    alert("Elemento de imagem não encontrado no seu HTML.");
    return;
  }

  const apiKey = obterChaveGoogle();
  if (!apiKey) return;

  emExecucao = true;
  if (loading) loading.classList.remove("hidden");

  try {
    const srcImagem = await gerarFotoRealistaGoogle(descricao, apiKey);
    resultImg.src = srcImagem;
    resultImg.classList.remove("hidden");
