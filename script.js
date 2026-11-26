const API_TOKEN = "HFAKNl9plhpd1MmD2M2OkCmxN6aCj2f"; 
const MODEL_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";

async function generateImage() {
  const promptInput = document.getElementById('prompt').value;
  const btn = document.getElementById('generate-btn');
  const loading = document.getElementById('loading');
  const resultImg = document.getElementById('result-img');

  if (!promptInput.trim()) {
    alert("Por favor, digite uma descrição para a imagem!");
    return;
  }

  btn.disabled = true;
  loading.classList.remove('hidden');
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

    if (!response.ok) throw new Error("Erro na geração da imagem.");

    const blob = await response.blob();
    resultImg.src = URL.createObjectURL(blob);
  } catch (error) {
    alert("Ocorreu um erro ao gerar a imagem. Tente novamente.");
    console.error(error);
  } finally {
    btn.disabled = false;
    loading.classList.add('hidden');
  }
}
