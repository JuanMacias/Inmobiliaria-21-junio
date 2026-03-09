let mapa;
let marcadores = [];
let infoWindowActual = null;
let propiedadesCargadas = [];

document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");
    if (formBusqueda) {
        formBusqueda.addEventListener("submit", (e) => {
            e.preventDefault();
            filtrarPropiedades();
        });
    }
});

function initMap() {
    const ubicacionInicial = { lat: -34.5997, lng: -58.4208 };
    const mapaDiv = document.getElementById("mapa-propiedades-dinamico");

    if (mapaDiv) {
        mapa = new google.maps.Map(mapaDiv, {
            zoom: 12,
            center: ubicacionInicial,
            scrollwheel: false
        });
    }
    cargarPropiedades();
}

function cargarPropiedades() {
    const ts = new Date().getTime(); 
    fetch(`propiedades.json?v=${ts}`) 
        .then(res => {
            if (!res.ok) throw new Error("Error al obtener propiedades");
            return res.json();
        })
        .then(data => {
            propiedadesCargadas = data.propiedades || (Array.isArray(data) ? data : []); 
            renderizarPropiedades(propiedadesCargadas);

            if (mapa && propiedadesCargadas.length > 0) {
                crearMarcadoresEnMapa(propiedadesCargadas);
            }
            
            // --- IMPORTANTE: ACTIVAR EL SCROLL ---
            setTimeout(inicializarSincronizacionScroll, 500);
        })
        .catch(err => {
            console.error("❌ Error:", err);
        });
}

function renderizarPropiedades(lista) {
    const contenedor = document.querySelector(".propiedades-grid");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    if (!Array.isArray(lista) || lista.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron propiedades.</p>";
        return;
    }
    lista.forEach(prop => {
        contenedor.appendChild(crearTarjetaPropiedad(prop));
    });
}

function crearTarjetaPropiedad(prop) {
    const card = document.createElement("div");
    card.className = "propiedad-card";
    card.setAttribute("data-id", prop.id); // Identificador para el scroll

    const foto = (prop.imagenes && prop.imagenes.length > 0) 
                  ? prop.imagenes[0] 
                  : (prop.imagen ? prop.imagen : 'img/placeholder.jpg');

    card.innerHTML = `
        <img src="${foto}" alt="${prop.titulo}">
        <div class="card-info">
            <h3>${prop.titulo}</h3>
            <p>${prop.barrio || ''} - ${prop.operacion}</p>
            <p class="precio">USD ${prop.precio?.toLocaleString('es-AR') || '-'}</p>
            <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
        </div>
    `;

    card.addEventListener("mouseenter", () => abrirInfoWindowEnMapa(prop.id));
    card.addEventListener("mouseleave", () => { if (infoWindowActual) infoWindowActual.close(); });

    return card;
}

function crearMarcadoresEnMapa(propiedades) {
    marcadores.forEach(m => m.setMap(null));
    marcadores = [];

    propiedades.forEach(prop => {
        if (!prop.lat || !prop.lng) return;
        const marcador = new google.maps.Marker({
            position: { lat: prop.lat, lng: prop.lng },
            map: mapa,
            title: prop.titulo
        });
        marcador.idPropiedad = prop.id; 
        marcador.addListener("mouseover", () => abrirInfoWindowEnMapa(prop.id));
        marcador.addListener("mouseout", () => { if (infoWindowActual) infoWindowActual.close(); });
        marcador.addListener("click", () => { window.location.href = `detalle.html?id=${prop.id}`; });
        marcadores.push(marcador);
    });
}

function abrirInfoWindowEnMapa(id) {
    const marcador = marcadores.find(m => m.idPropiedad === id);
    const prop = propiedadesCargadas.find(p => p.id === id);
    
    if (marcador && prop) {
        if (infoWindowActual) infoWindowActual.close();
        infoWindowActual = new google.maps.InfoWindow({
            content: crearContenidoInfoWindow(prop)
        });
        infoWindowActual.open(mapa, marcador);
        mapa.panTo(marcador.getPosition());
    }
}

function crearContenidoInfoWindow(prop) {
    let foto = (Array.isArray(prop.imagenes) && prop.imagenes.length > 0) ? prop.imagenes[0] : (prop.imagen || 'img/placeholder.jpg');
    return `
        <div class="info-window-contenido" style="width: 200px; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 8px 0;">${prop.titulo}</h4>
            <div style="height: 110px; overflow: hidden;"><img src="${foto}" style="width: 100%; object-fit: cover;"></div>
            <p style="font-weight: bold; color: #d9534f;">U$S ${prop.precio?.toLocaleString('es-AR')}</p>
            <a href="detalle.html?id=${prop.id}" style="display: block; text-align: center; background: #007bff; color: white; padding: 5px; border-radius: 4px; text-decoration: none;">Ver detalles</a>
        </div>`;
}

function filtrarPropiedades() {
    const barrioBusqueda = document.getElementById("filtro-barrio")?.value.toLowerCase() || "";
    const tipoBusqueda = document.getElementById("filtro-tipo")?.value.toLowerCase() || "";
    const operacionBusqueda = document.getElementById("filtro-operacion")?.value.toLowerCase() || "";
    const ambientesBusqueda = document.getElementById("filtro-ambientes")?.value || "";

    const limpiarTexto = (texto) => texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("_", " ") || "";

    const filtradas = propiedadesCargadas.filter(p => {
        const coincideBarrio = !barrioBusqueda || limpiarTexto(p.barrio).includes(limpiarTexto(barrioBusqueda));
        const coincideTipo = !tipoBusqueda || limpiarTexto(p.tipo).includes(limpiarTexto(tipoBusqueda));
        const coincideOperacion = !operacionBusqueda || limpiarTexto(p.operacion).includes(limpiarTexto(operacionBusqueda));
        const coincideAmbientes = !ambientesBusqueda || String(p.ambientes) === ambientesBusqueda;
        return coincideBarrio && coincideTipo && coincideOperacion && coincideAmbientes;
    });

    renderizarPropiedades(filtradas);
    if (mapa) crearMarcadoresEnMapa(filtradas);
    
    // Volver a activar el observador para los nuevos resultados
    setTimeout(inicializarSincronizacionScroll, 500);
}

function inicializarSincronizacionScroll() {
    const contenedorScroll = document.querySelector(".lista-y-streetview");
    if (!contenedorScroll) return;

    const opciones = {
        root: contenedorScroll,
        threshold: 0.6 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idPropiedad = entry.target.getAttribute("data-id");
                abrirInfoWindowEnMapa(idPropiedad);
            }
        });
    }, opciones);

    document.querySelectorAll(".propiedad-card").forEach(tarjeta => {
        observer.observe(tarjeta);
    });
}

window.initMap = initMap;