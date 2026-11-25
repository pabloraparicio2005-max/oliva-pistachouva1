/* ============================================================
   app.js · OlivaPistacho
   Secciones:  1 Utilidades · 2 Idioma · 3 Catálogo · 4 Supabase
               5 Accesibilidad · 6 Vídeo · 7 Dibujado · 8 Navegación
               9 Eventos
   ============================================================ */
(function () {
'use strict';

/* ---------- 1. UTILIDADES ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const pad = n => 'OP-' + String(n).padStart(6, '0');

/* ---------- 2. IDIOMA (10 idiomas, RTL incluido) ---------- */
const LANGS = window.OP_LANGS, I18N = window.OP_I18N;
const CODES = LANGS.map(l => l.code);
let lang = ls.get('op_lang', null);
if (!CODES.includes(lang)) {
  lang = (navigator.language || 'es').slice(0, 2).toLowerCase();
  if (lang === 'iw') lang = 'he';
  if (!CODES.includes(lang)) lang = 'es';
}
const L = () => LANGS.find(l => l.code === lang);
// La clave es el texto en español. es → tal cual; resto → idioma, si no inglés, si no español.
const t = (s, ...a) => {
  let x = lang === 'es' ? s : ((I18N[lang] && I18N[lang][s]) || (I18N.en && I18N.en[s]) || s);
  a.forEach((v, i) => { x = x.split('{' + i + '}').join(v); });
  return x;
};
const fmt = n => new Intl.NumberFormat(L().locale, { style: 'currency', currency: 'EUR' }).format(n);
const fdate = d => new Date(d).toLocaleString(L().locale);

/* ---------- 3. CATÁLOGO (valores por defecto; se sustituyen por los de Supabase) ---------- */
const CATS = ['pistachos', 'aceite', 'vino', 'uvas', 'packs'];
const CAT_LABEL = { pistachos: 'Pistachos', aceite: 'Aceite y aceitunas', vino: 'Vino', uvas: 'Uvas', packs: 'Packs', servicio: 'Servicio' };
const mk = (id, n, d, p, e, f, c, alc) => ({ id, n, d, p, e, f: !!f, c, alc: !!alc, s: 0, tr: null });
const P = [
  mk(1, 'Pistachos tostados salados', '250 g. Tostados artesanalmente, con un toque de sal marina.', 8.9, '🥜', 1, 'pistachos'),
  mk(2, 'Pistachos naturales', '250 g. Sin sal, crudos. Ideales para snacks saludables.', 9.5, '🌰', 1, 'pistachos'),
  mk(3, 'Pistachos premium 1 kg', 'Bolsa familiar. Origen Murcia. Calibre grande.', 29.9, '🥜', 0, 'pistachos'),
  mk(4, 'Aceite de oliva virgen extra', '500 ml. Primera presión en frío. Acidez <0,2%.', 14.5, '🫒', 1, 'aceite'),
  mk(5, 'Aceitunas arbequinas', '350 g. Variedad arbequina, aliño tradicional.', 6.8, '🫒', 0, 'aceite'),
  mk(6, 'Aceitunas rellenas de anchoa', '350 g. Rellenas a mano. Sabor intenso.', 7.2, '🫒', 0, 'aceite'),
  mk(7, 'Pack regalo mediterráneo', 'Pistachos + AOVE + aceitunas en caja de regalo.', 34.9, '🎁', 1, 'packs'),
  mk(8, 'Pasta de pistacho 200 g', '100% pistacho. Ideal para postres y cocina.', 11.9, '🥜', 0, 'pistachos'),
  mk(9, 'Vino tinto crianza', '750 ml. Tempranillo de nuestra viña, 12 meses en barrica.', 12.5, '🍷', 1, 'vino', 1),
  mk(10, 'Vino blanco joven', '750 ml. Fresco y afrutado. Ideal con pescado y marisco.', 9.9, '🥂', 0, 'vino', 1),
  mk(11, 'Vino rosado', '750 ml. Garnacha suave y ligera. Mejor muy frío.', 8.9, '🍷', 0, 'vino', 1),
  mk(12, 'Uvas de mesa 1 kg', 'Uvas frescas y sin pepitas, recogidas esta semana.', 4.5, '🍇', 1, 'uvas'),
  mk(13, 'Uvas para vino, caja 5 kg', 'Uva tinta de vendimia para hacer tu propio vino o mosto.', 12, '🍇', 0, 'uvas'),
  mk(14, 'Pack vino y pistachos', 'Vino tinto crianza + pistachos tostados + aceitunas.', 27.9, '🎁', 0, 'packs', 1)
];
const S = [
  { id: 101, n: 'Tour por la finca', d: 'Visita guiada de 2 h + cata. Grupos de hasta 12 personas.', p: 25, e: '🏞️', c: 'servicio', s: 1 },
  { id: 102, n: 'Venta al por mayor', d: 'Precios especiales desde 20 kg. Pide presupuesto.', p: 0, e: '📦', c: 'servicio', s: 1 },
  { id: 103, n: 'Suscripción mensual', d: 'Caja sorpresa cada mes. Cancela cuando quieras.', p: 39.9, e: '📅', c: 'servicio', s: 1 },
  { id: 104, n: 'Asesoría agrícola', d: 'Consulta online de 1 h sobre cultivo de pistacho u olivo.', p: 120, e: '👨‍🌾', c: 'servicio', s: 1 },
  { id: 105, n: 'Cata de vinos en la finca', d: 'Cata guiada de 3 vinos con aperitivo de la casa. Mayores de 18 años.', p: 30, e: '🍷', c: 'servicio', s: 1, alc: true }
].map(x => Object.assign({ f: false, alc: false, tr: null }, x));
S.push(
  { id: 106, n: 'Asesoría de accesibilidad digital', d: 'Revisión básica de una web: teclado, contraste, subtítulos, textos alternativos y lector de pantalla.', p: 45, e: '🧑‍💻', c: 'servicio', s: 1 },
  { id: 107, n: 'Transcripción y subtítulos', d: 'Servicio de transcripción y subtitulado de vídeos para facilitar su acceso a personas sordas o con dificultades auditivas.', p: 30, e: '📝', c: 'servicio', s: 1 },
  { id: 108, n: 'Orientación en accesibilidad', d: 'Sesión de orientación para adaptar contenidos, documentos y comunicaciones a distintas necesidades.', p: 35, e: '🤝', c: 'servicio', s: 1 },
  { id: 109, n: 'Pack lectura accesible', d: 'Material digital con texto claro, formatos ampliables y guía de uso de funciones de accesibilidad.', p: 12, e: '📖', c: 'servicio', s: 1 }
);
const ALL = [...P, ...S];
let reviews = [
  { name: 'María G.', stars: 5, text: 'Los pistachos más crujientes que he probado. El aceite de oliva es excepcional.', date: '2026-09-12' },
  { name: 'Javier P.', stars: 5, text: 'El vino tinto es redondo y las uvas llegaron frescas. Gran finca.', date: '2026-09-03' },
  { name: 'Carlos R.', stars: 5, text: 'El pack regalo llegó perfecto. Mi hermana quedó encantada.', date: '2026-08-28' },
  { name: 'Laura M.', stars: 4, text: 'Muy buen sabor. El envío fue rápido. Repetiré seguro.', date: '2026-08-15' }
];
// Nombre y descripción: primero la traducción de la base de datos, luego el diccionario.
const nm = i => (i.tr && i.tr[lang] && i.tr[lang].n) || t(i.n);
const ds = i => (i.tr && i.tr[lang] && i.tr[lang].d) || t(i.d);

/* ---------- 4. SUPABASE ---------- */
const CFG = window.OP_CONFIG || {};
const URL_CLEAN = String(CFG.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const KEY = String(CFG.SUPABASE_KEY || '').trim();
const IS_DEV = location.protocol === 'file:' || ['', 'localhost', '127.0.0.1'].includes(location.hostname);
let CFG_ERR = null, sb = null;
if (typeof supabase === 'undefined') CFG_ERR = 'No se ha podido cargar la librería de Supabase (sin internet o bloqueada por un bloqueador de anuncios).';
else if (!URL_CLEAN || !KEY || /TU-PROYECTO/i.test(URL_CLEAN) || /TU_CLAVE/i.test(KEY)) CFG_ERR = 'Falta configurar Supabase: abre js/config.js y pon tu SUPABASE_URL y tu SUPABASE_KEY.';
else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(URL_CLEAN)) CFG_ERR = 'SUPABASE_URL no es válida. Debe ser como https://abcdefgh.supabase.co (Project Settings → API → Project URL).';
if (!CFG_ERR) { try { sb = supabase.createClient(URL_CLEAN, KEY); } catch (e) { CFG_ERR = 'Configuración de Supabase no válida: ' + e.message; } }
const OK = !CFG_ERR;
const cfgMsg = () => IS_DEV ? CFG_ERR : t('No se puede conectar con el servidor. Inténtalo de nuevo más tarde.');
const netErr = e => /failed to fetch|networkerror|load failed/i.test((e && e.message) || '')
  ? t('No se puede conectar con el servidor. Inténtalo de nuevo más tarde.') : ((e && e.message) || String(e));
if (CFG_ERR) {
  console.warn('[OlivaPistacho] ' + CFG_ERR + ' La web funciona en modo demostración con el catálogo local.');
  if (IS_DEV) { const bn = document.createElement('div'); bn.id = 'cfgbn'; bn.setAttribute('role', 'alert'); bn.textContent = CFG_ERR; document.body.prepend(bn); }
}

let user = null, orders = [], moves = [], authReady = !OK;
let cart = ls.get('op_cart', []);

async function loadCatalog() {
  if (!OK) return;
  const { data, error } = await sb.from('productos').select('*').eq('activo', true).order('id');
  if (error || !data || !data.length) return;
  const m = data.map(x => ({
    id: x.id, n: x.nombre, d: x.descripcion || '', p: +x.precio, e: x.emoji || '', f: !!x.destacado,
    c: x.categoria || (x.tipo === 'servicio' ? 'servicio' : 'pistachos'),
    alc: !!x.alcohol, s: x.tipo === 'servicio' ? 1 : 0, tr: x.traducciones || null
  }));
  P.splice(0, P.length, ...m.filter(x => !x.s));
  S.splice(0, S.length, ...m.filter(x => x.s));
  ALL.splice(0, ALL.length, ...P, ...S);
  renderAll();
}
async function loadReviews() {
  if (!OK) return;
  const { data, error } = await sb.from('resenas').select('*').order('created_at', { ascending: false });
  if (error || !data || !data.length) return;
  reviews = data.map(x => ({ name: x.nombre, stars: x.estrellas, text: x.texto, date: String(x.created_at).slice(0, 10) }));
  renderAll();
}
async function loadUser(session) {
  if (!session) { user = null; return; }
  const { data } = await sb.from('profiles').select('nombre,rol').eq('id', session.user.id).single();
  user = { id: session.user.id, email: session.user.email, name: (data && data.nombre) || session.user.email, role: data && data.rol === 'admin' ? 'admin' : 'cliente' };
}
async function loadAdmin() {
  if (!user || user.role !== 'admin') { orders = []; moves = []; return; }
  const [o, m] = await Promise.all([
    sb.from('pedidos').select('*,lineas_pedido(nombre,cantidad)').order('created_at', { ascending: false }),
    sb.from('movimientos').select('*').order('created_at', { ascending: false })
  ]);
  orders = (o.data || []).map(x => ({ id: pad(x.id), rid: x.id, date: x.created_at, customer: x.cliente, email: x.email, method: x.metodo, total: +x.total, estado: x.estado, items: (x.lineas_pedido || []).map(l => ({ n: l.nombre, q: l.cantidad })) }));
  moves = (m.data || []).map(x => ({ date: x.created_at, type: x.tipo, concept: x.concepto, amount: +x.importe }));
}

/* ---------- 5. ACCESIBILIDAD ---------- */
const systemDark = () => !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
const PREF_DEF = () => ({ fs: 100, hc: false, dark: systemDark(), dys: false, sp: false, rm: false, hl: false, bigcursor: false });
let pref = Object.assign(PREF_DEF(), ls.get('op_pref', {}));
const reduceMotion = () => pref.rm || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function applyPrefs() {
  document.documentElement.style.fontSize = pref.fs + '%';
  document.documentElement.dataset.theme = pref.dark ? 'dark' : 'light';
  ['hc', 'dys', 'sp', 'rm', 'hl', 'bigcursor'].forEach(k => document.body.classList.toggle(k, !!pref[k]));
  $$('[data-pref]').forEach(i => { i.checked = !!pref[i.dataset.pref]; });
  ls.set('op_pref', pref);
}
// Leer en voz alta (útil para baja visión, dislexia o dificultades de lectura)
let ttsOn = false;
function setTTS(on) {
  ttsOn = on;
  $('#tts').setAttribute('aria-pressed', on);
  $('#tts-l').textContent = t(on ? 'Parar lectura' : 'Leer en voz alta');
}
function stopTTS() { if ('speechSynthesis' in window) speechSynthesis.cancel(); setTTS(false); }
function startTTS() {
  if (!('speechSynthesis' in window)) return toast('Tu navegador no puede leer en voz alta.');
  const sec = $$('main>section').find(s => !s.hidden);
  const text = (sec ? sec.innerText : '').replace(/\s+/g, ' ').trim();
  const parts = text.match(/[^.!?。！？]+[.!?。！？]?/g) || [text];
  speechSynthesis.cancel();
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p.trim());
    u.lang = L().speech;
    if (i === parts.length - 1) u.onend = u.onerror = () => setTTS(false);
    speechSynthesis.speak(u);
  });
  setTTS(true);
}

/* ---------- 6. VÍDEO (subtítulos en el idioma elegido) ---------- */
const vid = $('#introv');
const CUES = ['Cultivamos pistachos en tierra mediterránea.', 'Recogemos las aceitunas y prensamos el aceite en frío.', 'Vendimiamos las uvas para hacer vino y para tu mesa.', 'Del campo a tu mesa. Bienvenido a OlivaPistacho.'];
let vidLang = null, capUrl = null;
const vttTime = n => '00:' + String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0') + '.000';
function setupVideo() {
  $('#tr-text').textContent = CUES.map(c => t(c)).join(' ') + ' ' + t('El vídeo no tiene sonido: los subtítulos cuentan lo que se ve.');
  if (!vid || vidLang === lang) return;
  vidLang = lang;
  const vtt = 'WEBVTT\n\n' + CUES.map((c, i) => vttTime(i * 3) + ' --> ' + vttTime(i * 3 + 3) + '\n' + t(c) + '\n').join('\n');
  if (capUrl) URL.revokeObjectURL(capUrl);
  capUrl = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
  vid.querySelectorAll('track').forEach(x => x.remove());
  const tr = document.createElement('track');
  tr.kind = 'captions'; tr.label = L().name; tr.srclang = lang; tr.src = capUrl; tr.default = true;
  vid.appendChild(tr);
  tr.track.mode = 'showing';
}

/* ---------- 7. DIBUJADO ---------- */
let cat = 'todo', cur = 'home', pending = null, lastFocus = null;

function card(i) {
  const alc = i.alc;
  return `<article class="card c-${esc(i.c)}"><div class="card-img" aria-hidden="true">${esc(i.e)}</div><div class="card-body">
    <div class="tags"><span class="badge">${esc(t(CAT_LABEL[i.c] || 'Producto'))}</span>${alc ? `<span class="badge age">${esc(t('Solo mayores de 18 años'))}</span>` : ''}</div>
    <h3>${esc(nm(i))}</h3><p class="desc">${esc(ds(i))}</p><p class="price">${i.p ? fmt(i.p) : esc(t('Consultar'))}</p>
    ${i.p ? `<button type="button" class="btn btn-primary btn-sm" data-add="${i.id}" aria-label="${esc(t('Añadir al carrito') + ': ' + nm(i))}">${esc(t('Añadir al carrito'))}</button>`
          : `<button type="button" class="btn btn-outline btn-sm" data-info>${esc(t('Solicitar info'))}</button>`}
  </div></article>`;
}
const find = id => ALL.find(i => i.id === id);
const total = () => cart.reduce((s, c) => { const i = find(c.id); return s + (i ? i.p * c.qty : 0); }, 0);
const hasAlcohol = () => cart.some(c => { const i = find(c.id); return i && i.alc; });
const saveCart = () => ls.set('op_cart', cart);

function renderCatalog() {
  $('#g-feat').innerHTML = P.filter(p => p.f).map(card).join('');
  const list = cat === 'todo' ? P : P.filter(p => p.c === cat);
  $('#g-prod').innerHTML = list.map(card).join('');
  $('#g-serv').innerHTML = S.map(card).join('');
  $('#filters').innerHTML = ['todo', ...CATS].map(c => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${cat === c}">${esc(t(c === 'todo' ? 'Todo' : CAT_LABEL[c]))}</button>`).join('');
}
function renderBadge() {
  const n = cart.reduce((s, c) => s + c.qty, 0);
  $('#cc').textContent = n;
  $('#cartb').setAttribute('aria-label', t('Carrito: {0} artículos', n));
}
function renderCart() {
  cart = cart.filter(c => find(c.id));
  const el = $('#cart');
  if (!cart.length) {
    el.innerHTML = `<div class="empty"><p>${esc(t('Tu carrito está vacío'))}</p><a class="btn btn-primary" href="#productos">${esc(t('Ver productos'))}</a></div>`;
  } else {
    const arrow = L().dir === 'rtl' ? '←' : '→';
    el.innerHTML = `<div class="tw"><table><caption class="sr-only">${esc(t('Tu carrito'))}</caption><thead><tr><th scope="col">${esc(t('Producto'))}</th><th scope="col">${esc(t('Precio'))}</th><th scope="col">${esc(t('Cantidad'))}</th><th scope="col">${esc(t('Subtotal'))}</th><th scope="col"><span class="sr-only">${esc(t('Eliminar: {0}', ''))}</span></th></tr></thead><tbody>${cart.map(c => {
      const i = find(c.id), n = nm(i);
      return `<tr><td><span aria-hidden="true">${esc(i.e)}</span> ${esc(n)}</td><td>${fmt(i.p)}</td><td><button type="button" class="qb" data-q="${c.id}:-1" aria-label="${esc(t('Quitar uno: {0}', n))}">−</button> <span>${c.qty}</span> <button type="button" class="qb" data-q="${c.id}:1" aria-label="${esc(t('Añadir uno: {0}', n))}">+</button></td><td>${fmt(i.p * c.qty)}</td><td><button type="button" class="qb" data-q="${c.id}:-999" aria-label="${esc(t('Eliminar: {0}', n))}">✕</button></td></tr>`;
    }).join('')}</tbody></table></div><p class="tot">${esc(t('Total: {0}', fmt(total())))}</p><div style="text-align:end"><a class="btn btn-primary" href="#checkout">${esc(t('Proceder al pago'))} ${arrow}</a></div>`;
  }
  $('#co-tot').textContent = t('Total a pagar: {0}', fmt(total()));
  const alc = hasAlcohol();
  $('#age-box').hidden = !alc;
  $('#s-age').required = alc;
}
function renderRevs() {
  $('#revs').innerHTML = reviews.map(r => `<article class="box"><p class="stars" role="img" aria-label="${esc(t('{0} de 5 estrellas', r.stars))}">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</p><p>${esc(t(r.text))}</p><p class="desc">${esc(r.name)} · ${esc(r.date)}</p></article>`).join('');
}
function renderAdmin() {
  if (!user || user.role !== 'admin') return;
  let b = 0;
  const rows = [...moves].reverse().map(m => { b += m.type === 'ingreso' ? m.amount : -m.amount; return { ...m, b }; }).reverse();
  const ing = moves.filter(m => m.type === 'ingreso').reduce((s, m) => s + m.amount, 0);
  const gas = moves.filter(m => m.type === 'gasto').reduce((s, m) => s + m.amount, 0);
  $('#adm').innerHTML = `<div class="bal">Cuenta personal · Saldo disponible<b>${fmt(ing - gas)}</b></div>
  <div class="st"><div><b class="in">+${fmt(ing)}</b>Ingresos</div><div><b class="out">−${fmt(gas)}</b>Gastos</div><div><b>${orders.length}</b>Pedidos</div></div>
  <form class="box" id="xf"><h3>Comprar materiales / gastos</h3><br><div class="fg"><label for="x-c">Concepto</label><input id="x-c"></div><div class="fg"><label for="x-a">Importe (€)</label><input id="x-a" type="number" min="0.01" step="0.01" required></div><button class="btn btn-bad">Restar de la cuenta</button></form>
  <h3>Movimientos</h3><br><div class="tw"><table><thead><tr><th scope="col">Fecha</th><th scope="col">Concepto</th><th scope="col">Importe</th><th scope="col">Saldo</th></tr></thead><tbody>${rows.map(m => `<tr><td>${fdate(m.date)}</td><td>${esc(m.concept)}</td><td class="${m.type === 'ingreso' ? 'in' : 'out'}">${m.type === 'ingreso' ? 'Ingreso +' : 'Gasto −'}${fmt(m.amount)}</td><td>${fmt(m.b)}</td></tr>`).join('') || '<tr><td colspan="4">Sin movimientos</td></tr>'}</tbody></table></div>
  <h3>Pedidos</h3><br><div class="tw"><table><thead><tr><th scope="col">ID</th><th scope="col">Fecha</th><th scope="col">Cliente</th><th scope="col">Productos</th><th scope="col">Método</th><th scope="col">Total</th><th scope="col">Estado</th></tr></thead><tbody>${orders.map(o => `<tr><td>${esc(o.id)}</td><td>${fdate(o.date)}</td><td>${esc(o.customer)}<br>${esc(o.email)}</td><td>${o.items.map(i => `${i.q}× ${esc(i.n)}`).join('<br>')}</td><td>${esc(o.method)}</td><td>${fmt(o.total)}</td><td>${esc(o.estado)} ${o.estado === 'pendiente' ? `<button type="button" class="btn btn-sm btn-primary" data-pay="${o.rid}">Marcar pagado</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="7">Sin pedidos</td></tr>'}</tbody></table></div>`;
}
const SEC_TITLE = { productos: 'Productos', servicios: 'Servicios', carrito: 'Tu carrito', checkout: 'Finalizar compra', resenas: 'Reseñas de clientes', admin: 'Admin' };
function setTitle() {
  const base = t('OlivaPistacho | Pistachos, aceite, vino y uvas de nuestra finca');
  document.title = cur === 'home' ? base : t(SEC_TITLE[cur]) + ' · OlivaPistacho';
}
function renderAll() {
  const lg = L();
  document.documentElement.lang = lang;
  document.documentElement.dir = lg.dir;
  $('#lang').value = lang;
  $$('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  $$('[data-a]').forEach(e => e.setAttribute('aria-label', t(e.dataset.a)));
  renderCatalog(); renderBadge(); renderCart(); renderRevs(); renderAdmin(); setupVideo(); setTitle(); setTTS(ttsOn);
  $('#who').textContent = user ? (user.role === 'admin' ? '👑 Admin' : '👤 ' + user.name) : '';
  $('#authb').textContent = t(user ? 'Salir' : 'Entrar');
  $('#nav-admin').hidden = !(user && user.role === 'admin');
  $$('#r-stars option').forEach((o, i) => o.setAttribute('aria-label', t('{0} de 5 estrellas', 5 - i)));
}

/* ---------- avisos (se pueden cerrar y no desaparecen mientras los lees) ---------- */
function toast(k, ...a) {
  const m = t(k, ...a), el = $('#toast');
  $('#toast-t').textContent = m; el.hidden = false;
  const l = $('#live'); l.textContent = ''; setTimeout(() => { l.textContent = m; }, 60);
  try { navigator.vibrate && navigator.vibrate(150); } catch (e) {}
  clearTimeout(toast.h); toast.h = setTimeout(() => { el.hidden = true; }, 12000);
}

/* ---------- 8. NAVEGACIÓN (con #hash: funciona el botón «atrás») ---------- */
const VALID = ['home', 'productos', 'servicios', 'carrito', 'checkout', 'resenas', 'admin'];
const routeFromHash = () => { const id = (location.hash || '#home').slice(1); return VALID.includes(id) ? id : 'home'; };

function show(id, focus = true) {
  if (id === 'checkout' && !user) {
    if (cart.length) { openLogin('checkout'); toast('Para comprar necesitas iniciar sesión o crear una cuenta'); }
    if (location.hash !== '#carrito') history.replaceState(null, '', '#carrito');
    id = 'carrito';
  }
  if (id === 'admin' && !(user && user.role === 'admin')) {
    if (authReady) toast('Acceso denegado');
    history.replaceState(null, '', '#home'); id = 'home';
  }
  cur = id; stopTTS();
  $$('main>section').forEach(s => { s.hidden = s.id !== id; });
  $$('nav.main a, #cartb').forEach(a => a.dataset.nav === id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  if (id !== 'home' && vid) vid.pause();
  if (id === 'checkout' && user) {
    if (!$('#s-name').value) $('#s-name').value = user.name || '';
    if (!$('#s-mail').value && user.role !== 'admin') $('#s-mail').value = user.email;
  }
  if (id === 'admin') loadAdmin().then(renderAll);
  renderAll();
  if (focus) {
    const h = $('#' + id + ' h1,#' + id + ' h2');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    scrollTo(0, 0);
  }
}
window.addEventListener('hashchange', () => show(routeFromHash()));

/* ---------- inicio de sesión ---------- */
function openLogin(next) {
  pending = next || null; lastFocus = document.activeElement;
  $('#login').hidden = false; $('#lf').hidden = false; $('#rgf').hidden = true;
  $('#l-err').textContent = ''; $('#l-mail').focus();
}
function closeLogin() { $('#login').hidden = true; if (lastFocus) lastFocus.focus(); }
function done(name) {
  const n = pending; pending = null; $('#login').hidden = true;
  renderAll(); toast('Bienvenido/a, {0}', name);
  if (n) { if (location.hash !== '#' + n) location.hash = n; else show(n); }
}

/* ---------- 9. EVENTOS ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-add],[data-info],[data-q],[data-cat]');
  if (!a) return;
  if (a.dataset.cat) {
    cat = a.dataset.cat; renderCatalog();
    const n = cat === 'todo' ? P.length : P.filter(p => p.c === cat).length;
    $('#live').textContent = t('Mostrando {0} productos', n);
    const b = $(`[data-cat="${cat}"]`); if (b) b.focus();
    return;
  }
  if (a.dataset.info !== undefined) return toast('Contacta con nosotros para un presupuesto personalizado.');
  if (a.dataset.add) {
    const id = +a.dataset.add, c = cart.find(x => x.id === id);
    c ? c.qty++ : cart.push({ id, qty: 1 });
    saveCart(); renderBadge(); renderCart();            // sin repintar el catálogo: el foco no se pierde
    return toast('Añadido al carrito: {0}', nm(find(id)));
  }
  if (a.dataset.q) {
    const [id, d] = a.dataset.q.split(':').map(Number), c = cart.find(x => x.id === id);
    if (!c) return;
    c.qty += d; if (c.qty <= 0) cart = cart.filter(x => x.id !== id);
    saveCart(); renderBadge(); renderCart();
    const nx = $(`[data-q="${id}:1"]`) || $('#cart .btn') || $('#carrito h2');
    if (nx) { if (!nx.matches('a,button')) nx.tabIndex = -1; nx.focus(); }
  }
});

$('#authb').onclick = async () => {
  if (!user) return openLogin();
  if (sb) await sb.auth.signOut();
  user = null; orders = []; moves = [];
  if (cur === 'admin' || cur === 'checkout') location.hash = 'home'; else renderAll();
  toast('Sesión cerrada');
};
$('#l-x').onclick = () => { pending = null; closeLogin(); };
$('#to-reg').onclick = () => { $('#lf').hidden = true; $('#rgf').hidden = false; $('#g-name').focus(); };
$('#to-log').onclick = () => { $('#rgf').hidden = true; $('#lf').hidden = false; $('#l-mail').focus(); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#a11yp').hidden && $('#a11yp').contains(document.activeElement)) { $('#a11yp').hidden = true; $('#a11yb').setAttribute('aria-expanded', 'false'); $('#a11yb').focus(); }
  const l = $('#login'); if (l.hidden) return;
  if (e.key === 'Escape') { pending = null; closeLogin(); }
  if (e.key === 'Tab') {
    const f = $$('#login button:not([hidden]),#login input').filter(x => x.offsetParent), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});

$('#lf').onsubmit = async e => {
  e.preventDefault(); const er = $('#l-err'); er.textContent = '';
  if (!OK) return er.textContent = cfgMsg();
  const { data, error } = await sb.auth.signInWithPassword({ email: $('#l-mail').value.trim(), password: $('#l-pass').value });
  if (error) return er.textContent = /invalid/i.test(error.message) ? t('Correo o contraseña incorrectos') : netErr(error);
  await loadUser(data.session); await loadAdmin(); e.target.reset(); done(user.name);
};
$('#rgf').onsubmit = async e => {
  e.preventDefault(); const er = $('#g-err'); er.textContent = '';
  if (!OK) return er.textContent = cfgMsg();
  if ($('#g-p1').value !== $('#g-p2').value) return er.textContent = t('Las contraseñas no coinciden');
  const nombre = $('#g-name').value.trim();
  const { data, error } = await sb.auth.signUp({ email: $('#g-mail').value.trim(), password: $('#g-p1').value, options: { data: { nombre } } });
  if (error) return er.textContent = netErr(error);
  if (!data.session) return er.textContent = t('Revisa tu correo para confirmar la cuenta');
  await loadUser(data.session); e.target.reset(); done(nombre);
};
$('#co').onsubmit = async e => {
  e.preventDefault();
  if (!user) return openLogin('checkout');
  if (!cart.length) return (location.hash = 'carrito');
  if (hasAlcohol() && !$('#s-age').checked) { toast('Confirma que eres mayor de 18 años para comprar vino.'); return $('#s-age').focus(); }
  if (!OK) return toast(cfgMsg());
  const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true; const tt = total();
  const { data, error } = await sb.rpc('crear_pedido', {
    p_cliente: $('#s-name').value.trim(), p_email: $('#s-mail').value.trim(), p_direccion: $('#s-addr').value.trim(),
    p_telefono: $('#s-tel').value.trim(), p_metodo: $('input[name=pay]:checked').value,
    p_items: cart.map(c => ({ id: c.id, cantidad: c.qty })), p_mayor_edad: $('#s-age').checked
  });
  if (error) { btn.disabled = false; return toast(netErr(error)); }
  const metodo = $('input[name=pay]:checked').value;
  /* Pago con tarjeta mediante Stripe Checkout (página alojada por Stripe) */
  if (metodo === 'Tarjeta' && window.OP_CONFIG.STRIPE_ENABLED) {
    const { data: s, error: se } = await sb.functions.invoke('create-checkout-session', { body: { pedido_id: data } });
    if (se || !s || !s.url) {
      btn.disabled = false;
      cart = []; saveCart(); location.hash = 'home';
      return toast('Pedido {0} creado, pero no se pudo abrir el pago. Contacta con nosotros.', pad(data));
    }
    cart = []; saveCart();
    location.href = s.url;      // redirige a Stripe
    return;
  }
  btn.disabled = false;
  cart = []; saveCart(); e.target.reset(); location.hash = 'home';
  toast('Pedido {0} recibido. Total: {1}', pad(data), fmt(tt));
};
/* Vuelta desde Stripe */
(() => {
  const q = new URLSearchParams(location.search), r = q.get('pago');
  if (!r) return;
  history.replaceState(null, '', location.pathname + '#home');
  setTimeout(() => toast(r === 'ok' ? 'Pago recibido. ¡Gracias por tu pedido!' : 'Pago cancelado. Tu pedido queda pendiente.'), 600);
})();
$('#rf').onsubmit = async e => {
  e.preventDefault();
  if (!user) { openLogin('resenas'); return toast('Para publicar una reseña necesitas iniciar sesión'); }
  if (!OK) return toast(cfgMsg());
  const { error } = await sb.from('resenas').insert({ user_id: user.id, nombre: $('#r-name').value.trim() || user.name, estrellas: +$('#r-stars').value, texto: $('#r-text').value.trim() });
  if (error) return toast(netErr(error));
  e.target.reset(); await loadReviews(); renderAll(); toast('Reseña publicada. ¡Gracias!');
};
document.addEventListener('submit', async e => {
  if (e.target.id !== 'xf') return; e.preventDefault();
  const a = parseFloat($('#x-a').value);
  if (!(a > 0)) return toast('Importe no válido');
  const { error } = await sb.from('movimientos').insert({ tipo: 'gasto', concepto: $('#x-c').value.trim() || 'Gasto de materiales', importe: a });
  if (error) return toast(netErr(error));
  await loadAdmin(); renderAll();
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-pay]'); if (!b) return;
  const { error } = await sb.from('pedidos').update({ estado: 'pagado' }).eq('id', b.dataset.pay);
  if (error) return toast(netErr(error));
  await loadAdmin(); renderAll();
});

/* idioma */
$('#lang').innerHTML = LANGS.map(l => `<option value="${l.code}" lang="${l.code}">${l.name}</option>`).join('');
$('#lang').onchange = e => { lang = e.target.value; ls.set('op_lang', lang); stopTTS(); renderAll(); $('#live').textContent = L().name; };

/* accesibilidad */
$('#fs-').onclick = () => { pref.fs = Math.max(90, pref.fs - 10); applyPrefs(); };
$('#fs\\+').onclick = () => { pref.fs = Math.min(160, pref.fs + 10); applyPrefs(); };
$('#a11yb').onclick = () => {
  const p = $('#a11yp'), open = p.hidden; p.hidden = !open;
  $('#a11yb').setAttribute('aria-expanded', open);
  if (open) p.querySelector('input').focus();
};
document.addEventListener('change', e => {
  const k = e.target.dataset && e.target.dataset.pref; if (!k) return;
  pref[k] = e.target.checked; applyPrefs();
  if (k === 'rm' && pref.rm && vid) vid.pause();
});
$('#a11y-reset').onclick = () => { pref = PREF_DEF(); applyPrefs(); toast('Restablecer todo'); };
$('#tts').onclick = () => { ttsOn ? stopTTS() : startTTS(); };
$('#toast-x').onclick = () => { $('#toast').hidden = true; };
$('#toast').addEventListener('pointerenter', () => clearTimeout(toast.h));
$('#toast').addEventListener('focusin', () => clearTimeout(toast.h));
window.addEventListener('pagehide', stopTTS);

/* arranque */
applyPrefs();
show(routeFromHash(), false);
if (vid && !reduceMotion()) {
  // Vídeo corto, sin sonido, una sola vez. Con «reducir animaciones» no se inicia solo.
  const tryPlay = () => { if (cur === 'home') vid.play().catch(() => {}); };
  vid.readyState >= 2 ? tryPlay() : vid.addEventListener('loadeddata', tryPlay, { once: true });
}
if (OK) {
  loadCatalog(); loadReviews();
  sb.auth.onAuthStateChange((ev, session) => {
    setTimeout(async () => { await loadUser(session); await loadAdmin(); authReady = true; renderAll(); }, 0);
  });
}
})();
