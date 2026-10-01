const perguntasQuiz = [
    {
        id: 1,
        texto: "Quando você pensa em criar tecnologia, o que mais te empolga?",
        opcoes: {
            a: { label: "Criar aplicativos legais e jogos divertidos que todo mundo use", valor: "desenvolvimento" },
            b: { label: "Fazer o design visual, cores e telas intuitivas para os usuários", valor: "ux_ui" },
            c: { label: "Ensinar Inteligência Artificial a pensar, conversar e criar coisas", valor: "ia" },
            d: { label: "Proteger contas e sistemas contra invasões e hackers", valor: "seguranca" }
        }
    },
    {
        id: 2,
        texto: "Qual desafio tecnológico você acharia mais legal de resolver?",
        opcoes: {
            a: { label: "Manter servidores na nuvem rodando sem cair com milhões de acessos", valor: "cloud" },
            b: { label: "Analisar dados e descobrir informações valiosas escondidas", valor: "dados" },
            c: { label: "Desenhar a estrutura e arquitetura completa de um grande projeto", valor: "arquitetura" },
            d: { label: "Liderar a equipe, organizar os prazos e garantir o sucesso do time", valor: "gestao" }
        }
    },
    {
        id: 3,
        texto: "No seu dia a dia dos sonhos, qual atividade parece mais interessante?",
        opcoes: {
            a: { label: "Escrever códigos eficientes e ver recursos novos funcionando na tela", valor: "programacao" },
            b: { label: "Testar tudo com cuidado para garantir que não exista nenhum bug", valor: "qa_testing" },
            c: { label: "Automatizar a infraestrutura para atualizar o sistema sem interrupções", valor: "devops" },
            d: { label: "Treinar modelos inteligentes para tomar decisões de forma autônoma", valor: "ia" }
        }
    },
    {
        id: 4,
        texto: "Se a sua equipe fosse lançar o próximo grande app, qual seria seu papel principal?",
        opcoes: {
            a: { label: "Desenvolvedor(a): Programar as melhores funções e novos recursos", valor: "desenvolvimento" },
            b: { label: "Especialista em Segurança: Garantir um app ultra seguro e confiável", valor: "seguranca" },
            c: { label: "Líder de Produto & UX: Criar um visual incrível e alinhar a equipe", valor: "gestao" },
            d: { label: "Arquiteto(a) de Software: Planejar como toda a tecnologia se conecta", valor: "arquitetura" }
        }
    }
];

const TOTAL_FASES_JOGO = 4;
const urlParams = new URLSearchParams(window.location.search);
let faseQuizId = parseInt(urlParams.get("fase")) || 1;

if (faseQuizId < 1 || faseQuizId > TOTAL_FASES_JOGO) {
    window.location.href = "resultado.html";
}

document.title = `Quiz da Engenharia - Fase ${faseQuizId}`;
document.getElementById("quizTitulo").innerText = `Pergunta (Fase ${faseQuizId} de ${TOTAL_FASES_JOGO}):`;

const pergunta = perguntasQuiz[faseQuizId - 1];
if (pergunta) {
    document.getElementById("quizTexto").innerText = pergunta.texto;
    const opcoesContainer = document.getElementById("quizOpcoes");
    opcoesContainer.innerHTML = "";

    Object.keys(pergunta.opcoes).forEach(chave => {
        const opcao = pergunta.opcoes[chave];
        const btn = document.createElement("button");
        btn.className = "quiz-button";
        btn.innerText = opcao.label;
        btn.addEventListener("click", () => responder(opcao.valor));
        opcoesContainer.appendChild(btn);
    });
}

function responder(valor) {
    if (typeof audioManager !== "undefined") {
        audioManager.playClickSound();
    }
    let skills = JSON.parse(localStorage.getItem("skills")) || {};
    skills[valor] = (skills[valor] || 0) + 1;
    localStorage.setItem("skills", JSON.stringify(skills));

    let proximaFase = faseQuizId + 1;
    setTimeout(() => {
        if (proximaFase <= TOTAL_FASES_JOGO) {
            window.location.href = `game.html?fase=${proximaFase}`;
        } else {
            window.location.href = "resultado.html";
        }
    }, 150);
}
