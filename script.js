// ==========================================
// 1. BASES DE DATOS SIMULADAS (MOCK)
// ==========================================
let courses = [
  { id:1, title:"Inteligencia Artificial para universitarios", category:"Tecnología", price:19.99, instructor:"Equipo INNOVIX", icon:"🤖", color:"linear-gradient(135deg,#19192a,#644595)", description:"Aprende a usar IA para estudiar y organizar ideas." },
  { id:2, title:"Finanzas para emprender mientras estudias", category:"Finanzas", price:24.99, instructor:"Erick M.", icon:"💸", color:"linear-gradient(135deg,#173b2e,#27805d)", description:"Costos, flujo de caja y decisiones esenciales." },
  { id:3, title:"Copywriting y Ventas Digitales", category:"Negocios", price:15.99, instructor:"Cris", icon:"📱", color:"linear-gradient(135deg,#44232a,#a04d63)", description:"Narrativa y recursos visuales para contenido competitivo." },
  { id:4, title:"Productividad sin complicarte", category:"Tecnología", price:12.99, instructor:"Laura M.", icon:"⚡", color:"linear-gradient(135deg,#263b59,#497cb4)", description:"Crea sistemas de organización sostenibles." }
];

const categories = ["Todos","Tecnología","Finanzas","Negocios"];
let activeCategory = "Todos";
let catalogActiveCategory = "Todos";
let cart = [];
let purchasedCourses = []; 
let selectedCourse = null;
let observer;

// Variables de Sesión
let isLoggedIn = false;
let userRole = null; 
let loggedInUserName = "Usuario";


// ==========================================
// 2. LÓGICA DE SESIÓN Y UI DE NAVEGACIÓN
// ==========================================
function updateAuthUI() {
  const guestMenu = document.getElementById('guestMenu');
  const userMenu = document.getElementById('userMenu');
  const cartButton = document.getElementById('cartButton');
  
  if (!guestMenu || !userMenu || !cartButton) return;

  if (isLoggedIn) {
    guestMenu.classList.add('hidden');
    userMenu.classList.remove('hidden');
    
    document.getElementById('userNameDisplay').textContent = loggedInUserName;
    document.getElementById('userRoleDisplay').textContent = userRole === 'instructor' ? 'Instructor' : 'Estudiante';
    document.getElementById('dashboardLink').innerHTML = userRole === 'instructor' ? '📊 Panel Instructor' : '🎓 Panel Estudiante';
    
    const dashName = document.getElementById('dashStudentName');
    if(dashName) dashName.textContent = loggedInUserName;

    if (userRole === 'instructor') {
      cartButton.classList.add('hidden');
    } else {
      cartButton.classList.remove('hidden');
    }
  } else {
    guestMenu.classList.remove('hidden');
    userMenu.classList.add('hidden');
    cartButton.classList.remove('hidden'); 
  }
}

function toggleProfileMenu() {
  document.getElementById('profileDropdown').classList.toggle('show');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileDropdown');
  const btn = document.getElementById('profileBtn');
  if (menu && menu.classList.contains('show') && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('show');
  }
});

function logout() {
  // 1. Limpiamos toda la memoria de la sesión
  isLoggedIn = false;
  userRole = null;
  loggedInUserName = "Usuario";
  cart = []; 
  purchasedCourses = []; // Vaciamos el aula virtual para la próxima demo
  
  // 2. Actualizamos la barra superior y vaciamos el carrito visual
  renderCart();
  updateAuthUI();
  
  // 3. LA CLAVE: Redirigimos forzosamente a la vista de inicio
  goHome(); 
  
  // 4. Despedida
  showToast("Has cerrado sesión. ¡Vuelve pronto! 👋");
}

function updateProfile(e, inputId) {
  e.preventDefault();
  const newName = document.getElementById(inputId).value;
  loggedInUserName = newName || "Usuario";
  updateAuthUI();
  showToast("Datos actualizados correctamente ✅");
}

// ==========================================
// 3. REGISTRO Y LOGIN
// ==========================================
let usersDB = []; // Nuestra base de datos simulada en memoria

function openLogin(){ openModal("loginModal"); }
function openRegister(){ openModal("registerModal"); }

function fakeLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  
  // Buscamos si el usuario se registró en esta sesión
  const user = usersDB.find(u => u.email === email);
  
  if (user) {
    userRole = user.role;
    loggedInUserName = user.name;
  } else {
    // Truco para demos rápidas: Si el correo inventado contiene "instructor", le damos ese rol.
    userRole = email.includes('instructor') ? 'instructor' : 'estudiante';
    loggedInUserName = "Usuario Demo";
  }

  isLoggedIn = true;
  closeModal('loginModal');
  e.target.reset();
  updateAuthUI();
  
  showToast("¡Bienvenido de vuelta, " + loggedInUserName + "! 🚀");
  
  // Redirigimos automáticamente a su panel
  setTimeout(() => { goToDashboard(); }, 500);
}

function setRole(role) {
  userRole = role; 
  document.getElementById('step1Role').classList.add('hidden');
  document.getElementById('step2Form').classList.remove('hidden');
  
  const badge = document.getElementById('selectedRoleBadge');
  badge.textContent = role === 'estudiante' ? '🎓 Perfil Estudiante' : '🎥 Perfil Instructor';
  badge.style.background = role === 'estudiante' ? 'var(--brand-light)' : '#e6f4ea';
  badge.style.color = role === 'estudiante' ? 'var(--brand-dark)' : '#137333';
}

function backToRoles() {
  document.getElementById('step2Form').classList.add('hidden');
  document.getElementById('step1Role').classList.remove('hidden');
}

function fakeRegister(e) {
  e.preventDefault();
  const pass1 = document.getElementById('regPass1').value;
  const pass2 = document.getElementById('regPass2').value;
  const email = document.getElementById('regEmail').value;
  const name = document.getElementById('regName').value || "Nuevo Usuario";
  const errorText = document.getElementById('passError');

  if (pass1 !== pass2) {
    errorText.style.display = 'block';
    return;
  }
  errorText.style.display = 'none';
  
  isLoggedIn = true;
  loggedInUserName = name;
  const finalRole = userRole || 'estudiante'; 
  userRole = finalRole; 

  // GUARDAMOS AL USUARIO EN NUESTRA BASE DE DATOS SIMULADA
  usersDB.push({ email: email, name: name, role: finalRole });

  closeModal('registerModal');
  e.target.reset(); 
  document.getElementById('step2Form').classList.add('hidden');
  document.getElementById('step1Role').classList.remove('hidden');
  
  updateAuthUI(); 
  showToast("¡Cuenta creada exitosamente! 🎉");

  setTimeout(() => { goToDashboard(); }, 1000); 
}

// ==========================================
// 4. SISTEMA DE RUTAS (SPA) Y PANELES
// ==========================================
function hideAllViews() {
  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('catalogView').classList.add('hidden');
  document.getElementById('studentView').classList.add('hidden');
  document.getElementById('instructorView').classList.add('hidden');
  
  const checkout = document.getElementById('checkoutView');
  if(checkout) checkout.classList.add('hidden');
  
  // Ocultamos el aula virtual
  const classroom = document.getElementById('classroomView');
  if(classroom) classroom.classList.add('hidden');
}

function goHome() {
  hideAllViews(); 
  document.getElementById('homeView').classList.remove('hidden'); 
  const curve = document.querySelector('.footer-curve');
  if(curve) curve.style.backgroundColor = 'var(--ink)'; 
  window.scrollTo(0, 0);
}

function goToCatalog() {
  hideAllViews();
  document.getElementById('catalogView').classList.remove('hidden');
  const curve = document.querySelector('.footer-curve');
  if(curve) curve.style.backgroundColor = 'var(--bg)'; 
  window.scrollTo(0, 0);
  renderCatalog(); 
}

function goToDashboard() {
  hideAllViews();
  const curve = document.querySelector('.footer-curve');
  if(curve) curve.style.backgroundColor = 'var(--bg)'; 
  
  if (userRole === 'instructor') {
    document.getElementById('instructorView').classList.remove('hidden');
    showDashboard(); 
    renderInstructorCourses();
  } else {
    document.getElementById('studentView').classList.remove('hidden');
    showStudentDash(); 
    renderStudentCourses();
  }
  window.scrollTo(0, 0);
}

function goToProfile() {
  goToDashboard();
  if (userRole === 'instructor') {
    showInstructorProfile();
  } else {
    showStudentProfile();
  }
}

// Ruta hacia la página de pago
function goToCheckout() {
  if(!cart.length) {
    showToast("Tu carrito está vacío 🛒");
    return;
  }
  
  hideAllViews();
  document.getElementById('checkoutView').classList.remove('hidden');
  const curve = document.querySelector('.footer-curve');
  if(curve) curve.style.backgroundColor = 'var(--bg)'; 
  
  window.scrollTo(0, 0);
  toggleCart(); // Cierra el cajón lateral del carrito
  renderCheckout(); // Dibuja los cursos en el resumen
}

// Ruta hacia el Aula Virtual
function openClassroom(id) {
  // Buscamos el curso que el estudiante quiere ver
  const course = purchasedCourses.find(c => c.id === id);
  if(!course) return; // Si hay un error, no hacemos nada
  
  // Llenamos los datos dinámicos
  document.getElementById("classroomCourseTitle").textContent = course.title;
  document.getElementById("classroomInstructor").textContent = course.instructor;
  
  // Cambiamos de pantalla
  hideAllViews();
  document.getElementById('classroomView').classList.remove('hidden');
  
  // Ajustes visuales de fondo
  const curve = document.querySelector('.footer-curve');
  if(curve) curve.style.backgroundColor = 'var(--bg)'; 
  window.scrollTo(0, 0);
}

// ==========================================
// 5. RENDERIZADO DE CURSOS (INICIO Y CATÁLOGO)
// ==========================================
function renderCategories(){
  const box = document.getElementById("categories");
  if(!box) return;
  box.innerHTML = categories.map(cat => `
    <button class="chip ${cat === activeCategory ? "active" : ""}" onclick="activeCategory='${cat}'; renderCategories(); renderCourses();">${cat}</button>
  `).join("");
}

function renderCourses(){
  const searchInput = document.getElementById("searchInput");
  const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const list = courses.filter(c => (activeCategory === "Todos" || c.category === activeCategory) && (!q || `${c.title} ${c.instructor}`.toLowerCase().includes(q)));

  const grid = document.getElementById("courseGrid");
  const resultsLabel = document.getElementById("resultsLabel");
  if(resultsLabel) resultsLabel.textContent = `${list.length} curso(s)`;
  if(!grid) return;
  
  if(!list.length){
    grid.innerHTML = `<div style="grid-column:1/-1; padding:30px; text-align:center; background:#fff; border-radius:12px;">No se encontraron cursos.</div>`;
    return;
  }

  grid.innerHTML = list.map((c, index) => `
    <article class="course-card reveal" style="transition-delay: ${index * 0.1}s" onclick="openCourse(${c.id})">
      <div class="course-cover" style="background:${c.color}">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3>${c.title}</h3>
        <p class="muted" style="font-size:14px; margin:0 0 10px">${c.instructor}</p>
        <div class="course-footer">
          <span class="price">$${c.price.toFixed(2)}</span>
          <button class="btn btn-outline" onclick="event.stopPropagation();addToCart(${c.id})">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");

  if(observer) document.querySelectorAll('#courseGrid .reveal').forEach(el => observer.observe(el));
}

function filterCatalog(category) {
  catalogActiveCategory = category;
  renderCatalog();
}

function renderCatalog() {
  const searchInput = document.getElementById("catalogSearch");
  const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const list = courses.filter(c => (catalogActiveCategory === "Todos" || c.category === catalogActiveCategory) && (!q || `${c.title} ${c.instructor}`.toLowerCase().includes(q)));

  const grid = document.getElementById("catalogGrid");
  const label = document.getElementById("catalogResultsLabel");
  if(label) label.textContent = `${list.length} cursos encontrados`;
  if(!grid) return;
  
  if(!list.length){
    grid.innerHTML = `<div style="grid-column:1/-1; padding:50px; text-align:center; background:#fff; border-radius:var(--radius); border:1px solid var(--border);">No encontramos cursos con esos filtros.</div>`;
    return;
  }

  grid.innerHTML = list.map((c, index) => `
    <article class="course-card" style="animation: fadeInFast 0.3s ease forwards; animation-delay: ${index * 0.05}s; opacity: 0;" onclick="openCourse(${c.id})">
      <div class="course-cover" style="background:${c.color}">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3>${c.title}</h3>
        <p class="muted" style="font-size:14px; margin:0 0 10px">${c.instructor}</p>
        <div class="course-footer">
          <span class="price">$${c.price.toFixed(2)}</span>
          <button class="btn btn-outline" onclick="event.stopPropagation();addToCart(${c.id})">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");
}

// ==========================================
// 6. CARRITO Y COMPRAS (CHECKOUT)
// ==========================================
function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

document.querySelectorAll(".modal-backdrop").forEach(b => {
  b.addEventListener("click", e => { if(e.target === b) b.classList.remove("show"); });
});

function openCourse(id){
  selectedCourse = courses.find(c => c.id === id);
  document.getElementById("modalCourseTitle").textContent = selectedCourse.title;
  document.getElementById("modalCourseCategory").textContent = selectedCourse.category;
  document.getElementById("modalCourseDescription").textContent = selectedCourse.description;
  document.getElementById("modalCourseInstructor").textContent = selectedCourse.instructor;
  document.getElementById("modalCoursePrice").textContent = `$${selectedCourse.price.toFixed(2)}`;
  document.getElementById("modalCourseCover").style.background = selectedCourse.color;
  document.getElementById("modalCourseCover").innerHTML = selectedCourse.icon;
  
  document.getElementById("addCartBtn").onclick = () => { addToCart(selectedCourse.id); closeModal("courseModal"); };
  openModal("courseModal");
}

function toggleCart() { document.getElementById("cartDrawer").classList.toggle("show"); }

function addToCart(id){
  if (!isLoggedIn) {
    showToast("Debes iniciar sesión para comprar 🔒");
    openRegister();
    return;
  }
  if (userRole === 'instructor') {
    showToast("Los instructores no pueden comprar cursos.");
    return;
  }
  
  if(purchasedCourses.some(item => item.id === id)){ 
    showToast("Ya compraste este curso. Búscalo en tu Panel."); 
    return; 
  }

  const course = courses.find(c => c.id === id);
  if(cart.some(item => item.id === id)){ 
    showToast("Ya está en tu carrito."); 
    document.getElementById("cartDrawer").classList.add("show");
    return; 
  }
  
  cart.push(course);
  renderCart();
  document.getElementById("cartDrawer").classList.add("show");
  showToast("Añadido al carrito 🛒");
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function renderCart(){
  const box = document.getElementById("cartItems");
  const total = cart.reduce((s, i) => s + i.price, 0);
  
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");
  
  if(cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
  if(cartCountEl) cartCountEl.textContent = cart.length;
  if(!box) return;
  
  if(!cart.length){
    box.innerHTML = `<p class="muted">El carrito está vacío.</p>`;
    return;
  }
  
  box.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-mini" style="background:${i.color}">${i.icon}</div>
      <div><b>${i.title}</b><div class="muted">$${i.price.toFixed(2)}</div></div>
      <button class="close-btn" style="width:30px;height:30px;font-size:14px" onclick="removeFromCart(${i.id})">✕</button>
    </div>
  `).join("");
}

// Dibuja el resumen de los cursos en la página de Checkout
function renderCheckout() {
  const box = document.getElementById("checkoutItems");
  const totalEl = document.getElementById("checkoutTotal");
  const btnFinal = document.getElementById("btnPagarFinal");
  
  const total = cart.reduce((s, i) => s + i.price, 0);
  
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (btnFinal) btnFinal.textContent = `Pagar $${total.toFixed(2)}`;
  
  if (!box) return;
  box.innerHTML = cart.map(i => `
    <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
      <div style="width: 45px; height: 45px; border-radius: 8px; background: ${i.color}; display: grid; place-items: center; font-size: 18px;">${i.icon}</div>
      <div style="flex: 1;">
        <b style="font-size: 14px; display: block;">${i.title}</b>
      </div>
      <b style="font-size: 15px;">$${i.price.toFixed(2)}</b>
    </div>
  `).join("");
}

// Procesa el formulario de la tarjeta simulada
function processPayment(e) {
  e.preventDefault();
  
  const btn = document.getElementById("btnPagarFinal");
  const originalText = btn.textContent;
  
  // Efecto visual de carga
  btn.textContent = "Procesando pago...";
  btn.disabled = true;
  btn.style.opacity = "0.7";
  
  // Simulamos un retraso de 1.5 segundos (como si consultara un banco)
  setTimeout(() => {
    purchasedCourses = [...purchasedCourses, ...cart];
    cart = []; 
    renderCart(); 
    
    showToast("¡Pago exitoso! Bienvenido a tu aula 🎉");
    
    // Restaurar botón (por si vuelve a comprar en el futuro)
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = "1";
    
    // Lo enviamos a su dashboard para ver lo que acaba de comprar
    goToDashboard();
  }, 1500);
}


// ==========================================
// 7. PANELES INTERNOS DE LOS DASHBOARDS
// ==========================================

// Dash Estudiante
function showStudentDash() {
  document.getElementById("studentDashContent").classList.remove("hidden");
  document.getElementById("studentProfileContent").classList.add("hidden");
}

function showStudentProfile() {
  document.getElementById("studentDashContent").classList.add("hidden");
  document.getElementById("studentProfileContent").classList.remove("hidden");
  document.getElementById("studentNameInput").value = loggedInUserName;
}

function renderStudentCourses() {
  const grid = document.getElementById("purchasedCoursesGrid");
  if (!grid) return;

  if (!purchasedCourses.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; padding:40px; text-align:center; background:var(--surface-2); border-radius:12px; border:2px dashed var(--border);">
        <div style="font-size: 40px; margin-bottom:15px;">🎒</div>
        <h4 style="margin:0 0 10px;">Aún no tienes cursos</h4>
        <p class="muted" style="margin-bottom:20px;">Explora el catálogo y empieza a aprender hoy mismo.</p>
        <button class="btn btn-primary" onclick="goToCatalog()">Ver Catálogo</button>
      </div>`;
    return;
  }

  // AQUI ESTÁ EL CAMBIO CORREGIDO: Llama a openClassroom() en lugar del alert()
  grid.innerHTML = purchasedCourses.map(c => `
    <article class="course-card" style="cursor: default;">
      <div class="course-cover" style="background:${c.color}">${c.icon}</div>
      <div class="course-body">
        <span class="course-badge">${c.category}</span>
        <h3 style="font-size: 16px;">${c.title}</h3>
        <p class="muted" style="font-size:13px; margin:0 0 15px">${c.instructor}</p>
        <div class="course-footer" style="padding-top:10px; justify-content:center;">
          <button class="btn btn-primary" style="width:100%;" onclick="openClassroom(${c.id})">▶ Ver Clases</button>
        </div>
      </div>
    </article>
  `).join("");
}

// Dash Instructor
function showDashboard(){ 
  document.getElementById("createCoursePanel").classList.add("hidden"); 
  document.getElementById("instructorProfilePanel").classList.add("hidden"); 
  document.getElementById("dashboardSummary").classList.remove("hidden"); 
}

function showCreateCourse(){ 
  document.getElementById("dashboardSummary").classList.add("hidden"); 
  document.getElementById("instructorProfilePanel").classList.add("hidden"); 
  document.getElementById("createCoursePanel").classList.remove("hidden"); 
}

function showInstructorProfile(){ 
  document.getElementById("dashboardSummary").classList.add("hidden"); 
  document.getElementById("createCoursePanel").classList.add("hidden"); 
  document.getElementById("instructorProfilePanel").classList.remove("hidden"); 
  document.getElementById("instructorNameInput").value = loggedInUserName;
}

function renderInstructorCourses(){
  const rows = document.getElementById("instructorCourseRows");
  if(rows) {
    rows.innerHTML = courses.slice(0,3).map((c, i) => `
      <tr>
        <td style="padding:15px; border-bottom:1px solid var(--border);"><b>${c.title}</b></td>
        <td style="padding:15px; border-bottom:1px solid var(--border);">$${c.price.toFixed(2)}</td>
        <td style="padding:15px; border-bottom:1px solid var(--border); color:var(--brand); font-weight:bold;">${15 - i*3}</td>
      </tr>
    `).join("");
  }
}

function createCourse(e){
  e.preventDefault();
  const cat = document.getElementById("newCategory").value;
  courses.unshift({
    id: Date.now(),
    title: document.getElementById("newTitle").value,
    category: cat,
    price: Number(document.getElementById("newPrice").value),
    instructor: loggedInUserName,
    icon: "🎓",
    color: "linear-gradient(135deg,#201b36,#644595)",
    description: document.getElementById("newDescription").value
  });
  e.target.reset();
  
  renderCategories(); 
  renderCourses(); 
  renderInstructorCourses();
  
  showDashboard(); 
  showToast("Curso publicado en el catálogo con éxito 🎉");
}


// ==========================================
// UTILIDADES: NOTIFICACIONES (TOASTS)
// ==========================================
function showToast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg; 
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}


// ==========================================
// 8. INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburgerBtn.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
    });
  }

  window.closeNav = function() {
    if(navMenu) navMenu.classList.remove('active');
    if(hamburgerBtn) hamburgerBtn.innerHTML = '☰';
  };

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", renderCourses);

  observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  updateAuthUI();
  renderCategories();
  renderCourses();
  renderCart();
});