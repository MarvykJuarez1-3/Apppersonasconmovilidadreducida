// Sprint 1 // 

// Inicializar mapa
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

// Mostrar marcadores en el mapa y en lista lateral
puntosAccesibles.forEach(p => {
    let color;
    if (p.tipo === "rampa") color = "green";
    else if (p.tipo === "ascensor") color = "blue";
    else color = "red";

    const marker = L.circleMarker([p.lat, p.lon], { color: color, radius: 10 })
        .addTo(map)
        .bindPopup(`${p.nombre} (${p.tipo})`);

    const li = document.createElement("li");
    li.innerText = `${p.nombre} (${p.tipo})`;
    document.getElementById("listaPuntos").appendChild(li);
});

// =======================
// Función para generar ruta usando Leaflet Routing Machine
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

    // Eliminar ruta anterior
    if (controlRuta) {
        map.removeControl(controlRuta);
    }

    // Crear nueva ruta
    controlRuta = L.Routing.control({
        waypoints: [L.latLng(origen), L.latLng(destino)],
        lineOptions: { styles: [{ color: 'orange', weight: 5 }] },
        createMarker: function(i, wp) {
            return L.marker(wp.latLng);
        },
        routeWhileDragging: false
    }).addTo(map);

    // Mostrar distancia y tiempo aproximado
    controlRuta.on('routesfound', function(e) {
        const route = e.routes[0];
        const distancia = (route.summary.totalDistance / 1000).toFixed(2); // km
        const tiempo = (route.summary.totalTime / 60).toFixed(0); // min
        document.getElementById("rutaInfo").innerText = `Distancia: ${distancia} km | Tiempo aprox.: ${tiempo} min`;
    });
});

