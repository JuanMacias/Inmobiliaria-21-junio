let mapa;
let marcadores = [];
let infoWindowActual;
let propiedadesCargadas = [];

document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");

    formBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();
        filtrarPropiedades();
    });
});

function initMap() {
    const ubicacionInicial = {
        lat: -34.5997,
        lng: -58.4208
    };    
    mapa = new google.maps.Map(document.getElementById("mapa-propiedades-dinamico"), {
        zoom: 12,
        center: ubicacionInicial,
        scrollwheel: false, // ¡Agrega esta línea!
    });

    cargarPropiedades();
}

function cargarPropiedades() {
    fetch("./propiedades.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error("No se pudo cargar el archivo JSON.");
            }
            return res.json();
        })
        .then((data) => {
            propiedadesCargadas = data;
            renderizarPropiedades(propiedadesCargadas);
            crearMarcadoresEnMapa(propiedadesCargadas);
        })
        .catch((error) => {
            console.error("Error al cargar las propiedades:", error);
            document.querySelector(".propiedades-grid").innerHTML =
                "<p>Error al cargar las propiedades. Por favor, inténtelo de nuevo más tarde.</p>";
        });
}

function renderizarPropiedades(lista) {
    const contenedor = document.querySelector(".propiedades-grid");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
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
        <img src="${prop.imagen}" alt="${prop.titulo}" />
        <h3>${prop.titulo}</h3>
        <p>${prop.barrio} - ${prop.operacion}</p>
        <p>USD ${prop.precio}</p>
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
    marcadores.forEach((marcador) => marcador.setMap(null));
    marcadores = [];

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

        // Crea el infoWindow pero no lo abras todavía
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
            <img src="${prop.imagen}" alt="Imagen de la propiedad" class="info-window-imagen">
            <p><strong>Barrio:</strong> ${prop.barrio}</p>
            <p><strong>Tipo:</strong> ${prop.tipo}</p>
            <p><strong>Operación:</strong> ${prop.operacion}</p>
            <p><strong>Precio:</strong> "U$S"{prop.precio}</p>
            <a href="detalle.html?id={prop.id}" class="info-window-link">Ver más detalles</a>
        </div>
    `;
}

// Función para abrir el infoWindow desde la tarjeta de la propiedad
function abrirInfoWindow(id) {
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
    const filtroBarrio = document.getElementById("filtro-barrio").value.toLowerCase();
    const filtroTipo = document.getElementById("filtro-tipo").value.toLowerCase();
    const filtroOperacion = document.getElementById("filtro-operacion").value.toLowerCase();
    const filtroAmbientes = document.getElementById("filtro-ambientes").value;

    const propiedadesFiltradas = propiedadesCargadas.filter((p) => {
        const coincideBarrio = !filtroBarrio || p.barrio.toLowerCase() === filtroBarrio;
        const coincideTipo = !filtroTipo || p.tipo.toLowerCase() === filtroTipo;
        const coincideOperacion = !filtroOperacion || p.operacion.toLowerCase() === filtroOperacion;
        const coincideAmbientes = !filtroAmbientes || String(p.ambientes) === filtroAmbientes;

        return coincideBarrio && coincideTipo && coincideOperacion && coincideAmbientes;
    });

    renderizarPropiedades(propiedadesFiltradas);
    crearMarcadoresEnMapa(propiedadesFiltradas);
}

