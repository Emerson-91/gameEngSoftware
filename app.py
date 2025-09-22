from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
# Em produção, use algo mais complexo
app.secret_key = "uma_chave_secreta_bem_segura"

# --- Dados do Jogo e Quiz ---
TOTAL_FASES_JOGO = 4

perguntas_quiz = [
    {
        "id": 1,
        "texto": "O que você mais gostaria de fazer no mundo da tecnologia?",
        "opcoes": {
            "a": {"label": "Criar aplicativos e jogos", "valor": "desenvolvimento"},
            "b": {"label": "Proteger sistemas e informações", "valor": "seguranca"},
            "c": {"label": "Planejar e organizar projetos", "valor": "gestao"}
        }
    },
    {
        "id": 2,
        "texto": "Qual atividade te chama mais atenção?",
        "opcoes": {
            "a": {"label": "Organizar dados e informações", "valor": "dados"},
            "b": {"label": "Automatizar tarefas e servidores", "valor": "cloud"},
            "c": {"label": "Criar inteligência artificial e robôs", "valor": "ia"}
        }
    },
    {
        "id": 3,
        "texto": "Como você prefere trabalhar em um projeto de software?",
        "opcoes": {
            "a": {"label": "Escrevendo códigos e criando funcionalidades", "valor": "programacao"},
            "b": {"label": "Planejando etapas e garantindo prazos", "valor": "gestao"},
            "c": {"label": "Analisando dados e descobrindo padrões", "valor": "analise_dados"}
        }
    },
    {
        "id": 4,
        "texto": "Qual dessas áreas você acha que será mais importante no futuro da tecnologia?",
        "opcoes": {
            "a": {"label": "Segurança de sistemas", "valor": "seguranca"},
            "b": {"label": "Desenvolvimento de novas soluções", "valor": "desenvolvimento"},
            "c": {"label": "Inteligência Artificial e automação", "valor": "ia"}
        }
    }
]

# --- Rotas ---


@app.route("/")
def index():
    session.clear()
    # Inicializa todas as skills com 0
    session["skills"] = {key: 0 for key in [
        "seguranca", "gestao", "ia", "cloud", "devops",
        "dados", "programacao", "analise_dados", "desenvolvimento"
    ]}
    session["fase_atual_jogo"] = 1
    return render_template("index.html")


@app.route("/game/<int:fase_id>")
def game(fase_id):
    if fase_id < 1 or fase_id > TOTAL_FASES_JOGO:
        return redirect(url_for("index"))
    session["fase_atual_jogo"] = fase_id
    return render_template("game.html", fase=fase_id)


@app.route("/quiz/<int:fase_quiz_id>", methods=["GET", "POST"])
def quiz(fase_quiz_id):
    if fase_quiz_id < 1 or fase_quiz_id > len(perguntas_quiz):
        return redirect(url_for("resultado"))

    # garante que a sessão skills existe
    if "skills" not in session:
        session["skills"] = {}

    if request.method == "POST":
        resposta = request.form.get("resposta")
        pergunta = perguntas_quiz[fase_quiz_id - 1]

        if resposta in pergunta["opcoes"]:
            area = pergunta["opcoes"][resposta]["valor"]
            session["skills"][area] = session["skills"].get(area, 0) + 1
            session.modified = True

        proxima_fase = fase_quiz_id + 1
        if proxima_fase <= TOTAL_FASES_JOGO:
            return redirect(url_for("game", fase_id=proxima_fase))
        else:
            return redirect(url_for("resultado"))

    pergunta_atual = perguntas_quiz[fase_quiz_id - 1]
    return render_template("quiz.html", pergunta=pergunta_atual, fase=fase_quiz_id)


@app.route("/resultado")
def resultado():
    skills = session.get("skills", {})
    if not skills:
        vocacao = "Jogue para descobrir sua vocação em Engenharia de Software!"
    else:
        maior_ponto = max(skills.values())
        principais = [k for k, v in skills.items() if v == maior_ponto]

        mapeamento_vocacao = {
            "desenvolvimento": "Desenvolvimento Fullstack e Mobile",
            "programacao": "Desenvolvimento Fullstack e Mobile",
            "gestao": "Gestão Ágil e Arquitetura de Software",
            "ia": "Inteligência Artificial: Redes Neurais, Visão Computacional e Robótica",
            "cloud": "Cloud Computing e IoT",
            "seguranca": "Segurança da Informação",
            "dados": "Data Science / Banco de Dados",
            "analise_dados": "Data Science / IA",
            "devops": "DevOps e Integração/Automação"
        }

        vocacao = mapeamento_vocacao.get(principais[0], "Explorador de Tecnologia")

    return render_template("resultado.html", vocacao=vocacao)

