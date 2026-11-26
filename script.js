const MODELOS_SUPORTADOS = [
  "black-forest-labs/FLUX.1-Krea-dev",
  "ByteDance/Hyper-SD",
  "Qwen/Qwen-Image",
];

let indiceModeloAtual = 0;
let tokenSessao = "";

function getModelUrl() {
  const modelo = MODELOS_SUPORTADOS[indiceModeloAtual];
  return `https://router.huggingface.co/models/${modelo}`;
}

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

  try {
    const response = await fetch(getModelUrl(), {
      headers: {
        Authorization: `Bearer ${tokenSessao}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: promptInput }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenSessao = "";
      }
      let detalhes = "";
      try {
        const erroJson = await response.json();
        detalhes = erroJson.error || JSON.stringify(erroJson);
      } catch (_) {
        detalhes = await response.text();
      }
      throw new Error(`HTTP ${response.status} (${MODELOS_SUPORTADOS[indiceModeloAtual]}): ${detalhes || "Erro na API"}`);
    }

    const blob = await response.blob();
    resultImg.src = URL.createObjectURL(blob);
  } catch (error) {
    const motivo = error && error.message ? error.message : "Falha de conexão ou bloqueio no navegador.";
    alert(`Falha ao gerar imagem: ${motivo}`);
    console.error(error);
  } finally {
    btn.disabled = false;
    loading.classList.add("hidden");
  }
}
