// Elementos do DOM
const ELEMENTS = {
    saudacao: document.getElementById("saudacao"),
    atendente: document.getElementById("atendente"),
    categoria: document.getElementById("categoria"),
    opcoes: document.getElementById("opcoes"),
    titulo: document.getElementById("titulo"),
    resposta: document.getElementById("resposta"),
    importarArquivo: document.getElementById("importarArquivo")
};

const CATEGORIAS = ["financeiro", "suporte", "geral"];
const ATENDENTES = ["victor", "bruno"];
const DADOS_INICIAIS = {
    financeiro: {},
    suporte: {},
    geral: {}
};

// Objeto local para armazenar os dados em memória
let DADOS = { ...DADOS_INICIAIS };
let ATENDENTE_SELECIONADO = localStorage.getItem("atendente") || "victor";

// URL do arquivo JSON no GitHub Pages e do backend
const JSON_URL = 'https://vituali.github.io/ATI/api/dados.json';
const BACKEND_URL = 'https://seu-backend.com/update-dados'; // Substitua pela URL do seu backend

// Funções de saudação
const getSaudacao = () => {
    const hora = new Date().getHours();
    return hora >= 5 && hora < 12 ? "Bom dia!" :
           hora >= 12 && hora < 18 ? "Boa tarde!" : 
           "Boa noite!";
};

const getDespedida = () => {
    const hora = new Date().getHours();
    return hora >= 5 && hora < 12 ? "Tenha uma excelente manhã!" :
           hora >= 12 && hora < 18 ? "Tenha uma excelente tarde!" : 
           "Tenha uma excelente noite!";
};

const substituirMarcadores = texto => 
    texto.replace("[SAUDACAO]", getSaudacao())
         .replace("[DESPEDIDA]", getDespedida());

// Carregar dados do GitHub Pages
const carregarTodosDados = async () => {
    try {
        const response = await fetch(JSON_URL);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("Arquivo dados.json não encontrado, usando dados iniciais.");
                return DADOS;
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const dados = await response.json();
        DADOS = { ...DADOS_INICIAIS, ...dados };
        return DADOS;
    } catch (error) {
        console.error("Erro ao carregar dados do GitHub:", error);
        return DADOS;
    }
};

// Atualizar dados no GitHub via backend
const atualizarNoGitHub = async () => {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dados: DADOS })
        });
        if (!response.ok) {
            throw new Error(`Erro ao atualizar no backend: ${response.status}`);
        }
        console.log('Dados atualizados no GitHub com sucesso.');
    } catch (error) {
        console.error("Erro ao atualizar no GitHub:", error);
        alert("Erro ao salvar no GitHub. As alterações foram salvas localmente.");
    }
};

// Salvar dados localmente e no GitHub
const salvarNoBanco = async (categoria, chave, texto, atendente = ATENDENTE_SELECIONADO) => {
    DADOS[categoria] = DADOS[categoria] || {};
    DADOS[categoria][chave] = DADOS[categoria][chave] || {};
    DADOS[categoria][chave][atendente] = texto;
    console.log(`Salvo localmente: ${categoria}:${chave}:${atendente}`);
    await atualizarNoGitHub();
};

// Apagar dados localmente
const apagarDoBanco = async (id) => {
    const [categoria, chave] = id.split(":");
    if (DADOS[categoria] && DADOS[categoria][chave]) {
        delete DADOS[categoria][chave];
        console.log(`Apagado localmente: ${id}`);
        await atualizarNoGitHub();
    }
};

// Funções principais
const inicializarDados = async () => {
    try {
        await carregarTodosDados();
        if (Object.keys(DADOS).length === Object.keys(DADOS_INICIAIS).length) {
            console.log("Nenhum dado encontrado, usando dados iniciais.");
        }
        ELEMENTS.atendente.value = ATENDENTE_SELECIONADO;
    } catch (error) {
        console.error("Erro ao inicializar dados:", error);
    }
};

const atualizarSaudacao = () => {
    ELEMENTS.saudacao.textContent = getSaudacao();
    const opcao = ELEMENTS.opcoes.value;
    if (opcao) responder();
};

const atualizarAtendente = () => {
    ATENDENTE_SELECIONADO = ELEMENTS.atendente.value || "victor";
    localStorage.setItem("atendente", ATENDENTE_SELECIONADO);
    atualizarOpcoes();
    responder();
};

const atualizarOpcoes = async () => {
    try {
        await carregarTodosDados();
        ELEMENTS.opcoes.innerHTML = '<option value="">Selecione uma opção</option>';
        const categoriaSelecionada = ELEMENTS.categoria.value;
        
        Object.entries(DADOS).forEach(([categoria, respostas]) => {
            if (!categoriaSelecionada || categoria === categoriaSelecionada) {
                const optgroup = document.createElement("optgroup");
                optgroup.label = categoria.charAt(0).toUpperCase() + categoria.slice(1);
                
                Object.keys(respostas).sort().forEach(chave => {
                    const option = document.createElement("option");
                    option.value = `${categoria}:${chave}`;
                    option.textContent = chave.replace(/_/g, " ").toUpperCase();
                    optgroup.appendChild(option);
                });
                
                if (optgroup.children.length > 0) {
                    ELEMENTS.opcoes.appendChild(optgroup);
                }
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar opções:", error);
    }
};

const responder = async () => {
    const opcao = ELEMENTS.opcoes.value;
    if (!opcao) {
        ELEMENTS.titulo.value = "";
        ELEMENTS.resposta.value = "Selecione uma opção para receber uma resposta automática.";
        ajustarAlturaTextarea();
        return;
    }
    
    try {
        const [categoria, chave] = opcao.split(":");
        ELEMENTS.titulo.value = chave.replace(/_/g, " ").toUpperCase();
        const texto = DADOS[categoria]?.[chave]?.[ATENDENTE_SELECIONADO] || "Resposta não encontrada.";
        ELEMENTS.resposta.value = substituirMarcadores(texto);
        ajustarAlturaTextarea();
    } catch (error) {
        console.error("Erro ao responder:", error);
        ELEMENTS.resposta.value = "Erro ao carregar resposta.";
        ajustarAlturaTextarea();
    }
};

const salvarNovoTitulo = async () => {
    const opcaoAntiga = ELEMENTS.opcoes.value;
    if (!opcaoAntiga) return alert("Selecione uma opção primeiro!");

    const novoTitulo = ELEMENTS.titulo.value.trim().toLowerCase().replace(/ /g, "_");
    if (!novoTitulo) return alert("Digite um título válido!");

    const [categoria, oldChave] = opcaoAntiga.split(":");
    if (novoTitulo === oldChave) return;

    if (DADOS[categoria]?.[novoTitulo]) return alert("Este título já existe nesta categoria!");

    const texto = DADOS[categoria][oldChave][ATENDENTE_SELECIONADO];
    salvarNoBanco(categoria, novoTitulo, texto);
    await apagarDoBanco(opcaoAntiga);
    await atualizarOpcoes();
    ELEMENTS.opcoes.value = `${categoria}:${novoTitulo}`;
    await responder();
    alert("Título alterado com sucesso!");
};

const salvarEdicao = async () => {
    const opcao = ELEMENTS.opcoes.value;
    if (!opcao) return alert("Selecione uma opção primeiro!");
    
    const [categoria, chave] = opcao.split(":");
    const textoOriginal = ELEMENTS.resposta.value.trim();
    try {
        await salvarNoBanco(categoria, chave, textoOriginal);
        alert("Resposta salva com sucesso!");
        await responder();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar a resposta!");
    }
};

const copiarTexto = async () => {
    try {
        const texto = substituirMarcadores(ELEMENTS.resposta.value);
        await navigator.clipboard.writeText(texto);
    } catch (err) {
        console.error("Erro ao copiar:", err);
        alert("Erro ao copiar texto!");
    }
};

const apagarTexto = async () => {
    const opcao = ELEMENTS.opcoes.value;
    if (!opcao || !confirm("Tem certeza que deseja apagar?")) return;
    
    await apagarDoBanco(opcao);
    ELEMENTS.resposta.value = "";
    ELEMENTS.titulo.value = "";
    await atualizarOpcoes();
    alert("Resposta apagada com sucesso!");
};

const mostrarPopupAdicionar = async () => {
    const novoTitulo = prompt("Digite o título da nova resposta:");
    if (!novoTitulo) return;
    
    const chave = novoTitulo.trim().toLowerCase().replace(/ /g, "_");
    if (!chave) return alert("Título inválido!");
    
    const categoriaPrompt = prompt("Escolha a categoria (financeiro, suporte, geral):", "geral");
    const categoria = CATEGORIAS.includes(categoriaPrompt?.toLowerCase()) ? categoriaPrompt.toLowerCase() : "geral";
    
    if (DADOS[categoria]?.[chave]) return alert("Esse título já existe nesta categoria!");

    const textoPadrao = ATENDENTE_SELECIONADO === "victor" 
        ? "Nova resposta direta aqui..." 
        : "[SAUDACAO] Nova resposta calorosa aqui... [DESPEDIDA]";
    await salvarNoBanco(categoria, chave, textoPadrao);
    await atualizarOpcoes();
    ELEMENTS.opcoes.value = `${categoria}:${chave}`;
    await responder();
    alert("Nova resposta adicionada com sucesso!");
};

const alterarCategoria = async () => {
    const opcao = ELEMENTS.opcoes.value;
    if (!opcao) return alert("Selecione uma resposta primeiro!");

    const [oldCategoria, chave] = opcao.split(":");
    const novaCategoriaPrompt = prompt("Digite a nova categoria (financeiro, suporte, geral):", oldCategoria);
    const novaCategoria = CATEGORIAS.includes(novaCategoriaPrompt?.toLowerCase()) ? novaCategoriaPrompt.toLowerCase() : oldCategoria;

    if (novaCategoria === oldCategoria) return;

    if (DADOS[novaCategoria]?.[chave]) return alert("Este título já existe na categoria selecionada!");

    const texto = DADOS[oldCategoria][chave][ATENDENTE_SELECIONADO];
    await salvarNoBanco(novaCategoria, chave, texto);
    await apagarDoBanco(opcao);
    await atualizarOpcoes();
    ELEMENTS.opcoes.value = `${novaCategoria}:${chave}`;
    await responder();
    alert("Categoria alterada com sucesso!");
};

const exportarDados = async () => {
    try {
        const json = JSON.stringify(DADOS, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dados_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert("Dados exportados com sucesso!");
    } catch (error) {
        console.error("Erro ao exportar:", error);
        alert("Erro ao exportar dados!");
    }
};

const importarDados = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();
        reader.onload = async e => {
            const dadosImportados = JSON.parse(e.target.result);
            DADOS = { ...DADOS_INICIAIS, ...dadosImportados };
            await atualizarNoGitHub();
            await atualizarOpcoes();
            await responder();
            alert("Dados importados com sucesso!");
        };
        reader.readAsText(file);
    } catch (error) {
        console.error("Erro ao importar dados:", error);
        alert("Erro ao importar os dados. Verifique o arquivo JSON.");
    } finally {
        ELEMENTS.importarArquivo.value = "";
    }
};

const toggleEditarTitulo = () => {
    const titleContainer = document.getElementById("titleContainer");
    const isVisible = titleContainer.style.display === "flex";
    
    if (ELEMENTS.opcoes.value === "") {
        alert("Selecione uma opção primeiro!");
        return;
    }
    
    titleContainer.style.display = isVisible ? "none" : "flex";
};

const ajustarAlturaTextarea = () => {
    const textarea = ELEMENTS.resposta;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
};

const executarAcaoEditar = async (acao) => {
    switch (acao) {
        case "salvar":
            await salvarEdicao();
            break;
        case "alterarCategoria":
            await alterarCategoria();
            break;
        case "apagar":
            await apagarTexto();
            break;
        case "adicionar":
            await mostrarPopupAdicionar();
            break;
        case "editarTitulo":
            toggleEditarTitulo();
            break;
        default:
            console.log("Nenhuma ação de edição selecionada.");
    }
    document.getElementById("editarAcoes").value = "";
};

const inicializar = async () => {
    try {
        await inicializarDados();
        await atualizarOpcoes();
        await responder();
        atualizarSaudacao();
        ajustarAlturaTextarea();
        setInterval(atualizarSaudacao, 600000);
    } catch (error) {
        console.error("Erro na inicialização:", error);
        ELEMENTS.resposta.value = "Erro ao inicializar o chat.";
        ajustarAlturaTextarea();
    }
};

inicializar();