import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdZofJKPJWAG9uTdFdJa1-kMdx8OvEDzw",
  authDomain: "appfinancas-61acf.firebaseapp.com",
  projectId: "appfinancas-61acf",
  storageBucket: "appfinancas-61acf.firebasestorage.app",
  messagingSenderId: "795334066065",
  appId: "1:795334066065:web:e5278384af43f18e892430"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- AUTENTICAÇÃO GMAIL ---
window.handleCredentialResponse = function(response) {
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const googleUser = JSON.parse(jsonPayload);
    const email = googleUser.email.toLowerCase();

    if (email !== 'silascarlossilva@gmail.com') {
      alert('Acesso negado.');
      return;
    }

    localStorage.setItem('appFinancas.user', JSON.stringify({ email: email }));
    checarSessao();
  } catch(e) {
    alert('Erro no login.');
  }
};

window.FazerLogout = function() {
  localStorage.removeItem('appFinancas.user');
  checarSessao();
};

function checarSessao() {
  const user = localStorage.getItem('appFinancas.user');
  const login = document.getElementById('tela-login');
  const conteudo = document.getElementById('app-conteudo');
  const display = document.getElementById('user-email');

  if (user) {
    if(login) login.classList.add('hidden');
    if(conteudo) conteudo.classList.remove('hidden');
    if(display) display.innerText = JSON.parse(user).email;
  } else {
    if(login) login.classList.remove('hidden');
    if(conteudo) conteudo.classList.add('hidden');
  }
}

window.addEventListener('DOMContentLoaded', checarSessao);

// --- ABAS ---
window.mudarAba = function(aba) {
    ['dashboard', 'receitas', 'despesas', 'investimentos'].forEach(a => {
        document.getElementById(`aba-${a}`).classList.add('hidden');
    });
    document.getElementById(`aba-${aba}`).classList.remove('hidden');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    event.currentTarget.classList.add('on');
};

let tRec = 0, tDesp = 0;
function atualizarResumo() {
    const saldo = tRec - tDesp;
    document.getElementById('total-receitas').innerText = `R$ ${tRec.toFixed(2)}`;
    document.getElementById('total-despesas').innerText = `R$ ${tDesp.toFixed(2)}`;
    document.getElementById('total-saldo').innerText = `R$ ${saldo.toFixed(2)}`;
}

// --- RECEITAS (FIREBASE) ---
const formReceita = document.getElementById('form-receita');
if(formReceita) {
  formReceita.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addDoc(collection(db, "receitas"), {
          origem: document.getElementById('rec-origem').value,
          valor: parseFloat(document.getElementById('rec-valor').value),
          data: document.getElementById('rec-data').value
      });
      formReceita.reset();
      alert('Receita salva com sucesso!');
  });
}

onSnapshot(collection(db, "receitas"), (snapshot) => {
    const lista = document.getElementById('lista-receitas');
    if(!lista) return;
    lista.innerHTML = '';
    tRec = 0;
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        tRec += item.valor || 0;
        lista.innerHTML += `
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <div><b>${item.origem}</b><br><small class="text-slate-400">${item.data}</small></div>
                <div class="text-emerald-600 font-bold">+ R$ ${(item.valor || 0).toFixed(2)}</div>
                <button onclick="deletarItem('receitas', '${docSnap.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
    atualizarResumo();
});

// --- DESPESAS (FIREBASE) ---
const formDespesa = document.getElementById('form-despesa');
if(formDespesa) {
  formDespesa.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addDoc(collection(db, "despesas"), {
          detalhe: document.getElementById('desp-detalhe').value,
          valor: parseFloat(document.getElementById('desp-valor').value),
          data: document.getElementById('desp-data').value
      });
      formDespesa.reset();
      alert('Despesa salva com sucesso!');
  });
}

onSnapshot(collection(db, "despesas"), (snapshot) => {
    const lista = document.getElementById('lista-despesas');
    if(!lista) return;
    lista.innerHTML = '';
    tDesp = 0;
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        tDesp += item.valor || 0;
        lista.innerHTML += `
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <div><b>${item.detalhe}</b><br><small class="text-slate-400">${item.data}</small></div>
                <div class="text-rose-600 font-bold">- R$ ${(item.valor || 0).toFixed(2)}</div>
                <button onclick="deletarItem('despesas', '${docSnap.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
    atualizarResumo();
});

// --- INVESTIMENTOS (FIREBASE) ---
const formInvestimento = document.getElementById('form-investimento');
if(formInvestimento) {
  formInvestimento.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addDoc(collection(db, "investimentos"), {
          tipo: document.getElementById('inv-tipo').value,
          valor: parseFloat(document.getElementById('inv-valor').value),
          data: document.getElementById('inv-data').value
      });
      formInvestimento.reset();
      alert('Investimento salvo com sucesso!');
  });
}

onSnapshot(collection(db, "investimentos"), (snapshot) => {
    const lista = document.getElementById('lista-investimentos');
    if(!lista) return;
    lista.innerHTML = '';
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        lista.innerHTML += `
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <div><b>${item.tipo}</b><br><small class="text-slate-400">${item.data}</small></div>
                <div class="text-blue-600 font-bold">R$ ${(item.valor || 0).toFixed(2)}</div>
                <button onclick="deletarItem('investimentos', '${docSnap.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
});

window.deletarItem = async function(colecao, id) {
    if(confirm("Deseja realmente excluir este item?")) {
        await deleteDoc(doc(db, colecao, id));
    }
}
