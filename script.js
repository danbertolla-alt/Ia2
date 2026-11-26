const MODELOS = [
  "black-forest-labs/FLUX.1-Krea-dev",
  "ByteDance/Hyper-SD",
  "Qwen/Qwen-Image"
];

let tokenHf = "";

async function generateImage() {
  const campoPrompt = document.getElementById("prompt");
  const botao = document.getElementById("generate-btn");
  const carregando = document.getElementById("loading");
  const imagemResultado = document.getElementById("result-img");

  const texto = campoPrompt ? campoPrompt.value.trim() : "";
  if (!texto) {
    alert("Digite uma descrição para a imagem.");
    return;
  }

  if (!tokenHf) {
    const digitado = prompt("Cole seu token hf_...:");
    if (!digitado || !digitado.trim()) {
      alert("Token obrigatório.");
      return;
    }
    tokenHf = digitado.trim();
  }

  if (botao) botao.disabled = true;
  if (carregando) carregando.classList.remove("hidden");

  try {
    let ultimoErro = "";

    for (let i = 0; i < MODELOS.length; i++) {
      const modelo = MODELOS[i];
      const url = "https://router.huggingface.co/hf-inference/models/" + modelo;

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + tokenHf,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: texto })
      });

      if (resposta.ok) {
        const blob = await resposta.blob();
        if (imagemResultado) {
          imagemResultado.src = URL.createObjectURL(blob);
          imagemResultado.style.display = "block";
        }
        return;
      }

      if (resposta.status === 401) {
        tokenHf = "";
        ultimoErro = "HTTP 401 (Token inválido)";
        break;
      }

      const erroTexto = await resposta.text();
      ultimoErro = "HTTP " + resposta.status + " (" + modelo + "): " + erroTexto;
    }

    alert("Falhou: " + ultimoErro);
  } catch (err) {
    alert("Erro de rede/código: " + (err.message || err));
  } finally {
    if (botao) botao.disabled = false;
    if (carregando) carregando.classList.add("hidden");
  }
}

window.addEventListener("DOMContentLoaded", function () {
  const botao = document.getElementById("generate-btn");
  if (botao) {
    botao.addEventListener("click", generateImage);
  }
});
