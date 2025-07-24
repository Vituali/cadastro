// Carrega a lista de atendentes do arquivo JSON
let atendentes = [];
fetch("atendentes.json")
  .then(response => response.json())
  .then(data => {
    atendentes = data;
    popularDropdown();
  })
  .catch(error => console.error("Erro ao carregar atendentes:", error));

// Popula o dropdown com os atendentes
function popularDropdown() {
  const select = document.getElementById("selecaoAtendente");
  atendentes.forEach(atendente => {
    const option = document.createElement("option");
    option.value = atendente.id;
    option.textContent = atendente.nome;
    select.appendChild(option);
  });
  // Verifica se há um atendente salvo
  carregarAtendenteSalvo();
}

// Função para selecionar o atendente
function selecionarAtendente() {
  const atendenteId = document.getElementById("selecaoAtendente").value;
  const atendenteSelecionado = atendentes.find(a => a.id == atendenteId);
  const personalizacao = document.getElementById("personalizacao");
  const conteudo = document.getElementById("conteudo");

  if (atendenteSelecionado) {
    personalizacao.style.display = "block";
    conteudo.textContent = `Atendente selecionado: ${atendenteSelecionado.nome}`;
    carregarConfiguracoes(atendenteId);
  } else {
    personalizacao.style.display = "none";
    conteudo.textContent = "Nenhum atendente selecionado.";
  }
}

// Carrega configurações salvas do localStorage
function carregarConfiguracoes(atendenteId) {
  const configs = JSON.parse(localStorage.getItem(`config_${atendenteId}`)) || {};
  const tema = configs.tema || "claro";
  const corFundo = configs.corFundo || "#ffffff";
  const textoSalvo = configs.textoSalvo || "";

  document.getElementById("tema").value = tema;
  document.getElementById("corFundo").value = corFundo;
  document.getElementById("textoSalvo").value = textoSalvo;
  aplicarTema(tema, corFundo);
}

// Salva configurações no localStorage
function salvarConfiguracoes() {
  const atendenteId = document.getElementById("selecaoAtendente").value;
  if (!atendenteId) {
    alert("Selecione um atendente primeiro!");
    return;
  }

  const tema = document.getElementById("tema").value;
  const corFundo = document.getElementById("corFundo").value;
  const textoSalvo = document.getElementById("textoSalvo").value;

  const configs = { tema, corFundo, textoSalvo };
  localStorage.setItem(`config_${atendenteId}`, JSON.stringify(configs));
  aplicarTema(tema, corFundo);
  alert("Configurações salvas!");
}

// Aplica o tema e a cor de fundo
function aplicarTema(tema, corFundo) {
  document.body.className = tema;
  document.body.style.backgroundColor = corFundo;
}

// Carrega o último atendente selecionado
function carregarAtendenteSalvo() {
  const ultimoAtendente = localStorage.getItem("ultimoAtendente");
  if (ultimoAtendente) {
    document.getElementById("selecaoAtendente").value = ultimoAtendente;
    selecionarAtendente();
  }
}

// Salva o atendente selecionado ao mudar
document.getElementById("selecaoAtendente").addEventListener("change", () => {
  const atendenteId = document.getElementById("selecaoAtendente").value;
  if (atendenteId) {
    localStorage.setItem("ultimoAtendente", atendenteId);
    selecionarAtendente();
  }
});