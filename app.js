// =======================
// Sprint 1: Inicializar mapa y rutas
// =======================
const map = L.map('map').setView([19.4326, -99.1332], 13);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Datos simulados de puntos accesibles
const puntosAccesibles = [
    { nombre: "Rampa Central", lat: 19.4326, lon: -99.1332, tipo: "rampa" },
    { nombre: "Ascensor Plaza", lat: 19.4270, lon: -99.1677, tipo: "ascensor" },
    { nombre: "Obstáculo Temporal", lat: 19.4350, lon: -99.1400, tipo: "obstaculo" }
];

// Mostrar marcadores en el mapa y lista lateral
puntosAccesibles.forEach(p => {
    let color;
    if (p.tipo === "rampa") color = "green";
    else if (p.tipo === "ascensor") color = "blue";
    else color = "red";

    const marker = L.circleMarker([p.lat, p.lon], { color: color, radius: 10 })
        .addTo(map)
        .bindPopup(`${p.nombre} (${p.tipo})`);

    p.marker = marker; // Sprint 2: guardar marcador para filtros
});

// Crear lista lateral de puntos
const listaPuntos = document.getElementById("listaPuntos");
puntosAccesibles.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.nombre} (${p.tipo})`;
    listaPuntos.appendChild(li);
});

// =======================
// Sprint 1: Función para generar ruta
// =======================
let controlRuta = null;
document.getElementById("generarRuta").addEventListener("click", () => {
    const origenInput = document.getElementById("origen").value.split(",");
    const destinoInput = document.getElementById("destino").value.split(",");

    if (origenInput.length !== 2 || destinoInput.length !== 2) {
        alert("Ingresa correctamente las coordenadas.");
        return;
    }

    const origen = [parseFloat(origenInput[0]), parseFloat(origenInput[1])];
    const destino = [parseFloat(destinoInput[0]), parseFloat(destinoInput[1])];

    if (controlRuta) map.removeControl(controlRuta);

    controlRuta = L.Routing.control({
        waypoints: [L.latLng(origen), L.latLng(destino)],
        lineOptions: { styles: [{ color: 'orange', weight: 5 }] },
        createMarker: function(i, wp) { return L.marker(wp.latLng); },
        routeWhileDragging: false
    }).addTo(map);

    controlRuta.on('routesfound', function(e) {
        const route = e.routes[0];
        const distancia = (route.summary.totalDistance / 1000).toFixed(2);
        const tiempo = (route.summary.totalTime / 60).toFixed(0);
        document.getElementById("rutaInfo").innerText = `Distancia: ${distancia} km | Tiempo aprox.: ${tiempo} min`;
    });
});

// =======================
// Sprint 2: Filtros de puntos
// =======================
const checkboxes = document.querySelectorAll(".sidebar input[type=checkbox]");
checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        puntosAccesibles.forEach(p => {
            const marker = p.marker;
            const checked = Array.from(checkboxes)
                                .filter(c => c.checked)
                                .map(c => c.value);
            if (checked.includes(p.tipo)) marker.addTo(map);
            else map.removeLayer(marker);
        });
    });
});

// =======================
// Sprint 2: Sistema de rutas favoritas
// =======================
document.getElementById("guardarRuta").addEventListener("click", () => {
    if (!controlRuta) return alert("Genera primero una ruta.");
    const ruta = {
        origen: controlRuta.getWaypoints()[0].latLng,
        destino: controlRuta.getWaypoints()[1].latLng
    };
    let favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    favoritos.push(ruta);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    actualizarListaFavoritos();
});

function actualizarListaFavoritos() {
    const lista = document.getElementById("listaFavoritos");
    lista.innerHTML = "";
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    favoritos.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerText = `Ruta ${i+1}: (${r.origen.lat.toFixed(4)},${r.origen.lng.toFixed(4)}) -> (${r.destino.lat.toFixed(4)},${r.destino.lng.toFixed(4)})`;
        li.addEventListener("click", () => {
            document.getElementById("origen").value = `${r.origen.lat},${r.origen.lng}`;
            document.getElementById("destino").value = `${r.destino.lat},${r.destino.lng}`;
            document.getElementById("generarRuta").click();
        });
        lista.appendChild(li);
    });
}

// Cargar favoritos al iniciar
actualizarListaFavoritos();

// =======================
// Sprint 2: Interactividad lista <-> marcadores
// =======================
puntosAccesibles.forEach((p, index) => {
    const li = listaPuntos.children[index];

    // Hover en lista -> resaltar marcador
    li.addEventListener("mouseover", () => {
        p.marker.setStyle({ color: "orange", radius: 15 });
        li.classList.add("resaltado");
    });
    li.addEventListener("mouseout", () => {
        let color;
        if (p.tipo === "rampa") color = "green";
        else if (p.tipo === "ascensor") color = "blue";
        else color = "red";
        p.marker.setStyle({ color: color, radius: 10 });
        li.classList.remove("resaltado");
    });

    // Hover en marcador -> resaltar lista
    p.marker.on("mouseover", () => {
        li.classList.add("resaltado");
        p.marker.setStyle({ color: "orange", radius: 15 });
    });
    p.marker.on("mouseout", () => {
        li.classList.remove("resaltado");
        let color;
        if (p.tipo === "rampa") color = "green";
        else if (p.tipo === "ascensor") color = "blue";
        else color = "red";
        p.marker.setStyle({ color: color, radius: 10 });
    });
});

