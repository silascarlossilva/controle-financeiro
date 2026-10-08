// Importe os SDKs do Firebase necessários
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Substitua com as configurações do seu projeto Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Controle de Abas na Tela
window.mudarAba = function(aba) {
    document.getElementById('aba-dashboard').classList.add('hidden');
    document.getElementById('aba-receitas').classList.add('hidden');
    document.getElementById('aba-despesas').classList.add('hidden');
    document.getElementById('aba-investimentos').classList.add('hidden');
    
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
}

// Variáveis para cálculo do resumo
let totalRec = 0;
let totalDesp = 0;

function atualizarResumo() {
    const saldo = totalRec - totalDesp;
    document.getElementById('total-receitas').innerText = `R$ ${totalRec.toFixed(2)}`;
    document.getElementById('total-despesas').innerText = `R$ ${totalDesp.toFixed(2)}`;
    
    const elSaldo = document.getElementById('total-saldo');
    elSaldo.innerText = `R$ ${saldo.toFixed(2)}`;
    elSaldo.className = `text-2xl font-bold ${saldo >= 0 ? 'text-blue-800' : 'text-rose-600'}`;
}

// --- RECEITAS ---
const formReceita = document.getElementById('form-receita');
formReceita.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "receitas"), {
        origem: document.getElementById('rec-origem').value,
        valor: parseFloat(document.getElementById('rec-valor').value),
        data: document.getElementById('rec-data').value
    });
    formReceita.reset();
});

// Ouvir dados em tempo real do Firebase (Receitas)
onSnapshot(collection(db, "receitas"), (snapshot) => {
    const lista = document.getElementById('lista-receitas');
    lista.innerHTML = '';
    totalRec = 0;
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        totalRec += item.valor;
        lista.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3">${item.data}</td>
                <td class="p-3">${item.origem}</td>
                <td class="p-3 text-emerald-600 font-semibold">R$ ${item.valor.toFixed(2)}</td>
                <td class="p-3 text-center"><button onclick="deletarRegistro('receitas', '${docSnap.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
    atualizarResumo();
});

// --- DESPESAS ---
const formDespesa = document.getElementById('form-despesa');
formDespesa.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "despesas"), {
        detalhe: document.getElementById('desp-detalhe').value,
        valor: parseFloat(document.getElementById('desp-valor').value),
        data: document.getElementById('desp-data').value
    });
    formDespesa.reset();
});

onSnapshot(collection(db, "despesas"), (snapshot) => {
    const lista = document.getElementById('lista-despesas');
    lista.innerHTML = '';
    totalDesp = 0;
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        totalDesp += item.valor;
        lista.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3">${item.data}</td>
                <td class="p-3">${item.detalhe}</td>
                <td class="p-3 text-rose-600 font-semibold">R$ ${item.valor.toFixed(2)}</td>
                <td class="p-3 text-center"><button onclick="deletarRegistro('despesas', '${docSnap.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
    atualizarResumo();
});

// --- INVESTIMENTOS ---
const formInvestimento = document.getElementById('form-investimento');
formInvestimento.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "investimentos"), {
        tipo: document.getElementById('inv-tipo').value,
        valor: parseFloat(document.getElementById('inv-valor').value),
        data: document.getElementById('inv-data').value
    });
    formInvestimento.reset();
});

onSnapshot(collection(db, "investimentos"), (snapshot) => {
    const lista = document.getElementById('lista-investimentos');
    lista.innerHTML = '';
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        lista.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3">${item.data}</td>
                <td class="p-3">${item.tipo}</td>
                <td class="p-3 text-blue-600 font-semibold">R$ ${item.valor.toFixed(2)}</td>
                <td class="p-3 text-center"><button onclick="deletarRegistro('investimentos', '${docSnap.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
});

// Função global para excluir registros
window.deletarRegistro = async function(colecao, id) {
    if(confirm("Deseja realmente excluir este item?")) {
        await deleteDoc(doc(db, colecao, id));
    }
}
