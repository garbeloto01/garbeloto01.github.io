// --- Verificador de IP ---

// 1. Pega os elementos do HTML que vamos usar
const ipInput = document.getElementById('ip-input');
const verificarBtn = document.getElementById('verificar-ip-btn');
const resultadoIp = document.getElementById('resultado-ip');

// 2. Adiciona um "ouvinte" de clique no botão
verificarBtn.addEventListener('click', verificarIP);

// -----------------------------------------------------------------
// --- NOVA FUNÇÃO DE VALIDAÇÃO ---
// Esta função checa se o formato do IP é válido
function isValidIP(ip) {
    const octetos = ip.split('.'); // Divide o IP pelos pontos

    // 1. Um IP VÁLIDO deve ter exatamente 4 partes (octetos)
    if (octetos.length !== 4) {
        return false;
    }

    // 2. Checa CADA uma das 4 partes
    // 'every' é um loop que só retorna 'true' se TODOS os itens passarem no teste
    return octetos.every(octeto => {

        // 2a. A parte não pode estar vazia (ex: "192..1.1")
        if (octeto === '') { return false; }

        // 2b. A parte deve conter APENAS números (sem letras)
        // /^\d+$/ é uma Expressão Regular que testa se a string contém 1 ou mais dígitos
        if (!/^\d+$/.test(octeto)) { return false; }

        // 2c. Converte a parte para um número
        const num = parseInt(octeto);

        // 2d. O número deve estar entre 0 e 255
        return num >= 0 && num <= 255;
    });
}
// --- FIM DA NOVA FUNÇÃO ---
// -----------------------------------------------------------------


// 3. A função principal (agora ATUALIZADA)
function verificarIP() {
    // .trim() remove espaços em branco do início e fim
    const ip = ipInput.value.trim();

    // Limpa o resultado anterior
    resultadoIp.textContent = '';
    resultadoIp.className = '';

    // -----------------------------------------------------------------
    // --- LÓGICA DE VERIFICAÇÃO ATUALIZADA ---

    // PASSO 1: Checar se está vazio
    if (ip === '') {
        resultadoIp.textContent = 'Por favor, digite um IP.';
        resultadoIp.className = 'erro';
        return; // Para a função aqui
    }

    // PASSO 2: Checar o FORMATO do IP (usando nossa nova função)
    if (!isValidIP(ip)) {
        resultadoIp.textContent = 'Formato de IP inválido. (Ex: 192.168.0.1)';
        resultadoIp.className = 'erro';
        return; // Para a função aqui
    }

    // PASSO 3: Se o formato for válido, checamos se é público ou privado
    // (Essa lógica é a mesma de antes, mas agora só roda se o IP for válido)

    if (ip.startsWith('10.')) {
        resultadoIp.textContent = 'É um IP Privado (Classe A)';
        resultadoIp.className = 'privado';

    } else if (ip.startsWith('192.168.')) {
        resultadoIp.textContent = 'É um IP Privado (Classe C)';
        resultadoIp.className = 'privado';

    } else if (ip.startsWith('172.')) {
        const octetos = ip.split('.');
        const oct2 = parseInt(octetos[1]);

        if (oct2 >= 16 && oct2 <= 31) {
            resultadoIp.textContent = 'É um IP Privado (Classe B)';
            resultadoIp.className = 'privado';
        } else {
            resultadoIp.textContent = 'É um IP Público';
            resultadoIp.className = 'publico';
        }

    } else if (ip.startsWith('127.')) {
        resultadoIp.textContent = 'É um IP de Loopback (localhost)';
        resultadoIp.className = 'loopback';

    } else {
        // Se chegou aqui, é um IP VÁLIDO que não é privado nem loopback
        resultadoIp.textContent = 'É um IP Público';
        resultadoIp.className = 'publico';
    }
    // --- FIM DA LÓGICA ATUALIZADA ---
}
// --- Ferramenta "Qual é o meu IP" ---

// 1. Pega os novos elementos do HTML
const meuIpBtn = document.getElementById('meu-ip-btn');
const resultadoMeuIp = document.getElementById('resultado-meu-ip');

// 2. Adiciona o ouvinte de clique
meuIpBtn.addEventListener('click', descobrirMeuIp);

// 3. A função que busca o IP
async function descobrirMeuIp() {
    resultadoMeuIp.textContent = 'Buscando... ⌛';
    resultadoMeuIp.className = 'buscando'; // Classe para cor

    try {
        // "fetch" é o comando para "buscar" algo na internet
        // "await" pausa a função até a resposta chegar
        const resposta = await fetch('https://api.ipify.org?format=json');

        // Se a resposta não for OK (ex: erro 404, 500)
        if (!resposta.ok) {
            throw new Error('Não foi possível buscar o IP.');
        }

        // Converte a resposta (que é texto) para um objeto JSON
        const dados = await resposta.json();

        // 'dados.ip' contém o endereço de IP
        resultadoMeuIp.textContent = `Seu IP Público é: ${dados.ip}`;
        resultadoMeuIp.className = 'publico'; // Reutilizando a classe verde

    } catch (erro) {
        // Se der algum erro (ex: sem internet ou a API falhou)
        console.error("Erro ao buscar IP:", erro);
        resultadoMeuIp.textContent = 'Erro ao buscar o IP. Tente novamente.';
        resultadoMeuIp.className = 'erro'; // Reutilizando a classe vermelha
    }
}
// --- Ferramenta 3: Medidor de Latência (Ping) ---

// 1. Pega os elementos (AGORA COM OS NOVOS BOTÕES)
const pingBtn = document.getElementById('ping-btn');
const pingResultados = document.getElementById('resultado-ping');
const repetirPingBtn = document.getElementById('repetir-ping-btn');
const limparPingBtn = document.getElementById('limpar-ping-btn');

// 2. Define os servidores que vamos "pingar"
const servidoresParaTestar = [
    { nome: 'Google (Brasil)', url: 'https://www.google.com.br/favicon.ico?' },
    { nome: 'Google (EUA)', url: 'https://www.google.com/favicon.ico?' },
    { nome: 'Cloudflare (Global)', url: 'https://1.1.1.1/favicon.ico?' },
    { nome: 'Facebook (EUA)', url: 'https://www.facebook.com/favicon.ico?' }
];

// 3. Adiciona os ouvinte de clique (AGORA PARA OS 3 BOTÕES)
pingBtn.addEventListener('click', testarLatenciaDeTodos);
repetirPingBtn.addEventListener('click', testarLatenciaDeTodos); // Repetir = chamar a mesma função
limparPingBtn.addEventListener('click', limparResultadosPing); // Limpar = chama uma nova função

// 4. Função principal que coordena os testes (ATUALIZADA)
async function testarLatenciaDeTodos() {

    // --- Prepara a UI para o teste ---
    pingResultados.innerHTML = '<li>Testando... ⌛</li>'; // Mostra status

    // Esconde TODOS os botões durante o teste
    pingBtn.style.display = 'none';
    repetirPingBtn.style.display = 'none';
    limparPingBtn.style.display = 'none';

    let firstResult = true; // Flag para o primeiro resultado

    // --- Loop de teste (O setTimeout FOI REMOVIDO DAQUI) ---
    for (const servidor of servidoresParaTestar) {

        const tempo = await medirLatencia(servidor.url);

        let resultadoHTML = '';

        if (tempo === -1) {
            resultadoHTML = `<li>${servidor.nome}: <span class="erro">Falhou</span></li>`;
        } else {
            const cor = tempo < 100 ? 'publico' : (tempo < 300 ? 'loopback' : 'erro');
            resultadoHTML = `<li>${servidor.nome}: <span class="${cor}">${tempo} ms</span></li>`;
        }

        // --- Atualiza a UI ---
        if (firstResult) {
            // Se for o primeiro resultado, SUBSTITUI o "Testando..."
            pingResultados.innerHTML = resultadoHTML;
            firstResult = false;
        } else {
            // Se não for o primeiro, ADICIONA na lista
            pingResultados.innerHTML += resultadoHTML;
        }
    }

    // --- Finaliza a UI ---
    // Mostra os botões de Ação quando o teste termina
    repetirPingBtn.style.display = 'inline-block';
    limparPingBtn.style.display = 'inline-block';
}

// 5. Função "ajudante" que mede o tempo (igual a antes)
async function medirLatencia(url) {
    const startTime = performance.now();
    try {
        await fetch(url + Math.random(), { mode: 'no-cors', cache: 'no-store' });
        const endTime = performance.now();
        return Math.round(endTime - startTime);
    } catch (erro) {
        console.error(`Erro ao pingar ${url}:`, erro);
        return -1;
    }
}

// 6. NOVA FUNÇÃO PARA LIMPAR OS RESULTADOS
function limparResultadosPing() {
    pingResultados.innerHTML = ''; // Limpa a lista

    // Esconde os botões de Ação
    repetirPingBtn.style.display = 'none';
    limparPingBtn.style.display = 'none';

    // Mostra o botão original "Iniciar Teste"
    pingBtn.style.display = 'inline-block';
}
// --- Ferramenta 4: Consulta DNS (NSLOOKUP) ---

// 1. Pega os elementos do HTML
const cmdInput = document.getElementById('cmd-input');
const cmdOutput = document.getElementById('cmd-output');

// 2. Adiciona o "ouvinte" para a tecla "Enter"
cmdInput.addEventListener('keyup', function (evento) {
    if (evento.key === "Enter") {
        const comandoCompleto = cmdInput.value.trim();
        cmdInput.value = ''; // Limpa o input

        // Chama a nova função NSLOOKUP
        executarComandoNslookup(comandoCompleto);
    }
});

// 3. Função que executa o comando NSLOOKUP
async function executarComandoNslookup(comandoCompleto) {

    // Adiciona o comando do usuário na tela
    cmdOutput.textContent += `\nC:\\Users\\Painel> ${comandoCompleto}\n`;

    // Analisa o comando. Queremos "nslookup google.com"
    const partes = comandoCompleto.split(' ');
    const host = partes[1]; // Pega a segunda parte (o domínio)

    // Validação
    if ((partes[0] !== 'nslookup' && partes[0] !== 'host') || !host) {
        cmdOutput.textContent += 'Comando inválido. Use: nslookup google.com\n';
        return; // Para a função
    }

    // --- MÁGICA DA API DO GOOGLE DNS (Confiável!) ---
    const apiUrl = `https://dns.google/resolve?name=${host}`;

    // Adiciona uma linha de "cabeçalho" igual ao CMD
    cmdOutput.textContent += `Servidor:  dns.google\nAddress:   8.8.8.8\n\n`;

    try {
        const resposta = await fetch(apiUrl);
        if (!resposta.ok) {
            throw new Error('Falha na resposta da API');
        }

        const dados = await resposta.json(); // Esta API usa JSON

        // Status 0 = Sucesso
        if (dados.Status === 0 && dados.Answer) {
            cmdOutput.textContent += `Não-autoritativa resposta:\n`;

            // Loop para mostrar todos os IPs (IPv4 e IPv6)
            dados.Answer.forEach(registro => {
                // "type: 1" é IPv4 (Registro A)
                // "type: 28" é IPv6 (Registro AAAA)
                if (registro.type === 1 || registro.type === 28) {
                    cmdOutput.textContent += `Nome:    ${registro.name}\n`;
                    cmdOutput.textContent += `Address: ${registro.data}\n`;
                }
            });

        } else {
            // Se o Status não for 0 (ex: domínio não existe)
            cmdOutput.textContent += `*** dns.google não pôde encontrar ${host}: Non-existent domain\n`;
        }

    } catch (erro) {
        console.error("Erro ao executar nslookup:", erro);
        cmdOutput.textContent += `Erro ao tentar consultar ${host}. Verifique o domínio ou sua conexão.\n`;
    }

    cmdOutput.textContent += '\n'; // Linha em branco no final

    // Rola o terminal para o final
    document.getElementById('cmd-tela').scrollTop = document.getElementById('cmd-tela').scrollHeight;
}
// --- Seção 1: Notícias de TI ---

// Pega o "container" onde as notícias vão entrar
const conteudoNoticias = document.getElementById('conteudo-noticias');

// Função principal para carregar as notícias
async function carregarNoticias() {
    conteudoNoticias.innerHTML = '<p class="buscando">Carregando notícias de TI... ⌛</p>';

    // URL do feed de tecnologia (Tecnoblog)
    const rss_url = 'https://tecnoblog.net/feed/';

    // API que converte RSS para JSON
    const api_url = 'https://api.rss2json.com/v1/api.json';

    // A URL final que vamos buscar
    const url = `${api_url}?rss_url=${encodeURIComponent(rss_url)}`;

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error('Falha ao carregar o feed de notícias.');
        }

        const dados = await resposta.json();

        // Se a API retornou "ok"
        if (dados.status === 'ok') {
            // Limpa a mensagem "Carregando..."
            conteudoNoticias.innerHTML = '';

            // Pega os 7 primeiros artigos
            const artigos = dados.items.slice(0, 7);

            // Loop para criar o HTML de cada notícia
            artigos.forEach(artigo => {
                // Converte a data (ex: "2025-11-01 ...") para um formato mais amigável
                const pubDate = new Date(artigo.pubDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Cria o "card" da notícia
                const noticiaHTML = `
                    <article class="artigo-noticia">
                        <h3>
                            <a href="${artigo.link}" target="_blank">
                                ${artigo.title}
                            </a>
                        </h3>
                        <div class="meta-noticia">
                            <span class="autor">${artigo.author}</span> | 
                            <span class="data">${pubDate}</span>
                        </div>
                    </article>
                `;

                // Adiciona o card na página
                conteudoNoticias.innerHTML += noticiaHTML;
            });

        } else {
            throw new Error('Feed de notícias retornou um erro.');
        }

    } catch (erro) {
        console.error("Erro ao carregar notícias:", erro);
        conteudoNoticias.innerHTML = '<p class="erro">Não foi possível carregar as notícias. Tente atualizar a página.</p>';
    }
}

// --- INICIALIZADOR ---
// Esta função vai rodar TUDO que precisa começar com a página
function iniciarPainel() {
    carregarNoticias(); // Carrega as notícias
    // (Qualquer outra função de "início" pode vir aqui)
}

// Adiciona o "ouvinte" para rodar a função acima QUANDO a página carregar
document.addEventListener('DOMContentLoaded', iniciarPainel);
// --- Lógica do Sistema de Abas (Tabs) ---

function setupTabs() {
    // Pega todos os botões-abas
    const tabLinks = document.querySelectorAll('.tab-link');

    // Pega todos os painéis-conteúdo
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Adiciona um clique em CADA botão
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab'); // Ex: "tab-1"

            // 1. Remove 'active' de TODOS os botões e painéis
            tabLinks.forEach(l => l.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // 2. Adiciona 'active' SÓ no botão clicado
            link.classList.add('active');

            // 3. Adiciona 'active' SÓ no painel correspondente
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// --- ATUALIZAÇÃO DO INICIALIZADOR ---
// Precisamos garantir que a função setupTabs() rode no início.
// Encontre sua função 'iniciarPainel()' e adicione a chamada:

/* // [ANTES]
function iniciarPainel() {
    carregarNoticias(); 
}
document.addEventListener('DOMContentLoaded', iniciarPainel);
*/

// [DEPOIS - SUBSTITUA PELO CÓDIGO ABAIXO]
function iniciarPainel() {
    carregarNoticias(); // Carrega as notícias
    setupTabs(); // Configura as abas
}
document.addEventListener('DOMContentLoaded', iniciarPainel);
