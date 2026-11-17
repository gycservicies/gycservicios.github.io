import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let allItems = [];
let currentCategory = 'ALL';
let currentUser = localStorage.getItem('cris_store_user') || null;
let storeWhatsApp = "51999999999";

window.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    await loadStoreSettings();
    await loadItems();
    await checkUserSession();
});

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

window.scrollToMarket = function() {
    document.getElementById('market-section').scrollIntoView({ behavior: 'smooth' });
}

async function loadStoreSettings() {
    try {
        const configSnap = await getDoc(doc(db, "config", "settings"));
        if (configSnap.exists()) {
            const s = configSnap.data();
            if (s.whatsapp) storeWhatsApp = s.whatsapp;
            if (document.getElementById('store-title')) document.getElementById('store-title').innerText = s.name || "CRIS STORE";
            if (document.getElementById('footer-store-name')) document.getElementById('footer-store-name').innerText = s.name || "CRIS STORE";
            if (document.getElementById('payment-yape')) document.getElementById('payment-yape').innerText = s.yape || "+51 999 999 999";
            if (document.getElementById('payment-bcp')) document.getElementById('payment-bcp').innerText = s.bcp || "193-xxx-xxx";
            if (document.getElementById('nav-whatsapp-btn')) document.getElementById('nav-whatsapp-btn').href = `https://wa.me/${storeWhatsApp}`;
            if (document.getElementById('footer-wa-link')) document.getElementById('footer-wa-link').href = `https://wa.me/${storeWhatsApp}`;
        }
    } catch (e) {
        console.error("Error cargando config:", e);
    }
}

async function loadItems() {
    try {
        const querySnapshot = await getDocs(collection(db, "items"));
        allItems = [];
        querySnapshot.forEach((docSnap) => {
            allItems.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderItems(allItems);
        renderLiveTicker(allItems);
    } catch (err) {
        console.error("Error cargando ítems:", err);
    }
}

function renderLiveTicker(items) {
    const tickerEl = document.getElementById('live-ticker-grid');
    if (!tickerEl) return;
    if (items.length === 0) {
        tickerEl.innerHTML = `<span class="text-xs text-slate-500 font-mono-tech">No hay ítems en la base de datos.</span>`;
        return;
    }

    let html = "";
    items.slice(0, 12).forEach(item => {
        let dotColor = "bg-slate-400";
        if (item.rarity === 'Arcana') dotColor = "bg-red-500";
        else if (item.rarity === 'Immortal') dotColor = "bg-amber-400";
        else if (item.rarity === 'Mythical') dotColor = "bg-purple-500";
        else if (item.rarity === 'Rare') dotColor = "bg-blue-500";

        html += `
            <div onclick="scrollToMarket()" class="ticker-card flex items-center gap-2.5 px-3 py-1.5 cursor-pointer flex-shrink-0">
                <div class="w-8 h-8 bg-[#05070a] border border-[#1e293b] flex items-center justify-center p-1">
                    <img src="${item.image || ''}" alt="${item.name}" class="max-h-full object-contain">
                </div>
                <div>
                    <div class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                        <span class="font-bold text-white text-[11px] truncate max-w-[110px]">${item.name}</span>
                    </div>
                    <div class="text-[10px] text-emerald-400 font-mono-tech font-bold">S/ ${(item.price || 0).toFixed(2)}</div>
                </div>
            </div>
        `;
    });
    tickerEl.innerHTML = html;
}

function renderItems(items) {
    const grid = document.getElementById('items-grid');
    const countEl = document.getElementById('item-count');
    if (!grid) return;

    if (countEl) countEl.innerText = `${items.length} ÍTEMS DISPONIBLES`;

    if (items.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-14 bg-[#0a0e14] border border-[#1e293b] text-slate-400 text-xs font-semibold">No se encontraron ítems en esta categoría.</div>`;
        return;
    }

    let html = "";
    items.forEach(item => {
        let cardRarityClass = "card-common";
        let badgeStyle = "text-slate-300 border-slate-600 bg-slate-800/40";
        let rarityLabel = item.rarity || "Common";

        if (item.rarity === 'Arcana') { cardRarityClass = "card-arcana"; badgeStyle = "text-red-400 border-red-500/40 bg-red-500/10"; }
        else if (item.rarity === 'Immortal') { cardRarityClass = "card-immortal"; badgeStyle = "text-amber-400 border-amber-500/40 bg-amber-500/10"; }
        else if (item.rarity === 'Mythical') { cardRarityClass = "card-mythical"; badgeStyle = "text-purple-400 border-purple-500/40 bg-purple-500/10"; }
        else if (item.rarity === 'Rare') { cardRarityClass = "card-rare"; badgeStyle = "text-blue-400 border-blue-500/40 bg-blue-500/10"; }

        const outOfStock = (item.stock || 0) <= 0;

        html += `
            <div class="dota-item-card p-3.5 ${cardRarityClass}">
                <div>
                    <div class="relative bg-[#05070a] border border-[#1a2332] h-36 flex items-center justify-center p-3 mb-3 overflow-hidden">
                        <span class="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${badgeStyle}">${rarityLabel}</span>
                        <span class="absolute bottom-2 right-2 text-[10px] font-mono-tech text-slate-400 bg-black/80 px-1.5 py-0.5">Stock: ${item.stock || 0}</span>
                        <img src="${item.image || ''}" alt="${item.name}" class="max-h-28 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                    </div>
                    <div class="text-[10px] font-black uppercase tracking-widest text-[#ffc72c]/90 mb-0.5">${item.hero || 'Dota 2'}</div>
                    <h4 class="font-bold text-white text-sm leading-snug line-clamp-1 mb-3">${item.name}</h4>
                </div>
                <div class="pt-2.5 border-t border-[#1a2332]">
                    <div class="flex items-center justify-between mb-2.5">
                        <span class="text-[10px] uppercase font-bold text-slate-500">Precio</span>
                        <span class="text-base font-black text-emerald-400 font-mono-tech">S/ ${(item.price || 0).toFixed(2)}</span>
                    </div>
                    <button onclick="buyItem('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price || 0}, ${item.stock || 0})" ${outOfStock ? 'disabled' : ''} class="${outOfStock ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'btn-dota-buy'} w-full py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                        <i data-lucide="${outOfStock ? 'ban' : 'shopping-cart'}" class="w-3.5 h-3.5"></i> ${outOfStock ? 'Agotado' : 'Adquirir Ítem'}
                    </button>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.setCategory = function(cat, btnElement) {
    currentCategory = cat;
    document.querySelectorAll('.rarity-filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    filterItems();
}

window.filterByQuickRarity = function(rarity) {
    currentCategory = rarity;
    document.querySelectorAll('.rarity-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(rarity.toLowerCase().slice(0, 4))) {
            btn.classList.add('active');
        }
    });
    filterItems();
    scrollToMarket();
}

window.filterItems = function() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const sort = document.getElementById('sort-select').value;

    let filtered = allItems.filter(item => {
        const matchesCat = (currentCategory === 'ALL' || (item.rarity && item.rarity.toLowerCase() === currentCategory.toLowerCase()));
        const matchesSearch = ((item.name && item.name.toLowerCase().includes(search)) || (item.hero && item.hero.toLowerCase().includes(search)));
        return matchesCat && matchesSearch;
    });

    if (sort === 'expensive') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'cheap') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'name') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    renderItems(filtered);
}

window.handleAuth = async function(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const tradeUrl = document.getElementById('auth-tradeurl').value.trim();
    if (!username || !tradeUrl) return showToast("Completa tu Nick y Trade URL", "error");

    try {
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { username, tradeUrl, balance: 0.00 });
        } else {
            await updateDoc(userRef, { tradeUrl });
        }
        localStorage.setItem('cris_store_user', username);
        currentUser = username;
        closeModal('auth-modal');
        await checkUserSession();
        showToast(`¡Conectado como @${username}!`);
    } catch (err) {
        showToast("Error al conectar con la base de datos", "error");
    }
}

async function checkUserSession() {
    if (!currentUser) return;
    try {
        const userRef = doc(db, "users", currentUser);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            document.getElementById('auth-guest').classList.add('hidden');
            document.getElementById('auth-user').classList.remove('hidden');
            document.getElementById('auth-user').classList.add('flex');
            document.getElementById('current-username').innerText = data.username;
            document.getElementById('current-balance').innerText = `S/ ${(data.balance || 0).toFixed(2)}`;
        } else {
            logout();
        }
    } catch (e) {
        console.error(e);
    }
}

window.logout = function() {
    localStorage.removeItem('cris_store_user');
    currentUser = null;
    document.getElementById('auth-user').classList.add('hidden');
    document.getElementById('auth-guest').classList.remove('hidden');
    showToast("Sesión cerrada", "error");
}

window.buyItem = async function(itemId, itemName, price, stock) {
    if (!currentUser) {
        showToast("Debes vincular tu cuenta Steam primero", "error");
        openModal('auth-modal');
        return;
    }
    if (stock <= 0) return showToast("Ítem agotado en stock", "error");

    const userRef = doc(db, "users", currentUser);
    const userSnap = await getDoc(userRef);
    const balance = userSnap.data().balance || 0;
    const tradeUrl = userSnap.data().tradeUrl || "";

    if (balance < price) {
        showToast("Saldo insuficiente en tu Wallet. Recarga saldo.", "error");
        openModal('recharge-modal');
        return;
    }

    if (confirm(`¿Confirmas la compra de "${itemName}" por S/ ${price.toFixed(2)}?`)) {
        try {
            await updateDoc(userRef, { balance: balance - price });
            await addDoc(collection(db, "orders"), {
                username: currentUser, itemName, price, tradeUrl, status: 'Pendiente', date: new Date().toLocaleString()
            });
            const itemRef = doc(db, "items", itemId);
            const itemSnap = await getDoc(itemRef);
            if (itemSnap.exists()) {
                await updateDoc(itemRef, { stock: Math.max(0, (itemSnap.data().stock || 1) - 1) });
            }
            await loadItems();
            await checkUserSession();
            showToast("¡Compra exitosa! Pedido enviado a la cola del bot.");
        } catch (err) {
            showToast("Error al procesar la compra en Firestore", "error");
        }
    }
}

window.sendRechargeWhatsApp = function() {
    const amount = document.getElementById('recharge-amount').value;
    if (!currentUser) {
        showToast("Vincula tu cuenta primero", "error");
        openModal('auth-modal');
        return;
    }
    const message = `Hola Cris Store, soy el usuario *@${currentUser}*. Deseo recargar *S/ ${amount}* en mi cuenta. Adjunto mi comprobante.`;
    window.open(`https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
}

window.openModal = function(id) { document.getElementById(id).classList.remove('hidden'); }
window.closeModal = function(id) { document.getElementById(id).classList.add('hidden'); }