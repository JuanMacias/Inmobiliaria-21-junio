let mapa;
let marcadores = [];
let infoWindowActual = null;
let propiedadesCargadas = [];

// ----------------------------------------------------
// DOM READY
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");

    if (formBusqueda) {
        formBusqueda.addEventListener("submit", (e) => {
            e.preventDefault();
            filtrarPropiedades();
        });
    }
});

// ----------------------------------------------------
// GOOGLE MAPS INIT
// ----------------------------------------------------
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

// ----------------------------------------------------
// CARGAR PROPIEDADES (NETBEANS + SQLITE)
// ----------------------------------------------------
function cargarPropiedades() {
    const ts = new Date().getTime(); 
    
    fetch(`propiedades.json?v=${ts}`) 
        .then(res => {
            if (!res.ok) throw new Error("Error al obtener propiedades");
            return res.json();
        })
        .then(data => {
            // ESTA ES LA LÍNEA CLAVE:
            propiedadesCargadas = data.propiedades || (Array.isArray(data) ? data : []); 

            renderizarPropiedades(propiedadesCargadas);

            if (mapa && propiedadesCargadas.length > 0) {
                crearMarcadoresEnMapa(propiedadesCargadas);
            }
        })
        .catch(err => {
            console.error("❌ Error:", err);
            const contenedor = document.querySelector(".propiedades-grid");
            if (contenedor) {
                contenedor.innerHTML = "<p>Error al cargar propiedades.</p>";
            }
        });
}

// ----------------------------------------------------
// RENDER LISTADO (TARJETAS DERECHA)
// ----------------------------------------------------
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

// ----------------------------------------------------
// CREAR TARJETA (CON HOVER HACIA EL MAPA)
// ----------------------------------------------------
function crearTarjetaPropiedad(prop) {
    const card = document.createElement("div");
    card.className = "propiedad-card";

    // Verificamos si hay imágenes válidas
    let foto = 'img/placeholder.jpg'; // Por defecto
    if (prop.imagenes && prop.imagenes.length > 0) {
        foto = prop.imagenes[0];
    } else if (prop.imagen) {
        foto = prop.imagen;
    }

    card.innerHTML = `
        <img src="${foto}" alt="${prop.titulo}" onerror="this.style.display='none'">
        <div class="card-info">
            <h3>${prop.titulo}</h3>
            <p>${prop.barrio || ''} - ${prop.operacion}</p>
            <p class="precio">USD ${prop.precio?.toLocaleString('es-AR') || '-'}</p>
            <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
        </div>
    `;
    // ... resto del código igual
    `;

    // ACTIVAR GLOBO AL PASAR EL MOUSE POR LA TARJETA
    card.addEventListener("mouseenter", () => {
        abrirInfoWindowEnMapa(prop.id);
    });

    // CERRAR GLOBO AL QUITAR EL MOUSE
    card.addEventListener("mouseleave", () => {
        if (infoWindowActual) infoWindowActual.close();
    });

    return card;
}

// ----------------------------------------------------
// MAPA MARKERS (Pines Rojos)
// ----------------------------------------------------
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

        // Guardamos el ID en el marcador para vincularlo con la lista
        marcador.idPropiedad = prop.id; 

        // Abrir globo al pasar el mouse por el PIN
        marcador.addListener("mouseover", () => {
            abrirInfoWindowEnMapa(prop.id);
        });

        // Cerrar globo al sacar el mouse del PIN
        marcador.addListener("mouseout", () => {
            if (infoWindowActual) infoWindowActual.close();
        });

        // Click para ir directo al detalle
        marcador.addListener("click", () => {
            window.location.href = `detalle.html?id=${prop.id}`;
        });

        marcadores.push(marcador);
    });
}

// ----------------------------------------------------
// DISEÑO DEL GLOBO (INFO WINDOW)
// ----------------------------------------------------
function crearContenidoInfoWindow(prop) {
    // 1. Calculamos la foto (Corregido)
    let foto;
    if (Array.isArray(prop.imagenes) && prop.imagenes.length > 0) {
        foto = prop.imagenes[0];
    } else if (typeof prop.imagenes === 'string' && prop.imagenes.length > 0) {
        foto = prop.imagenes.split(',')[0].trim(); 
    } else {
        foto = prop.imagen || 'img/placeholder.jpg';
    }
    
    return `
        <div class="info-window-contenido" style="width: 200px; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px;">${prop.titulo}</h4>
            <div style="text-align:center; border-radius: 5px; overflow: hidden; height: 110px;">
                <img src="${foto}" 
                     onerror="this.src='img/placeholder.jpg'" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="margin-top: 8px;">
                <p style="margin: 0; font-weight: bold; color: #d9534f;">U$S ${prop.precio?.toLocaleString('es-AR')}</p>
                <p style="margin: 2px 0; font-size: 11px; color: #666;">${prop.barrio || ''}</p>
                <a href="detalle.html?id=${prop.id}" style="display: block; text-align: center; background: #007bff; color: white; padding: 5px; border-radius: 4px; text-decoration: none; font-size: 11px; margin-top: 5px;">Ver detalles</a>
            </div>
        </div>
    `;
}
// ----------------------------------------------------
// FUNCIÓN PARA ABRIR GLOBO DESDE CUALQUIER LADO
// ----------------------------------------------------
function abrirInfoWindowEnMapa(id) {
    const marcador = marcadores.find(m => m.idPropiedad === id);
    const prop = propiedadesCargadas.find(p => p.id === id);
    
    if (marcador && prop) {
        if (infoWindowActual) infoWindowActual.close();

        infoWindowActual = new google.maps.InfoWindow({
            content: crearContenidoInfoWindow(prop)
        });

        infoWindowActual.open(mapa, marcador);
        
        // El mapa se mueve suavemente hacia la propiedad
        mapa.panTo(marcador.getPosition());
    }
}

// ----------------------------------------------------
// FILTROS
// ----------------------------------------------------
function filtrarPropiedades() {
    // 1. Capturamos los valores del formulario
    const barrioBusqueda = document.getElementById("filtro-barrio")?.value.toLowerCase() || "";
    const tipoBusqueda = document.getElementById("filtro-tipo")?.value.toLowerCase() || "";
    const operacionBusqueda = document.getElementById("filtro-operacion")?.value.toLowerCase() || "";
    const ambientesBusqueda = document.getElementById("filtro-ambientes")?.value || "";

    // Función interna para quitar tildes y dejar todo igual (ej: "Nuñez" -> "nunez")
    const limpiarTexto = (texto) => 
        texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("_", " ") || "";

    const filtradas = propiedadesCargadas.filter(p => {
        // Limpiamos los datos del JSON y de la búsqueda para comparar peras con peras
        const barrioJSON = limpiarTexto(p.barrio);
        const barrioFiltro = limpiarTexto(barrioBusqueda);
        
        const tipoJSON = limpiarTexto(p.tipo);
        const tipoFiltro = limpiarTexto(tipoBusqueda);

        const operacionJSON = limpiarTexto(p.operacion);
        const operacionFiltro = limpiarTexto(operacionBusqueda);

        // Lógica de coincidencia
        const coincideBarrio = !barrioFiltro || barrioJSON.includes(barrioFiltro);
        const coincideTipo = !tipoFiltro || tipoJSON.includes(tipoFiltro);
        const coincideOperacion = !operacionFiltro || operacionJSON.includes(operacionFiltro);
        const coincideAmbientes = !ambientesBusqueda || String(p.ambientes) === ambientesBusqueda;

        return coincideBarrio && coincideTipo && coincideOperacion && coincideAmbientes;
    });

    renderizarPropiedades(filtradas);
    if (mapa) crearMarcadoresEnMapa(filtradas);
}

// ----------------------------------------------------
// CALLBACK GLOBAL
// ----------------------------------------------------
window.initMap = initMap;