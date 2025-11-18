// ===================== SELETORES DE TELAS ===================== //
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

// ===================== VARIÁVEIS ===================== //
let currentQuestion = 0;
let score = 0;
let health = 100;

// ===================== PERGUNTAS ===================== //
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
        texto: "EM APLICAÇÕES BASEADAS EM NUVEM, A ESCALABILIDADE PODE SER AJUSTADA AUTOMATICAMENTE CONFORME A DEMANDA DE USUÁRIOS AUMENTA OU DIMINUIR.",
        opcoes: ["VERDADEIRO", "FALSO"],
        correta: 0
    },
    {
        texto: "QUAL É UM MODELO DE SERVIÇO EM NUVEM?",
        opcoes: ["IAAS", "DNS", "FTP", "PNG"],
        correta: 0
    }
];


// ===================== TRANSIÇÃO: LOGIN → REGRAS ===================== //
loginForm.addEventListener("submit", e => {
    e.preventDefault();
    startScreen.style.display = "none";
    rulesScreen.style.display = "block";
});


// ===================== TRANSIÇÃO: REGRAS → QUIZ ===================== //
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


// ===================== EMBARALHAR PERGUNTAS ===================== //
function embaralharPerguntas() {
    for (let i = perguntas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perguntas[i], perguntas[j]] = [perguntas[j], perguntas[i]];
    }
}


// ===================== MOSTRAR PERGUNTA ===================== //
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


// ===================== VERIFICAR RESPOSTA ===================== //
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


// ===================== TELA FINAL ===================== //
function mostrarResultado() {
    quizScreen.style.display = "none";
    resultsScreen.style.display = "block";
    finalScore.textContent = score;

    answersList.innerHTML = perguntas
        .map((p, i) => `<p>${i + 1}: ${p.opcoes[p.correta]}</p>`)
        .join("");

    const nomeJogador = document.getElementById("nome").value;
    const emailJogador = document.getElementById("email").value;

    salvarPontuacao(nomeJogador, emailJogador, score);
    mostrarRanking(nomeJogador, score);
}


// ===================== SALVAR NO APPWRITE (REST) ===================== //
async function salvarPontuacao(nome, email, pontuacao) {
    try {
        const response = await fetch(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Appwrite-Project": PROJECT_ID,
                "X-Appwrite-Key": API_KEY
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                pontuacao: pontuacao
            })
        });

        const data = await response.json();
        console.log("Documento salvo:", data);

    } catch (error) {
        console.error("Erro ao salvar documento:", error);
    }
}


// ===================== MOSTRAR RANKING (REST) ===================== //
async function mostrarRanking(nomeAtual, pontuacaoAtual) {
    try {
        const response = await fetch(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
            method: "GET",
            headers: {
                "X-Appwrite-Project": PROJECT_ID,
                "X-Appwrite-Key": API_KEY
            }
        });

        const data = await response.json();
        let docs = data.documents;

        docs.sort((a, b) => b.pontuacao - a.pontuacao);

        const top5 = docs.slice(0, 5);

        let rankingHTML = "<hr><h3>🏆 TOP 5 JOGADORES</h3>";

        top5.forEach((doc, i) => {
            rankingHTML += `<p>${i + 1}. ${doc.nome} — ${doc.pontuacao} pts</p>`;
        });

        rankingHTML += `<hr><p><strong>Você:</strong> ${nomeAtual} — ${pontuacaoAtual} pts</p>`;

        answersList.innerHTML += rankingHTML;

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
    }
}


// ===================== JOGAR NOVAMENTE ===================== //
playAgainBtn.addEventListener("click", () => {
    resultsScreen.style.display = "none";
    startScreen.style.display = "block";
});
