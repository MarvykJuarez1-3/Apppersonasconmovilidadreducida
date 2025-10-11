// Navegación
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll("header nav ul li a");
function mostrarSeccion(id){
  sections.forEach(sec=>sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navLinks.forEach(l=>l.classList.remove("active"));
  const link=document.querySelector(`a[data-section="${id}"]`);
  if(link) link.classList.add("active");
  if(id==="mapa") setTimeout(()=>{ map.invalidateSize(); },100);
}
navLinks.forEach(link=>link.addEventListener("click",e=>{ e.preventDefault(); mostrarSeccion(link.dataset.section); }));
document.querySelectorAll(".btn-app").forEach(btn=>btn.addEventListener("click",()=>{ mostrarSeccion(btn.dataset.section); }));

// Hamburguesa
const menuToggle=document.getElementById("menuToggle");
const navList=document.getElementById("navList");
menuToggle.addEventListener("click",()=>{ navList.classList.toggle("show"); });

// Mapa y clusters
const map=L.map('map').setView([19.4326,-99.1332],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'&copy; OpenStreetMap contributors' }).addTo(map);
const markersCluster=L.markerClusterGroup().addTo(map);
const puntosAccesibles=[
  {nombre:"Rampa Central",lat:19.4326,lon:-99.1332,tipo:"rampa",color:"green"},
  {nombre:"Ascensor Plaza",lat:19.4270,lon:-99.1677,tipo:"ascensor",color:"blue"},
  {nombre:"Obstáculo Temporal",lat:19.4350,lon:-99.1400,tipo:"obstaculo",color:"red"}
];
const lista=document.getElementById("listaPuntos");
puntosAccesibles.forEach(p=>{
  const icon=L.icon({iconUrl:`https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${p.color.replace("#","")}`,iconSize:[21,34],iconAnchor:[10,34],popupAnchor:[0,-28]});
  p.marker=L.marker([p.lat,p.lon],{icon}).bindPopup(`${p.nombre} (${p.tipo})`);
  markersCluster.addLayer(p.marker);
  const li=document.createElement("li");
  li.innerText=`${p.nombre} (${p.tipo})`;
  li.addEventListener("mouseover",()=>{ p.marker.openPopup(); li.classList.add("resaltado"); });
  li.addEventListener("mouseout",()=>{ p.marker.closePopup(); li.classList.remove("resaltado"); });
  lista.appendChild(li);
});
const checkboxes=document.querySelectorAll(".sidebar input[type=checkbox]");
checkboxes.forEach(cb=>cb.addEventListener("change",()=>{
  const selected=Array.from(checkboxes).filter(c=>c.checked).map(c=>c.value);
  markersCluster.clearLayers();
  puntosAccesibles.forEach(p=>{ if(selected.includes(p.tipo)) markersCluster.addLayer(p.marker); });
}));

// Alertas e historial
const historialAlertas=document.getElementById("historialAlertas");
function revisarObstaculos(){
  puntosAccesibles.forEach(p=>{
    if(p.tipo==="obstaculo"){
      const mensaje=`¡Alerta! Obstáculo detectado en ${p.nombre}`;
      mostrarNotificacion(mensaje,"alerta-roja");

      const li=document.createElement("li");
      li.innerText=mensaje;
      const btnCerrar=document.createElement("span");
      btnCerrar.innerText=" ✖";
      btnCerrar.style.cursor="pointer";
      btnCerrar.style.marginLeft="10px";
      btnCerrar.addEventListener("click",()=>{ li.remove(); });
      li.appendChild(btnCerrar);
      historialAlertas.prepend(li);
    }
  });
}
setInterval(revisarObstaculos,10000);

function mostrarNotificacion(mensaje,clase=""){
  const cont=document.getElementById("notificaciones");
  const div=document.createElement("div");
  div.className=`notificacion ${clase}`;
  div.innerText=mensaje;
  const btnCerrar=document.createElement("span");
  btnCerrar.innerText=" ✖";
  btnCerrar.style.float="right";
  btnCerrar.style.cursor="pointer";
  btnCerrar.style.marginLeft="10px";
  btnCerrar.addEventListener("click",()=>{ div.remove(); });
  div.appendChild(btnCerrar);
  cont.appendChild(div);
  setTimeout(()=>{ div.remove(); },4000);
}

// Registro voluntarios
let totalVol=0;
const tablaVoluntariosBody=document.querySelector("#tablaVoluntarios tbody");
document.getElementById("formVoluntarios").addEventListener("submit",e=>{
  e.preventDefault();
  const nombre=document.getElementById("nombre").value;
  const email=document.getElementById("email").value;
  const telefono=document.getElementById("telefono").value;
  totalVol++;
  document.getElementById("numVoluntarios").innerText=`Voluntarios registrados: ${totalVol}`;
  document.getElementById("mensajeRegistro").innerText="Registro exitoso ✅";

  const tr=document.createElement("tr");
  tr.innerHTML=`<td>${nombre}</td><td>${email}</td><td>${telefono}</td><td>
    <button class="btn-editar">Editar</button>
    <button class="btn-borrar">Borrar</button>
  </td>`;
  tablaVoluntariosBody.appendChild(tr);
  tr.querySelector(".btn-borrar").addEventListener("click",()=>{ tr.remove(); totalVol--; document.getElementById("numVoluntarios").innerText=`Voluntarios registrados: ${totalVol}`; });
  tr.querySelector(".btn-editar").addEventListener("click",()=>{
    document.getElementById("nombre").value=nombre;
    document.getElementById("email").value=email;
    document.getElementById("telefono").value=telefono;
    tr.remove();
    totalVol--;
    document.getElementById("numVoluntarios").innerText=`Voluntarios registrados: ${totalVol}`;
  });
  e.target.reset();
});

// Dark mode
document.getElementById("darkModeToggle").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("modoOscuro",document.body.classList.contains("dark"));
});
if(localStorage.getItem("modoOscuro")==="true") document.body.classList.add("dark");
