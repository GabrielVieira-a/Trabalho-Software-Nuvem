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

// login → regras
loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();

    if (nome === "" || email === "") return alert("Preencha nome e e-mail!");

    jogador = { nome, email };
    startScreen.style.display = "none";
    rulesScreen.style.display = "block";
});

// regras → quiz
startQuizBtn.addEventListener("click", () => {
    rulesScreen.style.display = "none";
    quizScreen.style.display = "block";

    embaralharPerguntas(); 
    currentQuestion = 0;
    score = 0;
    health = 100;
    healthBar.style.width = "100%";
    healthBar.textContent = "100%";

    mostrarPergunta();
});

// Embaralhar perguntas
function embaralharPerguntas() {
    for (let i = perguntas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perguntas[i], perguntas[j]] = [perguntas[j], perguntas[i]];
    }
}

function mostrarPergunta() {
    const q = perguntas[currentQuestion];
    questionText.textContent = q.texto;
    optionsContainer.innerHTML = "";

    q.opcoes.forEach((opcao, index) => {
        const btn = document.createElement("button");
        btn.textContent = opcao;
        btn.classList.add("btn-opcao");
        btn.onclick = () => verificarResposta(index);
        optionsContainer.appendChild(btn);
    });
}

function verificarResposta(index) {
    const q = perguntas[currentQuestion];
    if (index === q.correta) {
        score += 25;
    } else {
        health -= 25;
        if (health < 0) health = 0;
        healthBar.style.width = health + "%";
        healthBar.textContent = health + "%";
    }

    currentQuestion++;
    if (currentQuestion < perguntas.length) {
        mostrarPergunta();
    } else {
        mostrarResultado();
    }
}

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

    // Atualizar ranking na tela
    mostrarRanking();
}

playAgainBtn.addEventListener("click", () => {
    resultsScreen.style.display = "none";
    startScreen.style.display = "block";
});

// --- FUNÇÕES DE RANKING ---
function salvarNoRanking(nome, email, pontuacao) {
    const novoJogador = { nome, email, pontuacao };
    const ranking = JSON.parse(localStorage.getItem("rankingQuiz")) || [];

    ranking.push(novoJogador);

    // Ordenar por pontuação (maior para menor)
    ranking.sort((a, b) => b.pontuacao - a.pontuacao);

    // Limitar a 10 melhores (opcional)
    const top10 = ranking.slice(0, 10);

    localStorage.setItem("rankingQuiz", JSON.stringify(top10));
}

function mostrarRanking() {
    const ranking = JSON.parse(localStorage.getItem("rankingQuiz")) || [];
    rankingList.innerHTML = ranking.map((j, i) => 
        `<li><strong>${i + 1}.</strong> ${j.nome} — ${j.pontuacao} pontos</li>`
    ).join("");
}
