const MODELOS_SUPORTADOS = [
  "black-forest-labs/FLUX.1-Krea-dev",
  "ByteDance/Hyper-SD",
  "Qwen/Qwen-Image",
];

let tokenSessao = "";
let emExecucao = false;

async function rodarGeracao() {
  if (emExecucao) return;

  const campoTexto =
    document.getElementById("prompt") ||
    document.querySelector("textarea, input[type='text'], input:not([type])");

  const botao =
    document.getElementById("generate-btn") ||
    document.querySelector("button, input[type='submit']");

  const carregando =
    document.getElementById("loading") ||
    document.querySelector("[id*='load'], [class*='load']");

  const imagemSaida =
    document.getElementById("result-img") ||
    document.querySelector("img");

  const descricao = campoTexto ? String(campoTexto.value || "").trim() : "";

  if (!descricao) {
    alert("Digite uma descrição para a imagem antes de clicar.");
    return;
  }

  if (!tokenSessao) {
    const digitado = window.prompt("Cole aqui o seu token do Hugging Face (hf_...):");
    if (!digitado || !digitado.trim()) {
      alert("Você precisa colar um token hf_... para continuar.");
      return;
    }
    tokenSessao = digitado.trim();
  }

  emExecucao = true;
  if (botao) botao.disabled = true;
  if (carregando) carregando.classList.remove("hidden");

  try {
    let ultimoErro = "Falha desconhecida";

    for (const modelo of MODELOS_SUPORTADOS) {
      const url = `https://router.huggingface.co/hf-inference/models/${modelo}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenSessao}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: descricao }),
      });

      if (resp.ok) {
        const blob = await resp.blob();
        if (imagemSaida) {
          imagemSaida.src = URL.createObjectURL(blob);
          imagemSaida.style.display = "block";
        }
        return;
      }

      if (resp.status === 401) {
        tokenSessao = "";
        ultimoErro = `HTTP 401 (${modelo}): Token inválido ou recusado`;
        break;
      }

      let detalhe = "";
      try {
        detalhe = await resp.text();
      } catch (_) {
        detalhe = "";
      }
      ultimoErro = `HTTP ${resp.status} (${modelo}): ${detalhe || "Sem detalhes"}`;
    }

    alert(`Não foi possível gerar a imagem:\n${ultimoErro}`);
  } catch (erro) {
    alert(`Erro no navegador/rede:\n${erro && erro.message ? erro.message : String(erro)}`);
  } finally {
    emExecucao = false;
    if (botao) botao.disabled = false;
    if (carregando) carregando.classList.add("hidden");
  }
}

function conectarEventos() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      rodarGeracao();
    });
  });

  const btnExato = document.getElementById("generate-btn");
  if (btnExato) {
    btnExato.type = "button";
    btnExato.addEventListener("click", (ev) => {
      ev.preventDefault();
      rodarGeracao();
    });
  }

  document.querySelectorAll("button, input[type='submit'], input[type='button']").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      rodarGeracao();
    });
  });
}

window.generateImage = rodarGeracao;
window.gerarImagem = rodarGeracao;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", conectarEventos);
} else {
  conectarEventos();
}
