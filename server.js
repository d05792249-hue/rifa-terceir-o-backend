// ======= CONFIG =======
const backendURL = "http://localhost:8080"; // ou seu backend real
const PRECO = 3.50;

// ======= ESTADO =======
let numeros = [];
let selecionados = [];

// ======= HELPERS =======
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function atualizarTotais() {
  document.getElementById("qtdSelecionados").textContent = String(selecionados.length);
  document.getElementById("valorTotal").textContent = fmt(selecionados.length * PRECO);
}

// Monta grade
function montarGrade() {
  const grade = document.getElementById("grade");
  grade.innerHTML = "";
  const fileiras = [];
  for (let f=0; f<5; f++) fileiras.push(numeros.slice(f*20, f*20+20));

  fileiras.forEach((fila, idx) => {
    const wrap = document.createElement("div");
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = `Fileira ${idx+1}`;
    const linha = document.createElement("div");
    linha.className = "fileira";

    fila.forEach(n => {
      const btn = document.createElement("div");
      btn.className = `num ${n.status === "vendido" ? "vendido" : "disponivel"}`;
      btn.textContent = n.numero;

      if (n.status !== "vendido") btn.addEventListener("click", () => toggleNumero(n.numero, btn));

      linha.appendChild(btn);
    });

    wrap.appendChild(badge);
    wrap.appendChild(linha);
    grade.appendChild(wrap);
  });

  atualizarTotais();
}

// Atualiza estados sem recriar
function atualizarEstados() {
  document.querySelectorAll(".fileira .num").forEach(div => {
    const numero = parseInt(div.textContent, 10);
    const info = numeros.find(n => n.numero === numero);
    if (!info) return;

    if (info.status === "vendido") {
      div.classList.remove("disponivel", "selecionado");
      div.classList.add("vendido");
    } else {
      div.classList.remove("vendido");
      div.classList.add("disponivel");
      if (selecionados.includes(numero)) div.classList.add("selecionado");
      else div.classList.remove("selecionado");
    }
  });
}

// Toggle seleção
function toggleNumero(numero, div) {
  if (selecionados.includes(numero)) selecionados = selecionados.filter(n => n !== numero);
  else selecionados.push(numero);
  div.classList.toggle("selecionado");
  atualizarTotais();
}

// ======= FLUXO =======
async function carregarNumeros() {
  const res = await fetch(`${backendURL}/numeros`);
  numeros = await res.json();
}

async function init() {
  await carregarNumeros();
  montarGrade();

  // Atualização periódica
  setInterval(async () => {
    await carregarNumeros();
    atualizarEstados();
  }, 5000);

  // Pagamento
  document.getElementById("btnPagamento").addEventListener("click", async () => {
    if (selecionados.length === 0) {
      alert("Escolha pelo menos um número 🙂");
      return;
    }

    // Cria pagamento (teste)
    const res = await fetch(`${backendURL}/create_payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numerosSelecionados: selecionados,
        valorTotal: selecionados.length * PRECO
      })
    });

    const data = await res.json();
    // Redireciona para link de pagamento
    window.open(data.init_point, "_blank");

    // Marca números como vendidos localmente para atualizar a interface
    numeros.forEach(n => {
      if (selecionados.includes(n.numero)) n.status = "vendido";
    });
    atualizarEstados();
  });
}

init();
