// --- SELETORES DOM ---
const loginForm = document.getElementById("login-form");
const startScreen = document.getElementById("start-screen");
const rulesScreen = document.getElementById("rules-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");

const startQuizBtn = document.getElementById("start-quiz-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const healthBar = document.getElementById("health-bar");
const finalScore = document.getElementById("final-score");
const answersList = document.getElementById("answers-list");
const rankingList = document.getElementById("ranking-list");

// Seletores para a tela de ranking separada (TELA 5)
const verRankingBtn = document.getElementById("ver-ranking-btn");
const rankingScreen = document.getElementById("ranking-screen");
const voltarInicioBtn = document.getElementById("voltar-inicio-btn");
const rankingListHome = document.getElementById("ranking-list-home");

// --- ESTADO DO JOGO ---
let currentQuestion = 0;
let score = 0;
let health = 100;
let jogador = {};

const perguntas = [
    {
        texto: "QUAL DAS OPÇÕES A SEGUIR É UM MODELO DE SERVIÇO DE COMPUTAÇÃO EM NUVEM?",
        opcoes: ["HTTP", "SAAS", "HTML", "CSS"],
        correta: 1
    },
    {
        texto: "NA COMPUTAÇÃO EM NUVEM, OS DADOS FICAM ARMAZENADOS APENAS NO COMPUTADOR DO USUÁRIO?",
        opcoes: ["VERDADEIRO", "FALSO"],
        correta: 1
    },
    {
        texto: "EM APLICAÇÕES BASEADAS EM NUVEM, A ESCALABILIDADE PODE SER AJUSTADA AUTOMATICAMENTE CONFORME A DEMANDA DE USUÁRIOS AUMENTA OU DIMINUI.",
        opcoes: ["VERDADEIRO", "FALSO"],
        correta: 0
    },
    {
        texto: "QUAL É UM MODELO DE SERVIÇO EM NUVEM?",
        opcoes: ["IAAS", "DNS", "FTP", "PNG"],
        correta: 0
    }
];

// --- FLUXO DO JOGO ---

// TELA 1 (login) → TELA 2 (regras)
loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();

    if (nome === "" || email === "") return alert("Preencha nome e e-mail!");

    jogador = { nome, email };
    startScreen.style.display = "none";
    rulesScreen.style.display = "block";
});

// TELA 2 (regras) → TELA 3 (quiz)
startQuizBtn.addEventListener("click", () => {
    rulesScreen.style.display = "none";
    quizScreen.style.display = "block";

    // Reseta o estado do jogo
    embaralharPerguntas(); 
    currentQuestion = 0;
    score = 0;
    health = 100;
    healthBar.style.width = "100%";
    healthBar.textContent = "100%";
    healthBar.classList.remove("low-health"); // (Opcional: para barra vermelha)

    mostrarPergunta();
});

// Embaralhar perguntas
function embaralharPerguntas() {
    for (let i = perguntas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perguntas[i], perguntas[j]] = [perguntas[j], perguntas[i]];
    }
}

// Mostrar pergunta na TELA 3
function mostrarPergunta() {
    const q = perguntas[currentQuestion];
    questionText.textContent = q.texto;
    optionsContainer.innerHTML = ""; // Limpa opções anteriores

    q.opcoes.forEach((opcao, index) => {
        const btn = document.createElement("button");
        btn.textContent = opcao;
        btn.classList.add("btn-opcao");
        btn.onclick = () => verificarResposta(index);
        optionsContainer.appendChild(btn);
    });
}

// *** FUNÇÃO ATUALIZADA (Sugestões 1 e 2) ***
function verificarResposta(index) {
    const q = perguntas[currentQuestion];
    const botoes = optionsContainer.querySelectorAll('.btn-opcao');

    // Desativa todos os botões para impedir cliques múltiplos
    botoes.forEach(btn => {
        btn.disabled = true;
    });

    // 1. Lógica de acerto/erro
    if (index === q.correta) {
        score += 25;
        botoes[index].classList.add('correto'); // Feedback verde
    } else {
        health -= 25;
        if (health < 0) health = 0;
        healthBar.style.width = health + "%";
        healthBar.textContent = health + "%";
        
        botoes[index].classList.add('incorreto'); // Feedback vermelho
        botoes[q.correta].classList.add('correto'); // Mostra a correta
    }

    // 2. Atraso para o usuário ver o feedback
    setTimeout(() => {
        // 3. Verifica "Game Over" (Sugestão 1)
        if (health === 0) {
            mostrarResultado();
            return; // Encerra o quiz
        }

        // 4. Avança para a próxima pergunta
        currentQuestion++;
        if (currentQuestion < perguntas.length) {
            mostrarPergunta(); // Isso limpa os botões e estilos antigos
        } else {
            mostrarResultado(); // Fim das perguntas
        }
    }, 1500); // 1.5 segundos de atraso
}

// TELA 3 (quiz) → TELA 4 (resultado)
function mostrarResultado() {
    quizScreen.style.display = "none";
    resultsScreen.style.display = "block";
    finalScore.textContent = score;

    // Salvar resultado no ranking
    salvarNoRanking(jogador.nome, jogador.email, score);

    // Mostrar respostas corretas
    answersList.innerHTML = perguntas.map((p, i) => {
        const correta = p.opcoes[p.correta];
        return `<p>${i + 1}: ${correta}</p>`;
    }).join("");

    // Atualizar ranking na tela de resultados (Usando a nova função)
    atualizarRanking("ranking-list");
}

// TELA 4 (resultado) → TELA 1 (login)
playAgainBtn.addEventListener("click", () => {
    resultsScreen.style.display = "none";
    startScreen.style.display = "block";
    
    // Limpa o formulário de login
    loginForm.reset();
});

// --- FUNÇÕES DE RANKING (Sugestão 3) ---

function salvarNoRanking(nome, email, pontuacao) {
    const novoJogador = { nome, email, pontuacao };
    const ranking = JSON.parse(localStorage.getItem("rankingQuiz")) || [];

    ranking.push(novoJogador);

    // Ordenar por pontuação (maior para menor)
    ranking.sort((a, b) => b.pontuacao - a.pontuacao);

    // Limitar a 10 melhores
    const top10 = ranking.slice(0, 10);

    localStorage.setItem("rankingQuiz", JSON.stringify(top10));
}

/**
 * Função Reutilizável para exibir o ranking em qualquer elemento OL/UL.
 * (Substitui 'mostrarRanking' e o código do script inline)
 */
function atualizarRanking(elementId) {
    const listaElemento = document.getElementById(elementId);
    const ranking = JSON.parse(localStorage.getItem("rankingQuiz")) || [];

    if (ranking.length === 0) {
        listaElemento.innerHTML = "<p>Nenhum jogador registrado ainda.</p>";
        return;
    }

    listaElemento.innerHTML = ranking.map((j, i) => 
        `<li><strong>${i + 1}.</strong> ${j.nome} — ${j.pontuacao} pontos</li>`
    ).join("");
}


// --- LÓGICA DA TELA DE RANKING (TELA 5) ---
// (Este era o script inline, agora movido para cá)

verRankingBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    rankingScreen.style.display = "block";
    
    // Usa a nova função reutilizável
    atualizarRanking("ranking-list-home");
});

voltarInicioBtn.addEventListener("click", () => {
    rankingScreen.style.display = "none";
    startScreen.style.display = "block";
});