const MODELOS_SUPORTADOS = [
  "black-forest-labs/FLUX.1-Krea-dev",
  "ByteDance/Hyper-SD",
  "Qwen/Qwen-Image",
];

let tokenSessao = "";
let gerando = false;

async function tentarModelo(modelo, promptTexto, token) {
  const url = `https://router.huggingface.co/hf-inference/models/${modelo}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: promptTexto }),
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
    throw new Error(`HTTP ${response.status} (${modelo}): ${detalhes || "Erro na API"}`);
  }

  return await response.blob();
}

async function generateImage() {
  if (gerando) return;

  const promptEl = document.getElementById("prompt");
  const btn = document.getElementById("generate-btn");
  const loading = document.getElementById("loading");
  const resultImg = document.getElementById("result-img");

  const promptTexto = promptEl ? promptEl.value.trim() : "";
  if (!promptTexto) {
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

  gerando = true;
  if (btn) btn.disabled = true;
  if (loading) loading.classList.remove("hidden");
  if (resultImg) resultImg.src = "";

  let ultimoErro = null;

  try {
    for (const modelo of MODELOS_SUPORTADOS) {
      try {
        const blob = await tentarModelo(modelo, promptTexto, tokenSessao);
        if (resultImg) {
          resultImg.src = URL.createObjectURL(blob);
          resultImg.style.display = "block";
        }
        return;
      } catch (err) {
        ultimoErro = err;
        if (!tokenSessao) break;
      }
    }

    throw ultimoErro || new Error("Nenhum modelo da lista respondeu.");
  } catch (error) {
    const motivo = error && error.message ? error.message : String(error);
    alert(`Falha ao gerar imagem: ${motivo}`);
    console.error(error);
  } finally {
    gerando = false;
    if (btn) btn.disabled = false;
    if (loading) loading.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generate-btn");
  if (btn) {
    btn.addEventListener("click", generateImage);
  }
});
