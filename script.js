import { InferenceClient } from "https://cdn.jsdelivr.net/npm/@huggingface/inference@3.1.0/+esm";

const MODELOS_SUPORTADOS = [
  "black-forest-labs/FLUX.1-Krea-dev",
  "ByteDance/Hyper-SD",
  "Qwen/Qwen-Image",
];

let indiceModeloAtual = 0;
let tokenSessao = "";

async function generateImage() {
  const promptInput = document.getElementById("prompt").value;
  const btn = document.getElementById("generate-btn");
  const loading = document.getElementById("loading");
  const resultImg = document.getElementById("result-img");

  if (!promptInput.trim()) {
    alert("Por favor, digite uma descrição para a imagem!");
    return;
  }

  if (!tokenSessao) {
    const digitado = prompt("Cole aqui o seu token do Hugging Face (hf_...):");
    if (!digitado || !digitado.trim()) {
      alert("Você precisa informar um token para gerar a imagem.");
      return;
    }
    tokenSessao = digitado.trim();
  }

  btn.disabled = true;
  loading.classList.remove("hidden");
  resultImg.src = "";

  const hf = new InferenceClient(tokenSessao);

  try {
    const modelo = MODELOS_SUPORTADOS[indiceModeloAtual];
    const imagemBlob = await hf.textToImage({
      model: modelo,
      inputs: promptInput.trim(),
    });

    resultImg.src = URL.createObjectURL(imagemBlob);
  } catch (error) {
    const msg = error && error.message ? error.message : String(error);
    if (msg.includes("401") || msg.toLowerCase().includes("invalid credentials") || msg.toLowerCase().includes("unauthorized")) {
      tokenSessao = "";
    }
    alert(`Falha ao gerar imagem (${MODELOS_SUPORTADOS[indiceModeloAtual]}): ${msg}`);
    console.error(error);
  } finally {
    btn.disabled = false;
    loading.classList.add("hidden");
  }
}

window.generateImage = generateImage;
