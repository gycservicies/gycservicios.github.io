



// ==========================================
// LÓGICA DE INTERACTIVIDAD Y FORMULARIO DE CLIENTES
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Desplazamiento suave para los enlaces del menú
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && targetId !== '') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 2. Animación de sombra en la barra de navegación al hacer scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('shadow-lg', 'bg-slate-900/95', 'backdrop-blur-md');
        } else {
            header.classList.remove('shadow-lg', 'bg-slate-900/95', 'backdrop-blur-md');
        }
    });

});

// 3. Función para registrar la solicitud del cliente y abrir WhatsApp
function registrarSolicitud(e) {
    e.preventDefault();

    const nuevoPedido = {
        id: Date.now(),
        nombre: document.getElementById('cliente-nombre').value.trim(),
        telefono: document.getElementById('cliente-telefono').value.trim(),
        equipo: document.getElementById('cliente-equipo').value,
        direccion: document.getElementById('cliente-direccion').value.trim(),
        referencia: document.getElementById('cliente-referencia').value.trim(),
        fecha: new Date().toLocaleString('es-PE'),
        estado: 'Pendiente'
    };

    let listaPedidos = JSON.parse(localStorage.getItem('pedidos_cg')) || [];
    listaPedidos.unshift(nuevoPedido);
    localStorage.setItem('pedidos_cg', JSON.stringify(listaPedidos));

    const numeroTaller = "51948090217";
    const textoMensaje = `*NUEVA SOLICITUD DE SERVICIO TÉCNICO*%0A%0A` +
        `👤 *Cliente:* ${nuevoPedido.nombre}%0A` +
        `📞 *Teléfono:* ${nuevoPedido.telefono}%0A` +
        `🛠️ *Equipo:* ${nuevoPedido.equipo}%0A` +
        `📍 *Dirección:* ${nuevoPedido.direccion}%0A` +
        `📝 *Referencia / Falla:* ${nuevoPedido.referencia}`;

    const urlWhatsApp = `https://wa.me/${numeroTaller}?text=${textoMensaje}`;

    document.getElementById('form-solicitud').reset();
    alert('¡Solicitud registrada con éxito! Te redirigiremos a WhatsApp para confirmar la llegada del técnico.');
    window.open(urlWhatsApp, '_blank');
}
   const btnWhatsapp = document.getElementById("btn-whatsapp");

if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", function(e) {
        // 1. Evitamos que abra el enlace de inmediato para que dé tiempo de guardar
        e.preventDefault();

        // 2. Crear el objeto de la orden con la estructura exacta de tu panel
        const nuevaOrden = {
            id: Date.now(),
            nombre: "Cliente (Botón Flotante)",
            telefono: "Chat Directo",
            equipo: "Visita a Domicilio",
            direccion: "No especificada (WhatsApp)",
            referencia: "Inició chat desde el botón flotante",
            fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
            estado: "Pendiente"
        };

        // 3. Obtener, guardar y asegurar en 'pedidos_cg'
        let ordenes = JSON.parse(localStorage.getItem('pedidos_cg')) || [];
        ordenes.push(nuevaOrden);
        localStorage.setItem('pedidos_cg', JSON.stringify(ordenes));

        let clics = JSON.parse(localStorage.getItem('whatsapp_clicks')) || [];
        clics.push({
            id: Date.now(),
            fecha: new Date().toLocaleDateString(),
            origen: "Botón Flotante"
        });
        localStorage.setItem('whatsapp_clicks', JSON.stringify(clics));        // 4. Redirigir a WhatsApp después de guardar los datos con éxito
        const urlWhatsApp = btnWhatsapp.getAttribute("href");
        window.open(urlWhatsApp, "_blank");
    });
}
