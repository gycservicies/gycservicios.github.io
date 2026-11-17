import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR5JMIZp3MueaHFh6HT14TGVc6Sbq2XWQ",
  authDomain: "cris-store-cloud.firebaseapp.com",
  projectId: "cris-store-cloud",
  storageBucket: "cris-store-cloud.firebasestorage.app",
  messagingSenderId: "129239220257",
  appId: "1:129239220257:web:2222488f620e9aa98ae360",
  measurementId: "G-P9RRQ0YRHB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PASS = "cris2026admin";

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cris_admin_auth') === 'true') {
        unlockAdminPanel();
    }
});

window.handleAdminLogin = function(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value;
    if (pass === ADMIN_PASS) {
        localStorage.setItem('cris_admin_auth', 'true');
        unlockAdminPanel();
        showToast("Acceso concedido al Panel de Administrador");
    } else {
        showToast("Contraseña incorrecta", "error");
    }
}

function unlockAdminPanel() {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    loadAdminData();
}

window.adminLogout = function() {
    localStorage.removeItem('cris_admin_auth');
    location.reload();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const borderCol = type === 'success' ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400';
    toast.className = `p-3.5 bg-[#0a0e14] border-l-4 ${borderCol} text-xs font-bold shadow-2xl flex items-center gap-2.5`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-triangle'}" class="w-4 h-4"></i> <span>${message}</span>`;
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => toast.remove(), 3500);
}

async function loadAdminData() {
    try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const tbody = document.getElementById('admin-items-table-body');
        let html = "";
        let count = 0;

        querySnapshot.forEach((docSnap) => {
            count++;
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <tr class="hover:bg-[#0e1522] transition">
                    <td class="p-3 flex items-center gap-2.5">
                        <img src="${item.image || ''}" class="w-8 h-8 object-contain bg-[#030508] border border-[#1e293b] p-0.5">
                        <span class="font-bold text-white truncate max-w-[150px]">${item.name}</span>
                    </td>
                    <td class="p-3 text-slate-300">${item.hero || '-'}</td>
                    <td class="p-3 font-bold text-[#ffc72c]">${item.rarity}</td>
                    <td class="p-3 font-mono-tech text-emerald-400 font-bold">S/ ${(item.price || 0).toFixed(2)}</td>
                    <td class="p-3 font-mono-tech">${item.stock}</td>
                    <td class="p-3 text-right space-x-2">
                        <button onclick="editItem('${id}', '${item.name.replace(/'/g, "\\'")}', '${item.hero.replace(/'/g, "\\'")}', '${item.rarity}', ${item.price}, ${item.stock}, '${item.image}')" class="text-amber-400 hover:underline font-bold">Editar</button>
                        <button onclick="deleteItem('${id}')" class="text-red-400 hover:underline font-bold">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        document.getElementById('admin-item-count').innerText = `${count} ítems`;

        const configSnap = await getDoc(doc(db, "config", "settings"));
        if (configSnap.exists()) {
            const s = configSnap.data();
            if (s.whatsapp) document.getElementById('config-whatsapp').value = s.whatsapp;
            if (s.yape) document.getElementById('config-yape').value = s.yape;
            if (s.bcp) document.getElementById('config-bcp').value = s.bcp;
        }
    } catch (err) {
        console.error("Error cargando datos admin:", err);
    }
}

window.handleSaveItem = async function(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('item-name').value.trim();
    const hero = document.getElementById('item-hero').value.trim();
    const rarity = document.getElementById('item-rarity').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const stock = parseInt(document.getElementById('item-stock').value);
    const image = document.getElementById('item-image').value.trim();

    const itemData = { name, hero, rarity, price, stock, image };

    try {
        if (editId) {
            await updateDoc(doc(db, "items", editId), itemData);
            showToast("Ítem actualizado correctamente");
        } else {
            await addDoc(collection(db, "items"), itemData);
            showToast("Ítem/Set agregado a Firebase con éxito");
        }
        resetItemForm();
        loadAdminData();
    } catch (err) {
        showToast("Error al guardar en Firestore", "error");
    }
}

window.editItem = function(id, name, hero, rarity, price, stock, image) {
    document.getElementById('edit-item-id').value = id;
    document.getElementById('item-name').value = name;
    document.getElementById('item-hero').value = hero;
    document.getElementById('item-rarity').value = rarity;
    document.getElementById('item-price').value = price;
    document.getElementById('item-stock').value = stock;
    document.getElementById('item-image').value = image;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.deleteItem = async function(id) {
    if (confirm("¿Estás seguro de eliminar este ítem de la base de datos?")) {
        try {
            await deleteDoc(doc(db, "items", id));
            showToast("Ítem eliminado");
            loadAdminData();
        } catch (e) {
            showToast("Error al eliminar", "error");
        }
    }
}

window.resetItemForm = function() {
    document.getElementById('edit-item-id').value = "";
    document.getElementById('item-name').value = "";
    document.getElementById('item-hero').value = "";
    document.getElementById('item-price').value = "";
    document.getElementById('item-stock').value = "1";
    document.getElementById('item-image').value = "";
}

window.handleUpdateUserBalance = async function(e) {
    e.preventDefault();
    const username = document.getElementById('target-username').value.trim();
    const balance = parseFloat(document.getElementById('target-balance').value);

    try {
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { username, balance, tradeUrl: "" });
        } else {
            await updateDoc(userRef, { balance });
        }
        showToast(`¡Saldo de @${username} actualizado a S/ ${balance.toFixed(2)}!`);
        document.getElementById('target-username').value = "";
        document.getElementById('target-balance').value = "";
    } catch (err) {
        showToast("Error actualizando saldo", "error");
    }
}

window.handleSaveSettings = async function(e) {
    e.preventDefault();
    const whatsapp = document.getElementById('config-whatsapp').value.trim();
    const yape = document.getElementById('config-yape').value.trim();
    const bcp = document.getElementById('config-bcp').value.trim();

    try {
        await setDoc(doc(db, "config", "settings"), { name: "CRIS STORE", whatsapp, yape, bcp }, { merge: true });
        showToast("Configuración guardada en la nube");
    } catch (err) {
        showToast("Error guardando config", "error");
    }
}