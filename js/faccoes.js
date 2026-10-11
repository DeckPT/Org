import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCUx0QmBQvMHklMa9-lrxCVFlAIMlhRJj8",
    authDomain: "orgs-login.firebaseapp.com",
    projectId: "orgs-login",
    storageBucket: "orgs-login.firebasestorage.app",
    messagingSenderId: "321179116371",
    appId: "1:321179116371:web:7191bb684463a0478f786",
    measurementId: "G-WC46KFXQT7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const listaFaccoes = document.getElementById("listaFaccoes");
const pesquisaInput = document.getElementById("pesquisaFaccoes");
const botoesFiltro = document.querySelectorAll(".filtro");
const semResultados = document.getElementById("semResultados");

let faccoesArray = [];
let filtroAtual = "todas";

// Escutar alterações na coleção "faccoes" em tempo real
onSnapshot(collection(db, "faccoes"), (snapshot) => {
    faccoesArray = [];

    if (snapshot.empty) {
        listaFaccoes.innerHTML = "";
        if (semResultados) semResultados.style.display = "block";
        return;
    }

    snapshot.forEach((doc) => {
        faccoesArray.push({
            id: doc.id,
            dados: doc.data()
        });
    });

    renderizar();
});

// Função para renderizar as facções na página
function renderizar() {
    listaFaccoes.innerHTML = "";

    const termoPesquisa = pesquisaInput ? pesquisaInput.value.toLowerCase().trim() : "";

    const filtradas = faccoesArray.filter(item => {
        const nome = (item.dados.nome || item.id).toLowerCase();
        const estado = (item.dados.estado || "livre").toLowerCase();

        const batePesquisa = nome.includes(termoPesquisa);
        const bateFiltro = filtroAtual === "todas" || estado === filtroAtual;

        return batePesquisa && bateFiltro;
    });

    if (filtradas.length === 0) {
        if (semResultados) semResultados.style.display = "block";
        return;
    }

    if (semResultados) semResultados.style.display = "none";

    filtradas.forEach(item => {
        const dados = item.dados;
        const id = item.id;
        const nomeFaccao = dados.nome || id;
        const estado = (dados.estado || "livre").toLowerCase().trim();

        // Foto personalizada definida no admin, ou logoOrgs.png por defeito
        const fotoFaccao = (dados.imagem && dados.imagem.trim() !== "") ? dados.imagem : "img/logoOrgs.png";

        let classeEstado = "estado-livre";
        let textoEstado = "🟢 Livre";

        if (estado === "ocupada") {
            classeEstado = "estado-ocupada";
            textoEstado = "🔴 Ocupada";
        } else if (estado === "guerra") {
            classeEstado = "estado-guerra";
            textoEstado = "🟠 Em Guerra";
        }

        const card = document.createElement("a");
        card.href = `modelo.html?id=${id}`;
        card.className = "faccao-card";

        card.innerHTML = `
            <div class="faccao-logo">
                <img src="${fotoFaccao}" alt="${nomeFaccao}" onerror="this.src='img/logoOrgs.png'">
            </div>
            <div class="faccao-card-content">
                <h3>${nomeFaccao}</h3>
                <span class="estado ${classeEstado}">${textoEstado}</span>
            </div>
        `;

        listaFaccoes.appendChild(card);
    });
}

// Eventos dos Filtros
botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("active"));
        botao.classList.add("active");
        filtroAtual = botao.getAttribute("data-filtro");
        renderizar();
    });
});

// Evento do Campo de Pesquisa
if (pesquisaInput) {
    pesquisaInput.addEventListener("input", renderizar);
}