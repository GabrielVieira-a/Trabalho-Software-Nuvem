const { Client, Databases, Query } = Appwrite;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('69162a6f000a7dfd4736');

const databases = new Databases(client);

const DATABASE_ID = '69162aa9002463ab1ea6';
const COLLECTION_ID = '69162aa9002463ab1ea6';

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

let currentQuestion = 0;
let score = 0;
let health = 100;

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

// Função para embaralhar as perguntas (Fisher-Yates)
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

    answersList.innerHTML = perguntas.map((p, i) => {
        const correta = p.opcoes[p.correta];
        return `<p>${i + 1}: ${correta}</p>`;
    }).join("");

    const nomeJogador = document.getElementById("nome").value;
    const emailJogador = document.getElementById("email").value;

    salvarPontuacao(nomeJogador, emailJogador, score);
    mostrarRanking(nomeJogador, score);
}

// Salvar pontuação no Appwrite
async function salvarPontuacao(nome, email, pontuacao) {
    try {
        await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
            nome: nome,
            email: email,
            pontuacao: pontuacao
        });
        console.log("Pontuação salva com sucesso no Appwrite!");
    } catch (error) {
        console.error("Erro ao salvar no Appwrite:", error);
    }
}

// Mostrar ranking com melhorias visuais
async function mostrarRanking(nomeAtual, pontuacaoAtual) {
    try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.orderDesc("pontuacao"),
            Query.limit(5)
        ]);

        let rankingHTML = "<hr><h3>🏆 TOP 5 JOGADORES</h3>";
        response.documents.forEach((doc, i) => {
            rankingHTML += `<p>${i + 1}. ${doc.nome} — ${doc.pontuacao} pts</p>`;
        });

        // destaque para o jogador atual
        rankingHTML += `<hr><p><strong>Você:</strong> ${nomeAtual} — ${pontuacaoAtual} pts</p>`;

        // substitui o conteúdo anterior, mantendo respostas + ranking
        answersList.innerHTML = perguntas.map((p, i) => {
            const correta = p.opcoes[p.correta];
            return `<p>${i + 1}: ${correta}</p>`;
        }).join("") + rankingHTML;

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
    }
}

playAgainBtn.addEventListener("click", () => {
    resultsScreen.style.display = "none";
    startScreen.style.display = "block";
});
