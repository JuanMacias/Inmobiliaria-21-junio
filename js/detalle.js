document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const idPropiedad = params.get("id");
    
    let propiedadesCargadas = [];
    let imagenesValidas = []; 
    let indiceActualImagen = 0;
    let infoWindowGlobal = null; 
    let markerGlobal = null;
    let mapaGlobal = null;

    // 1. Cargar datos desde el JSON
    fetch(`propiedades.json?v=${new Date().getTime()}`)
        .then(res => {
            if (!res.ok) throw new Error("Error al cargar el archivo JSON");
            return res.json();
        })
        .then(data => {
            propiedadesCargadas = data.propiedades || [];
            const indexActual = propiedadesCargadas.findIndex(p => p.id === idPropiedad);
            const prop = propiedadesCargadas[indexActual];
            
            if (prop) {
                // Configurar navegación (Anterior/Siguiente)
                configurarNavegacion(indexActual);

                // Preparar imágenes
                const fotosBrutas = Array.isArray(prop.imagenes) && prop.imagenes.length > 0 
                                    ? prop.imagenes 
                                    : [prop.imagen || 'img/placeholder.jpg'];
                
                const imagenesTemporales = fotosBrutas.filter(img => img && img.trim() !== "");

                // Inicializar el mapa
                inicializarMapaConDatos(prop);
                
                // Renderizar datos e iconos
                renderizarDetalleYValidar(prop, imagenesTemporales);
            } else {
                console.error("Propiedad no encontrada");
            }
        })
        .catch(err => console.error("Error crítico:", err));

    // Función para manejar botones de Anterior y Siguiente
    function configurarNavegacion(indexActual) {
        const btnAnt = document.getElementById('prop-anterior');
        const btnSig = document.getElementById('prop-siguiente');
        
        if (indexActual > 0 && btnAnt) {
            btnAnt.href = `detalle.html?id=${propiedadesCargadas[indexActual - 1].id}`;
        } else if (btnAnt) {
            btnAnt.style.display = 'none';
        }
        
        if (indexActual < propiedadesCargadas.length - 1 && btnSig) {
            btnSig.href = `detalle.html?id=${propiedadesCargadas[indexActual + 1].id}`;
        } else if (btnSig) {
            btnSig.style.display = 'none';
        }
    }

    function renderizarDetalleYValidar(prop, fotos) {
        // Título y Precio
        if(document.getElementById("titulo-prop")) document.getElementById("titulo-prop").innerText = prop.titulo;
        
        const precio = prop.precio ? prop.precio.toLocaleString('es-AR') : "Consultar";
        if(document.getElementById("precio-prop")) document.getElementById("precio-prop").innerText = `U$S ${precio}`;

        // --- ICONOS DINÁMICOS (Sincronizados con tu HTML) ---
        if(document.getElementById("valor-metros")) 
            document.getElementById("valor-metros").innerText = (prop.metros || "0") + " m² cubie.";
        
        if(document.getElementById("valor-dormitorios")) 
            document.getElementById("valor-dormitorios").innerText = (prop.dormitorios || "0") + " dorm.";
        
        if(document.getElementById("valor-antiguedad")) 
            document.getElementById("valor-antiguedad").innerText = (prop.antiguedad || "0") + " años";
        
        if(document.getElementById("valor-banos")) {
            const textoBano = prop.banos === 1 ? " baño" : " baños";
            document.getElementById("valor-banos").innerText = (prop.banos || "0") + textoBano;
        }
        
        if(document.getElementById("valor-ambientes")) 
            document.getElementById("valor-ambientes").innerText = (prop.ambientes || "0") + " amb.";
        
        if(document.getElementById("valor-cochera")) 
            document.getElementById("valor-cochera").innerText = (prop.cocheras || "No tiene");
        
        if(document.getElementById("valor-estado")) 
            document.getElementById("valor-estado").innerText = prop.estado || "Bueno";
        
        if(document.getElementById("valor-orientacion")) 
            document.getElementById("valor-orientacion").innerText = prop.orientacion || "N/A";

        // Descripción
        const descElement = document.getElementById("descripcion-prop");
        if(descElement) {
            descElement.innerHTML = prop.descripcion || "Sin descripción disponible.";
        }

        // Galería de fotos
        const contenedorMinis = document.getElementById("contenedor-miniaturas");
        if (!contenedorMinis) return;
        contenedorMinis.innerHTML = "";
        imagenesValidas = []; 

        fotos.forEach((imgSrc) => {
            const imgElement = document.createElement("img");
            imgElement.src = imgSrc;
            
            imgElement.onload = function() {
                imagenesValidas.push(imgSrc);
                imgElement.className = "miniatura";
                imgElement.alt = prop.titulo;
                
                const nuevoIndice = imagenesValidas.length - 1;
                imgElement.onclick = () => irAFoto(nuevoIndice);
                contenedorMinis.appendChild(imgElement);
                
                if (imagenesValidas.length === 1) {
                    indiceActualImagen = 0;
                    actualizarImagenEnPantalla();
                    actualizarGloboMapa(prop);
                }
                vincularBotonesGaleria();
            };

            imgElement.onerror = function() {
                console.warn("No se pudo cargar la imagen:", imgSrc);
            };
        });
    }

    // Navegación de Galería
    window.irAFoto = function(index) {
        if (index >= 0 && index < imagenesValidas.length) {
            indiceActualImagen = index;
            actualizarImagenEnPantalla();
        }
    };

    function actualizarImagenEnPantalla() {
        if (imagenesValidas.length === 0) return;
        const imgPrincipal = document.getElementById("imagen-activa");
        if (imgPrincipal) imgPrincipal.src = imagenesValidas[indiceActualImagen];

        const todasLasMinis = document.querySelectorAll(".miniatura");
        todasLasMinis.forEach((m, i) => {
            if (i === indiceActualImagen) {
                m.classList.add("activa");
                m.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                m.classList.remove("activa");
            }
        });
    }

    function vincularBotonesGaleria() {
        const btnPrev = document.getElementById("btn-prev-galeria");
        const btnNext = document.getElementById("btn-next-galeria");

        if(btnNext) {
            btnNext.onclick = (e) => {
                e.preventDefault();
                if (imagenesValidas.length <= 1) return;
                indiceActualImagen = (indiceActualImagen + 1) % imagenesValidas.length;
                actualizarImagenEnPantalla();
            };
        }

        if(btnPrev) {
            btnPrev.onclick = (e) => {
                e.preventDefault();
                if (imagenesValidas.length <= 1) return;
                indiceActualImagen = (indiceActualImagen - 1 + imagenesValidas.length) % imagenesValidas.length;
                actualizarImagenEnPantalla();
            };
        }
    }

    // --- FUNCIONES DEL MAPA ---
    function inicializarMapaConDatos(prop) {
        const mapaDiv = document.getElementById("mapa-detalle-propiedad");
        if (!mapaDiv || !prop.lat || !prop.lng) return;

        const coords = { lat: parseFloat(prop.lat), lng: parseFloat(prop.lng) };
        mapaGlobal = new google.maps.Map(mapaDiv, { 
            center: coords, 
            zoom: 16, 
            scrollwheel: false,
            mapTypeControl: false,
            streetViewControl: false
        });

        markerGlobal = new google.maps.Marker({ 
            position: coords, 
            map: mapaGlobal, 
            title: prop.titulo,
            animation: google.maps.Animation.DROP
        });
        
        actualizarGloboMapa(prop);
    }

    function actualizarGloboMapa(prop) {
        if (!mapaGlobal || !markerGlobal) return;

        const direccion = prop.direccion || "Dirección no disponible";
        let fotoUrl = imagenesValidas.length > 0 ? imagenesValidas[0] : 'img/placeholder.jpg';

        const contenidoHTML = `
            <div style="width: 220px; font-family: sans-serif; line-height: 1.4;">
                <h4 style="margin:0 0 5px 0; color: #333;">${prop.titulo}</h4>
                <img src="${fotoUrl}" style="width:100%; height:110px; object-fit:cover; border-radius:4px;">
                <p style="margin:5px 0; font-size: 13px;"><b>Ubicación:</b> ${direccion}</p>
                <p style="margin:0; color:#e67e22; font-weight:bold;">U$S ${prop.precio ? prop.precio.toLocaleString('es-AR') : 'Cons.'}</p>
            </div>`;

        if (infoWindowGlobal) infoWindowGlobal.close();
        infoWindowGlobal = new google.maps.InfoWindow({ content: contenidoHTML });
        
        markerGlobal.addListener("click", () => {
            infoWindowGlobal.open(mapaGlobal, markerGlobal);
        });

        infoWindowGlobal.open(mapaGlobal, markerGlobal);
    }
});