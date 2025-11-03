// ============================
// app.js - Sprints 1 a 6
// ============================

/* ============================
UTILIDADES - Sprint 1
============================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ============================
NAVEGACIÓN - Sprint 2
============================ */
function activateNavLinkBySection(sectionId) {
  $$('.nav-link').forEach(a => a.classList.remove('active'));
  const nav = $(`.nav-link[data-section="${sectionId}"]`);
  if(nav) nav.classList.add('active');
}

function showSection(sectionId){
  $$('.section').forEach(s=>s.classList.remove('active'));
  const target=document.getElementById(sectionId);
  if(target) target.classList.add('active');
  activateNavLinkBySection(sectionId);
  if(sectionId==='mapa' && typeof map!=='undefined'){
    setTimeout(()=>map.invalidateSize && map.invalidateSize(),300);
  }
}

// Click centralizado para secciones, acciones y feature cards
document.addEventListener('click', e=>{
  const link=e.target.closest('[data-section],[data-action],.feature-card,.hero-link,.btn[data-action]');
  if(!link) return;
  e.preventDefault();

  if(link.dataset.section) showSection(link.dataset.section);

  if(link.dataset.action){
    if(link.dataset.action==='registro') abrirModal('modalRegistro');
    if(link.dataset.action==='login') abrirModal('modalLogin');
    if(link.dataset.action==='privacidad') abrirModal('modalPrivacidad');
  }

  if(link.classList.contains('feature-card') || link.classList.contains('hero-link')){
    const sec=link.dataset.section;
    if(sec) showSection(sec);
  }
});

// Feature cards: reaccionan a Enter y Espacio
$$('.feature-card').forEach(card=>{
  card.addEventListener('keydown', ev=>{
    if(ev.key==='Enter'||ev.key===' '){ev.preventDefault(); const sec=card.dataset.section; if(sec) showSection(sec);}
  });
});

/* ============================
MODALES - Sprint 3
============================ */
function abrirModal(id){
  const m=document.getElementById(id);
  if(!m) return;
  m.classList.remove('hidden');
  m.setAttribute('aria-hidden','false');
  const first=m.querySelector('input,button,select,textarea');
  if(first) first.focus();
}

function cerrarModal(id){
  const m=document.getElementById(id);
  if(!m) return;
  m.classList.add('hidden');
  m.setAttribute('aria-hidden','true');
}

// Botones de cerrar modales
$('#cancelarRegistro')?.addEventListener('click',()=>cerrarModal('modalRegistro'));
$('#cancelarLogin')?.addEventListener('click',()=>cerrarModal('modalLogin'));
$('#cerrarPrivacidad')?.addEventListener('click',()=>cerrarModal('modalPrivacidad'));

// Cerrar modales con ESC
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') $$('.modal').forEach(m=>cerrarModal(m.id));
});

/* ============================
MODO OSCURO - Sprint 4
============================ */
const darkBtn=$('#btnDarkMode');
darkBtn.addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  darkBtn.setAttribute('aria-pressed', document.body.classList.contains('dark'));
});

/* ============================
HAMBURGUESA RESPONSIVE - Sprint 4 revison de funcionalidad 
============================ */
const btnMenu=$('#btnMenu');
const nav=document.querySelector('nav');
btnMenu.addEventListener('click',()=>nav.classList.toggle('open'));
$$('.nav-link').forEach(link=>link.addEventListener('click',()=>{if(nav.classList.contains('open')) nav.classList.remove('open')}));

/* ============================
MAPA LEAFLET - Sprint 5
============================ */
const map=L.map('map').setView([19.4326,-99.1332],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19, attribution:'&copy; OpenStreetMap'
}).addTo(map);

/* ============================
MARKERS / PUNTOS - Sprint 5
============================ */
const puntos=[
  {id:1, tipo:'rampa', lat:19.433, lon:-99.14, nombre:'Rampa accesible - Reforma'},
  {id:2, tipo:'ascensor', lat:19.436, lon:-99.14, nombre:'Ascensor público - Metro Hidalgo'},
  {id:3, tipo:'obstaculo', lat:19.43, lon:-99.13, nombre:'Escalera sin rampa - Eje Central'}
];

const iconos={
  rampa:L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/535/535239.png',iconSize:[34,34],iconAnchor:[17,34]}),
  ascensor:L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/854/854878.png',iconSize:[34,34],iconAnchor:[17,34]}),
  obstaculo:L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/565/565547.png',iconSize:[34,34],iconAnchor:[17,34]})
};

const markers=L.markerClusterGroup();

// Función para renderizar markers según filtros
function renderMarkers(selectedTypes=['rampa','ascensor','obstaculo']){
  markers.clearLayers();
  puntos.forEach(p=>{
    if(selectedTypes.includes(p.tipo)){
      const mk=L.marker([p.lat,p.lon],{icon:iconos[p.tipo],title:p.nombre})
        .bindPopup(`<strong>${p.nombre}</strong><br>Tipo: ${p.tipo}`);
      mk.puntoId=p.id;
      markers.addLayer(mk);
    }
  });
  map.addLayer(markers);
}

/* ============================
FILTROS MAPA - Sprint 6
============================ */
$$('.map-filters input[type=checkbox]').forEach(cb=>{
  cb.addEventListener('change',()=>{
    const selected=$$('.map-filters input[type=checkbox]').filter(c=>c.checked).map(c=>c.value);
    renderMarkers(selected);
  });
});
renderMarkers(); // render inicial

/* ============================
ALERTAS / PROXIMIDAD - Sprint 5
============================ */
const alertaEl=$('#alertaPopup');
let lastAlertFor=null;
function showAlert(text){alertaEl.textContent=text;alertaEl.classList.remove('hidden');clearTimeout(alertaEl._timeout);alertaEl._timeout=setTimeout(()=>alertaEl.classList.add('hidden'),7000);}
function checkProximity(lat,lon){
  for(const p of puntos){
    const d=Math.hypot(p.lat-lat,p.lon-lon);
    if(d<0.0012){if(lastAlertFor!==p.id){lastAlertFor=p.id;showAlert(`⚠️ ¡Atención! Cerca de ${p.tipo.toUpperCase()}: ${p.nombre}`)}return true;}
  }
  lastAlertFor=null;return false;
}
if('geolocation' in navigator){
  navigator.geolocation.watchPosition(pos=>{checkProximity(pos.coords.latitude,pos.coords.longitude)},
    err=>console.warn('Geolocalización no disponible',err),
    {enableHighAccuracy:true,maximumAge:30000,timeout:10000});
}

/* ============================
FORMULARIOS SIMULADOS - Sprint 3 y revsion de funcionalidad sprint 7
============================ */
$('#formRegistro').addEventListener('submit', e=>{
  e.preventDefault();
  cerrarModal('modalRegistro');
  setTimeout(()=>abrirModal('modalLogin'),250);
});
$('#formLogin').addEventListener('submit', e=>{
  e.preventDefault();
  cerrarModal('modalLogin');
  alert('Inicio de sesión exitoso. ¡Bienvenido!');
});

/* ============================
INICIALIZACIÓN - Sprint 1 revivision de funcionalidad 
============================ */
document.addEventListener('DOMContentLoaded', ()=>{
  showSection('inicio');
  $('#main')?.setAttribute('tabindex','-1');
});

// ============================
// FIN app.js
// ============================
