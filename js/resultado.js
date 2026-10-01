// Mapeamento de Carreiras
const mapeamentoVocacao = {
    "desenvolvimento": "Desenvolvimento Fullstack e Mobile",
    "programacao": "Desenvolvimento Fullstack e Mobile",
    "gestao": "Gestão Ágil, Product Ownership e Liderança Técnica",
    "ia": "Inteligência Artificial, Redes Neurais e Machine Learning",
    "cloud": "Cloud Computing, DevOps e Computação em Nuvem",
    "seguranca": "Cibersegurança e Segurança da Informação",
    "dados": "Engenharia de Dados e Big Data",
    "analise_dados": "Ciência de Dados e Analytics",
    "devops": "DevOps, Integração Contínua (CI/CD) e Infraestrutura",
    "qa_testing": "Garantia de Qualidade (QA) e Testes de Software",
    "ux_ui": "Design de Experiência do Usuário (UX/UI Design)",
    "arquitetura": "Arquitetura de Software e Sistemas Distribuídos"
};

// Cálculo do Resultado
const skills = JSON.parse(localStorage.getItem("skills")) || {};
let vocacao = "Jogue para descobrir sua vocação em Engenharia de Software!";

const valores = Object.values(skills);
if (valores.length > 0) {
    const maiorPonto = Math.max(...valores);
    if (maiorPonto > 0) {
        const principais = Object.keys(skills).filter(k => skills[k] === maiorPonto);
        if (principais.length > 0 && mapeamentoVocacao[principais[0]]) {
            vocacao = mapeamentoVocacao[principais[0]];
        } else {
            vocacao = "Engenheiro(a) de Software Multidisciplinar";
        }
    }
}

// Exibe Resultado e Toca Som
const el = document.getElementById("vocacaoResultado");
if (el) {
    el.innerText = vocacao;
}

if (typeof audioManager !== "undefined") {
    audioManager.playVictorySound();
}
