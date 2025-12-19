let mapa;
let marcadores = [];
let infoWindowActual;
let propiedadesCargadas = [];

document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");

    if (formBusqueda) { // Asegurarse de que el formulario de búsqueda existe
        formBusqueda.addEventListener("submit", (e) => {
            e.preventDefault();
            filtrarPropiedades();
        });
    }
});

function initMap() {
    const ubicacionInicial = {
        lat: -34.5997,
        lng: -58.4208
    }; 
    const mapaDiv = document.getElementById("mapa-propiedades-dinamico");
    
    if (mapaDiv) { // Asegurarse de que el div del mapa existe
        mapa = new google.maps.Map(mapaDiv, {
            zoom: 12,
            center: ubicacionInicial,
            scrollwheel: false, 
        });
        cargarPropiedades();
    } else {
        console.error("El elemento 'mapa-propiedades-dinamico' no fue encontrado.");
        // Si no hay mapa, al menos cargar propiedades en la lista
        cargarPropiedades(); 
    }
}

function cargarPropiedades() {
    // ----------------------------------------------------
    //  SOLUCIÓN CONTRA CACHÉ: Añadimos un timestamp
    // ----------------------------------------------------
    const timestamp = new Date().getTime(); 
    
    fetch(`./propiedades.json?v=${timestamp}`) 
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Error al cargar el JSON: ${res.statusText}`);
            }
            return res.json();
        })
        .then((data) => {
            // Acceder al array dentro del objeto JSON (asumiendo que es "propiedades")
            propiedadesCargadas = data.propiedades; 
            
            renderizarPropiedades(propiedadesCargadas);
            if (mapa) { // Solo crear marcadores si el mapa se inicializó correctamente
                crearMarcadoresEnMapa(propiedadesCargadas);
            }
        })
        .catch((error) => {
            console.error("Error al cargar las propiedades:", error);
            const propiedadesGrid = document.querySelector(".propiedades-grid");
            if (propiedadesGrid) { // Asegurarse de que el contenedor existe
                propiedadesGrid.innerHTML =
                    "<p>Error al cargar las propiedades. Por favor, inténtelo de nuevo más tarde.</p>";
            }
        });
}

function renderizarPropiedades(lista) {
    const contenedor = document.querySelector(".propiedades-grid");
    if (!contenedor) return; 

    contenedor.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron propiedades que coincidan con los filtros.</p>";
        return;
    }

    lista.forEach((prop) => {
        const card = crearTarjetaPropiedad(prop);
        contenedor.appendChild(card);
    });
}

function crearTarjetaPropiedad(prop) {
    const card = document.createElement("div");
    card.className = "propiedad-card";
    card.dataset.id = prop.id;
    card.innerHTML = `
        <img src="${prop.imagenes && prop.imagenes[0] ? prop.imagenes[0] : 'img/placeholder.jpg'}" alt="${prop.titulo}" />
        <h3>${prop.titulo}</h3>
        <p>${prop.barrio} - ${prop.operacion}</p>
        <p>USD ${prop.precio ? prop.precio.toLocaleString('es-AR') : '-'}</p>
        <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
    `;

    // Abrir el infoWindow al pasar el mouse por encima de la tarjeta
    card.addEventListener("mouseenter", () => {
        abrirInfoWindow(prop.id);
    });

    // Cerrar el infoWindow cuando el mouse sale de la tarjeta
    card.addEventListener("mouseleave", () => {
        if (infoWindowActual) {
            infoWindowActual.close();
        }
    });

    return card;
}

function crearMarcadoresEnMapa(propiedades) {
    if (!mapa) return; 

    marcadores.forEach((marcador) => marcador.setMap(null));
    marcadores = [];

    if (!Array.isArray(propiedades)) return; 

    propiedades.forEach((prop) => {
        const marcador = new google.maps.Marker({
            position: {
                lat: prop.lat,
                lng: prop.lng
            },
            map: mapa,
            id: prop.id,
            title: prop.titulo,
        });

        // Crea el infoWindow
        const infoWindow = new google.maps.InfoWindow({
            content: crearContenidoInfoWindow(prop),
        });

        marcador.addListener("click", () => {
            if (infoWindowActual) {
                infoWindowActual.close();
            }
            infoWindow.open({
                anchor: marcador,
                map: mapa,
            });
            infoWindowActual = infoWindow;
        });

        marcadores.push(marcador);
    });
}

// Función para generar el contenido del infoWindow de forma dinámica
function crearContenidoInfoWindow(prop) {
    return `
        <div class="info-window-contenido">
            <h4>${prop.titulo}</h4>
            <img src="${prop.imagenes && prop.imagenes[0] ? prop.imagenes[0] : 'img/placeholder.jpg'}" alt="Imagen de la propiedad" class="info-window-imagen">
            <p><strong>Barrio:</strong> ${prop.barrio}</p>
            <p><strong>Tipo:</strong> ${prop.tipo}</p>
            <p><strong>Operación:</strong> ${prop.operacion}</p>
            <p><strong>Precio:</strong> U$S ${prop.precio}</p> 
            <a href="detalle.html?id=${prop.id}" class="info-window-link">Ver más detalles</a> 
        </div>
    `;
}

// Función para abrir el infoWindow desde la tarjeta de la propiedad
function abrirInfoWindow(id) {
    if (!mapa) return; 
    const marcador = marcadores.find((m) => m.id === id);
    if (marcador) {
        if (infoWindowActual) {
            infoWindowActual.close();
        }
        const prop = propiedadesCargadas.find((p) => p.id === id);
        if (prop) {
            const infoWindow = new google.maps.InfoWindow({
                content: crearContenidoInfoWindow(prop),
            });
            infoWindow.open({
                anchor: marcador,
                map: mapa,
            });
            infoWindowActual = infoWindow;
        }
    }
}

function filtrarPropiedades() {
    const filtroBarrio = document.getElementById("filtro-barrio") ? document.getElementById("filtro-barrio").value.toLowerCase() : '';
    const filtroTipo = document.getElementById("filtro-tipo") ? document.getElementById("filtro-tipo").value.toLowerCase() : '';
    const filtroOperacion = document.getElementById("filtro-operacion") ? document.getElementById("filtro-operacion").value.toLowerCase() : '';
    const filtroAmbientes = document.getElementById("filtro-ambientes") ? document.getElementById("filtro-ambientes").value : '';

    // Filtra las propiedades cargadas
    const propiedadesFiltradas = Array.isArray(propiedadesCargadas) ? propiedadesCargadas.filter((p) => {
        const coincideBarrio = !filtroBarrio || (p.barrio && p.barrio.toLowerCase() === filtroBarrio);
        const coincideTipo = !filtroTipo || (p.tipo && p.tipo.toLowerCase() === filtroTipo);
        const coincideOperacion = !filtroOperacion || (p.operacion && p.operacion.toLowerCase() === filtroOperacion);
        const coincideAmbientes = !filtroAmbientes || String(p.ambientes) === filtroAmbientes;

        return coincideBarrio && coincideTipo && coincideOperacion && coincideAmbientes;
    }) : [];

    renderizarPropiedades(propiedadesFiltradas);
    if (mapa) { // Solo crear marcadores si el mapa se inicializó
        crearMarcadoresEnMapa(propiedadesFiltradas);
    }
}

// Función global requerida por Google Maps API al cargar el script
window.initMap = initMap;