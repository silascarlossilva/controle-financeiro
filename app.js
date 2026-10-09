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
      alert('Acesso negado. E-mail não autorizado.');
      return;
    }

    localStorage.setItem('appFinancas.user', JSON.stringify({ email: email }));
    checarSessao();
  } catch(e) {
    alert('Erro ao autenticar.');
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

// --- CONTROLE DE ABAS ---
window.mudarAba = function(aba) {
    ['dashboard', 'receitas', 'despesas', 'investimentos'].forEach(a => {
        const el = document.getElementById(`aba-${a}`);
        if(el) el.classList.add('hidden');
    });
    const alvo = document.getElementById(`aba-${aba}`);
    if(alvo) alvo.classList.remove('hidden');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    if(event && event.currentTarget) event.currentTarget.classList.add('on');
};

let tRec = 0, tDesp = 0;
function atualizarResumo() {
    const saldo = tRec - tDesp;
    const elRec = document.getElementById('total-receitas');
    const elDesp = document.getElementById('total-despesas');
    const elSaldo = document.getElementById('total-saldo');

    if(elRec) elRec.innerText = `R$ ${tRec.toFixed(2)}`;
    if(elDesp) elDesp.innerText = `R$ ${tDesp.toFixed(2)}`;
    if(elSaldo) elSaldo.innerText = `R$ ${saldo.toFixed(2)}`;
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
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#F4F2F8; border-radius:12px; border:1px solid #E8E4F0; font-size:14px;">
                <div><b>${item.origem}</b><br><small style="color:#6A6480;">${item.data}</small></div>
                <div style="color:#0F7A57; font-weight:bold;">+ R$ ${(item.valor || 0).toFixed(2)}</div>
                <button onclick="deletarItem('receitas', '${docSnap.id}')" style="background:none; border:0; color:#D12F58; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
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
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#F4F2F8; border-radius:12px; border:1px solid #E8E4F0; font-size:14px;">
                <div><b>${item.detalhe}</b><br><small style="color:#6A6480;">${item.data}</small></div>
                <div style="color:#D12F58; font-weight:bold;">- R$ ${(item.valor || 0).toFixed(2)}</div>
                <button onclick="deletarItem('despesas', '${docSnap.id}')" style="background:none; border:0; color:#D12F58; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
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
  });
}

onSnapshot(collection(db, "investimentos"), (snapshot) => {
    const lista = document.getElementById('lista-investimentos');
    if(!lista) return;
    lista.innerHTML = '';
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        lista.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#F4F2F8; border-radius:12px; border:1px solid #E8E4F0; font-size:14px;">
                <div><b>${item.tipo}</b><br><small style="color:#6A6480;">${item.data}</small></div>
                <div style="color:#2F6FED; font-weight:bold;">R$ ${(item.valor || 0).toFixed(2)}</div>
                <button onclick="deletarItem('investimentos', '${docSnap.id}')" style="background:none; border:0; color:#D12F58; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
});

window.deletarItem = async function(colecao, id) {
    if(confirm("Deseja realmente excluir este item?")) {
        await deleteDoc(doc(db, colecao, id));
    }
}
