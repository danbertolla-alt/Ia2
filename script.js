const API_TOKEN = "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";
const MODEL_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

async function generateImage() {
  const promptInput = document.getElementById("prompt").value;
  const btn = document.getElementById("generate-btn");
  const loading = document.getElementById("loading");
  const resultImg = document.getElementById("result-img");

  if (!promptInput.trim()) {
    alert("Por favor, digite uma descrição para a imagem!");
    return;
  }

  btn.disabled = true;
  loading.classList.remove("hidden");
  resultImg.src = "";

  try {
    const response = await fetch(MODEL_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: promptInput }),
    });

    if (!response.ok) {
      let detalhes = "";
      try {
        const erroJson = await response.json();
        detalhes = erroJson.error || JSON.stringify(erroJson);
      } catch (_) {
        detalhes = await response.text();
      }
      throw new Error(`HTTP ${response.status}: ${detalhes || "Erro na API"}`);
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
