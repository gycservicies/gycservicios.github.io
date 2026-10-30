



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
function registrarVisitaWhatsApp() {
    // 1. Crear el objeto de la orden con la llave exacta que lee tu admin
    const nuevaOrden = {
        id: Date.now(),
        cliente: "Cliente Web (WhatsApp)",
        servicio: "Técnico a domicilio (Botón Flotante)",
        fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        estado: "Pendiente"
    };

    // 2. Obtener las órdenes actuales de localStorage o crear un arreglo vacío
    let ordenes = JSON.parse(localStorage.getItem('admin_orders')) || [];

    // 3. Agregar la nueva orden
    ordenes.push(nuevaOrden);

    // 4. Guardar en localStorage con la llave que lee el panel de administración
    localStorage.setItem('admin_orders', JSON.stringify(ordenes));

    // 5. Abrir el chat de WhatsApp en una nueva pestaña
    const numero = "51948090217"; // El número que ya tienes configurado
    const mensaje = encodeURIComponent("Hola, quisiera solicitar un técnico a domicilio");
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
} 
