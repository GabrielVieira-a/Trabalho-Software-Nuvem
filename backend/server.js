import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT,
    APPWRITE_DB,
    APPWRITE_COLLECTION,
    APPWRITE_API_KEY
} = process.env;

app.post("/register", async (req, res) => {
    try {
        const { email, nome } = req.body;

        if (!email || !nome) {
            return res.status(400).json({
                erro: "Campos obrigatórios: email e nome."
            });
        }

        // gerar senha automática
        const senhaGerada = Math.random().toString(36).slice(-10);

        const response = await fetch(`${APPWRITE_ENDPOINT}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Appwrite-Project": APPWRITE_PROJECT,
                "X-Appwrite-Key": APPWRITE_API_KEY,
                "X-Appwrite-Mode": "admin"
            },
            body: JSON.stringify({
                userId: "unique()",   
                email: email,
                password: senhaGerada,
                name: nome
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({
                sucesso: false,
                erro: data
            });
        }

        res.json({
            sucesso: true,
            usuario: {
                id: data.$id,
                nome: data.name,
                email: data.email
            }
        });

    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ erro: "Erro interno ao registrar usuário" });
    }
});



// ============================
// ROTA: SALVAR PONTUAÇÃO
// ============================
app.post("/score", async (req, res) => {
    try {
        const { nome, email, pontuacao } = req.body;

        const response = await fetch(
            `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DB}/collections/${APPWRITE_COLLECTION}/documents`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Appwrite-Project": APPWRITE_PROJECT,
                    "X-Appwrite-Key": APPWRITE_API_KEY
                },
                body: JSON.stringify({ nome, email, pontuacao })
            }
        );

        const data = await response.json();
        res.json({ sucesso: true, data });
    } catch (error) {
        console.error("Erro ao salvar:", error);
        res.status(500).json({ erro: "Falha ao salvar pontuação" });
    }
});

// ============================
// ROTA: RANKING (TOP 5)
// ============================
app.get("/ranking", async (req, res) => {
    try {
        const response = await fetch(
            `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DB}/collections/${APPWRITE_COLLECTION}/documents`,
            {
                method: "GET",
                headers: {
                    "X-Appwrite-Project": APPWRITE_PROJECT,
                    "X-Appwrite-Key": APPWRITE_API_KEY
                }
            }
        );

        const data = await response.json();
        let docs = data.documents;

        docs.sort((a, b) => b.pontuacao - a.pontuacao);

        const top5 = docs.slice(0, 5);

        res.json(top5);
    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        res.status(500).json({ erro: "Falha ao buscar ranking" });
    }
});

// ============================
// INICIAR SERVIDOR
// ============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
});
