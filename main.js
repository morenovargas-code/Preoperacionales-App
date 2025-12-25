import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
    collection, addDoc, serverTimestamp, query, where, orderBy, 
    getDocs, doc, getDoc, getFirestore 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlO-XhUuitM6QN6cpam3SkeqpGcktFbWw",
    authDomain: "fir-app-tuto-d20d5.firebaseapp.com",
    projectId: "fir-app-tuto-d20d5",
    storageBucket: "fir-app-tuto-d20d5.firebasestorage.app",
    messagingSenderId: "754290122904",
    appId: "1:754290122904:web:d543ae6297e15f9f0930ed"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ELEMENTOS */
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");
const loggedInElements = document.querySelectorAll(".logged-in");
const loggedOutElements = document.querySelectorAll(".logged-out");

/* VARIABLES GLOBALES */
window.ipeActivo = "IPE Default";
window.operadorActivo = null;
window.tipoLinea = null;
window.coleccion = null;
window.inspeccionActualId = null;
window.inspeccionActualData = null;

const hamburger = document.getElementById("hamburger");

  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("active");
 });

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
    if (user) {
        loggedInElements.forEach(el => el.classList.remove("hidden"));
        

        window.operadorActivo = user.email;
        mostrarDashboard(); cerrarSidebarEnMovil();
    } else {
        loggedInElements.forEach(el => el.classList.add("hidden"));
        
        window.operadorActivo = null;
        window.inspeccionActualId = null;
        window.inspeccionActualData = null;

        mostrarLogin(); // 👈 CLAVE
    }
});

/* ================= MODALES AUTH ================= */
document.getElementById("ingresar-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("ingresar-email").value;
    const password = document.getElementById("ingresar-password").value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        bootstrap.Modal.getInstance(document.getElementById("IngresarModal")).hide();
        Toastify({ text: "✅ Bienvenido!", duration: 3000, gravity: "top", backgroundColor: "green" }).showToast();
    } catch (error) {
        Toastify({ text: `Error: ${error.message}`, duration: 4000, gravity: "top", backgroundColor: "red" }).showToast();
    }
});

document.getElementById("registrarse-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registrarse-email").value;
    const password = document.getElementById("registrarse-password").value;
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        bootstrap.Modal.getInstance(document.getElementById("RegistrarseModal")).hide();
        Toastify({ text: "✅ Usuario creado!", duration: 3000, gravity: "top", backgroundColor: "green" }).showToast();
    } catch (error) {
        Toastify({ text: `Error: ${error.message}`, duration: 4000, gravity: "top", backgroundColor: "red" }).showToast();
    }
});

document.getElementById("salida").onclick = () => signOut(auth);

/* ================= SIDEBAR ================= */
document.querySelectorAll(".list-group-item").forEach(item => {
    item.addEventListener("click", () => {
        ejecutarAccionSidebar(item.dataset.action);
    });
});

function ejecutarAccionSidebar(accion) {

    document.querySelectorAll(".list-group-item")
        .forEach(el => el.classList.remove("active"));

    const activo = document.querySelector(`[data-action="${accion}"]`);
    activo?.classList.add("active");

    if (accion === "dashboard") mostrarDashboard();
    else if (accion === "preoperacional") mostrarMenuPreoperacional();
    else if (accion === "equipos") mostrarEquipos();
    else if (accion === "reportes") mostrarReportes();

    // 🔥 CIERRA SIDEBAR EN MÓVIL
    if (window.innerWidth <= 992) {
        sidebar.classList.remove("active");
    }
}


/* ================= DASHBOARD ================= */
// ✅ Bienvenida glass premium
function mostrarDashboard() {
    mainContent.innerHTML = `
        <section class="dashboard-hero">
            <div class="hero-card">
                <div class="hero-icon">
                    <i class="bi bi-clipboard-check"></i>
                </div>

                <h2 class="hero-title">
                    Bienvenido,<br>
                    <span>${window.operadorActivo}</span>
                </h2>

                <p class="hero-subtitle">
                    Selecciona una opción del menú lateral para comenzar
                </p>
            </div>
        </section>
    `;
}

/* ================= PREOPERACIONAL ================= */
function mostrarMenuPreoperacional() {
    const main = document.getElementById("main-content");
    main.style.zIndex = "1";
    mainContent.innerHTML = `
        <button class="btn btn-outline-secondary mb-4" onclick="mostrarDashboard()"><i class="bi bi-arrow-left"></i> Dashboard</button>
        <h2 class="mb-5 text-info"><i class="bi bi-clipboard-check"></i> Preoperacional</h2>
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card border-warning h-100 p-5 text-center preop-item" id="amarilla" style="cursor:pointer; transition: all 0.3s;">
                    <i class="bi bi-gear-fill fs-1 mb-4 text-warning"></i>
                    <h3>Línea Amarilla</h3>
                    <p class="text-muted lead">Maquinaria pesada</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-info h-100 p-5 text-center preop-item" id="blanca" style="cursor:pointer; transition: all 0.3s;">
                    <i class="bi bi-truck fs-1 mb-4 text-info"></i>
                    <h3>Línea Blanca</h3>
                    <p class="text-muted lead">Vehículos</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById("amarilla").onclick = () => iniciarPreoperacional("amarilla");
    document.getElementById("blanca").onclick = () => iniciarPreoperacional("blanca");
}

function iniciarPreoperacional(tipo) {
    window.tipoLinea = tipo;
    window.coleccion = tipo === "amarilla" ? "inspecciones_linea_amarilla" : "inspecciones_linea_blanca";

    renderFormularioPreoperacional({
        titulo: `Preoperacional – Línea ${tipo === "amarilla" ? "Amarilla" : "Blanca"}`,
        checklistHTML: tipo === "amarilla" ? crearChecklistLineaAmarilla() : crearChecklistLineaBlanca()
    });
}

/* ================= FORMULARIO PREOPERACIONAL ================= */
function renderFormularioPreoperacional({ titulo, checklistHTML }) {
    mainContent.innerHTML = `
        <button class="btn btn-outline-secondary mb-4" id="volver"><i class="bi bi-arrow-left"></i> Volver</button>
        <h2 class="mb-4">${titulo}</h2>

        <div class="status-bar mb-4">
      <div class="status-item">
        <i class="bi bi-person-circle"></i>
        <span class="label">Operador</span>
        <span class="value">${window.operadorActivo || "—"}</span>
      </div>

     <div class="status-divider"></div>

     <div class="status-item">
        <i class="bi bi-tools"></i>
        <span class="label">IPE</span>
        <span class="value">${window.ipeActivo || "—"}</span>
      </div>
     </div>


        <div class="card bg-dark text-light border-0 mb-4 p-4 rounded-4 shadow">
            <h5 class="text-info mb-4"><i class="bi bi-info-circle"></i> Datos del equipo</h5>
            <div class="row g-3">
                <div class="col-md-4">
                    <input id="cema" class="form-control form-control-lg" placeholder="CEMA *" required>
                </div>
                <div class="col-md-4">
                    <input id="comeq" class="form-control form-control-lg" placeholder="COMEQ">
                </div>
                <div class="col-md-4">
                    <select id="tipo-equipo" class="form-select form-select-lg" required>
                        <option value="">Tipo *</option>
                        <option>Excavadora</option>
                        <option>Camión</option>
                        <option>Motoniveladora</option>
                        <option>Volqueta</option>
                        <option>Retroexcavadora</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <input id="horometro" class="form-control" placeholder="Horómetro">
                </div>
                <div class="col-md-6">
                    <input id="ubicacion" class="form-control" placeholder="Ubicación">
                </div>
            </div>
        </div>

        <div class="card bg-dark text-light border-0 mb-4 p-4 rounded-4 shadow">
            <h5 class="text-warning mb-4"><i class="bi bi-list-check"></i> Checklist</h5>
            <div style="max-height: 450px; overflow: auto;">
                ${checklistHTML}
            </div>
        </div>

        <div class="card bg-dark text-light border-0 mb-4 p-4 rounded-4 shadow">
            <h5 class="text-info mb-3"><i class="bi bi-chat-text"></i> Observaciones</h5>
            <textarea id="observaciones" class="form-control" rows="4" placeholder="Observaciones adicionales..."></textarea>
        </div>

        <div id="post-guardar" class="d-none mb-4">
            <div class="row g-3">
                <div class="col-md-6">
                    <button id="exportar-pdf" class="btn btn-outline-light btn-lg w-100 h-100">
                        <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                    </button>
                </div>
                <div class="col-md-6">
                    <button id="ver-historial" class="btn btn-outline-info btn-lg w-100 h-100">
                        <i class="bi bi-clock-history"></i> Ver historial
                    </button>
                </div>
            </div>
        </div>

        <button id="guardar-inspeccion" class="btn btn-primary btn-lg w-100 py-3 fs-5">
            <i class="bi bi-save"></i> 💾 Guardar Inspección
        </button>
    `;

    document.getElementById("volver").onclick = mostrarMenuPreoperacional;
    document.getElementById("guardar-inspeccion").onclick = guardarInspeccion;
}

/* ================= CHECKLISTS ================= */
function crearChecklist(items) {
    return items.map(item => {
        const n = item
            .toLowerCase()
            .replace(/[^\w\s]/g, "_")
            .replace(/\s+/g, "_");

        return `
        <div class="d-flex justify-content-between align-items-center checklist-item py-3 border-bottom border-secondary border-opacity-25">

            <div class="checklist-text">
                ${item}
            </div>

            <div class="btn-group btn-group-sm checklist-actions" role="group">

                <input class="btn-check" type="radio" name="${n}" id="${n}_b" value="B">
                <label class="btn btn-outline-success d-flex align-items-center gap-1"
                       for="${n}_b">
                    <i class="bi bi-check-lg"></i>
                    <span>B</span>
                </label>

                <input class="btn-check" type="radio" name="${n}" id="${n}_m" value="M">
                <label class="btn btn-outline-danger d-flex align-items-center gap-1"
                       for="${n}_m">
                    <i class="bi bi-x-lg"></i>
                    <span>M</span>
                </label>

                <input class="btn-check" type="radio" name="${n}" id="${n}_na" value="NA">
                <label class="btn btn-outline-secondary d-flex align-items-center gap-1"
                       for="${n}_na">
                    <span>N/A</span>
                </label>

            </div>
        </div>`;
    }).join("");
}

function crearChecklistLineaAmarilla() {
    return crearChecklist([
        "Motor (nivel de fluidos, soportes, correas, fugas)",
        "Radiador (nivel, ventilador, fugas)",
        "Dirección (botellas hidráulicas, terminales, fugas)",
        "Tanques de combustible (abrazaderas, soportes, fugas)",
        "Tanque hidráulico (nivel, soportes, fugas)",
        "Baterías (bornes y cables)",
        "Exosto (soportes y escapes)",
        "Llantas (labrado, presión, pernos)",
        "Luces delanteras",
        "Luces traseras",
        "Direccionales",
        "Alarma de reversa",
        "Frenos de servicio",
        "Freno de emergencia",
        "Escaleras y pasamanos",
        "Cinturón de seguridad",
        "Pito / bocina",
        "Limpia brisas",
        "Parada de emergencia",
        "Orugas / zapatas",
        "Fugas hidráulicas generales",
        "Tablero de instrumentos",
        "Equipo de seguridad",
        "Desinfección interna"
    ]);
}

function crearChecklistLineaBlanca() {
    return crearChecklist([
        "Documentos (Licencia de tránsito, SOAT, Revisión Tecnicomecánica)",
        "Tarjeta de Operación y Extracto de Contrato",
        "Motor (Nivel de fluido, estado de soportes y correas, control de fugas)",
        "Radiador (Nivel de líquido, estado de ventilador, control de fugas)",
        "Dirección (Nivel de fluido, estado de terminales, control de fugas)",
        "Tanques de combustible (Estado de Abrazaderas y Soportes)",
        "Tanque hidráulico (Nivel de aceite, estado abrazadera, control de fugas)",
        "Baterías (Estado de Bornes y cables)",
        "Llantas (Estado de labrado, presión de inflado, pernos)",
        "Luces (Frontales, Direccionales, Frenado, Reverso)",
        "Frenos (de Servicio y Parada o emergencia)",
        "Espejos retrovisores",
        "Cinturones de seguridad",
        "Pitos (Delantero y Reverso)",
        "Limpia brisas",
        "Tablero de Instrumentos",
        "Kit de Carretera",
        "Desinfección interna"
    ]);
}

/* ================= GUARDAR INSPECCIÓN ================= */
async function guardarInspeccion() {
    try {
        const checklist = {};
        document.querySelectorAll("input[type=radio]:checked").forEach(r => checklist[r.name] = r.value);

        const cemaEl = document.getElementById("cema");
        const tipoEl = document.getElementById("tipo-equipo");
        const comeqEl = document.getElementById("comeq");
        const horometroEl = document.getElementById("horometro");
        const ubicacionEl = document.getElementById("ubicacion");
        const obsEl = document.getElementById("observaciones");

        if (!cemaEl.value.trim()) {
            Toastify({ text: "❌ Campo CEMA es obligatorio", duration: 3000, gravity: "top", backgroundColor: "orange" }).showToast();
            cemaEl.focus();
            return;
        }
        if (!tipoEl.value) {
            Toastify({ text: "❌ Seleccione tipo de equipo", duration: 3000, gravity: "top", backgroundColor: "orange" }).showToast();
            tipoEl.focus();
            return;
        }
        if (Object.keys(checklist).length === 0) {
            Toastify({ text: "❌ Complete al menos algunos ítems del checklist", duration: 3000, gravity: "top", backgroundColor: "orange" }).showToast();
            return;
        }

        document.getElementById("guardar-inspeccion").innerHTML = '<i class="bi bi-hourglass-split spinner-border spinner-border-sm me-2"></i> Guardando...';

        const data = {
            equipo: {
                cema: cemaEl.value.trim(),
                comeq: comeqEl.value.trim() || "—",
                tipo: tipoEl.value,
                horometro: horometroEl.value.trim() || "—",
                ubicacion: ubicacionEl.value.trim() || "—"
            },
            operador: window.operadorActivo,
            ipe: window.ipeActivo || "—",
            checklist,
            observaciones: obsEl.value.trim() || "Sin observaciones",
            fecha: serverTimestamp(),
            tipoLinea: window.tipoLinea
        };

        const ref = await addDoc(collection(db, window.coleccion), data);
        window.inspeccionActualId = ref.id;
        window.inspeccionActualData = data;

        ocultarFormularioYMostrarAcciones(cemaEl.value);
        Toastify({ text: "✅ Inspección guardada correctamente", duration: 3000, gravity: "top", backgroundColor: "green" }).showToast();
    } catch (error) {
        console.error('Error guardando:', error);
        Toastify({ text: `Error: ${error.message}`, duration: 5000, gravity: "top", backgroundColor: "red" }).showToast();
    }
}

/* ================= POST-GUARDADO ================= */
function ocultarFormularioYMostrarAcciones(cema) {
    document.querySelectorAll(".card.bg-dark").forEach(c => c.classList.add("d-none"));
    document.getElementById("guardar-inspeccion").classList.add("d-none");
    document.getElementById("post-guardar").classList.remove("d-none");

    document.getElementById("exportar-pdf").onclick = () => generarPDF();
    document.getElementById("ver-historial").onclick = () => verHistorialEquipo(cema);
}

// ✅ FIX ERROR: dataBase.tipoLinea.toUpperCase()
async function generarPDF(id = null) {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("landscape", "mm", "a4");

        // OBTENER DATOS BASE
        let dataBase;
        if (id) {
            const snap = await getDoc(doc(db, window.coleccion, id));
            dataBase = snap.data();
        } else {
            dataBase = window.inspeccionActualData;
        }

        // ✅ FIX: VERIFICAR dataBase existe
        if (!dataBase || !dataBase.equipo || !dataBase.equipo.cema) {
            Toastify({ text: "Error: Datos de inspección no válidos", duration: 4000, gravity: "top", backgroundColor: "red" }).showToast();
            return;
        }

        const cema = dataBase.equipo.cema;
        const fechaInspeccion = dataBase.fecha?.toDate ? dataBase.fecha.toDate() : new Date();

        // Utilidades fecha
        function obtenerSemanaDesdeFecha(fecha) {
            const base = new Date(fecha);
            const lunes = new Date(base);
            lunes.setDate(base.getDate() - base.getDay() + 1);
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(lunes);
                d.setDate(lunes.getDate() + i);
                return d;
            });
        }

        function formatearFecha(d) {
            return d.toLocaleDateString("es-CO");
        }

        const semana = obtenerSemanaDesdeFecha(fechaInspeccion);

        // QUERY SIMPLE
        const q = query(collection(db, window.coleccion), where("equipo.cema", "==", cema));
        const snap = await getDocs(q);
        const inspeccionesSemana = snap.docs
            .map(doc => ({ id: doc.id, data: doc.data(), fecha: doc.data().fecha?.toDate() || new Date() }))
            .filter(i => Math.abs(Math.floor((fechaInspeccion - i.fecha) / (1000*60*60*24))) <= 7)
            .sort((a, b) => b.fecha - a.fecha);

        // ✅ FIX HOY NO APARECE - AGREGAR PREOPERACIONAL ACTUAL
        if (!id && window.inspeccionActualData) {
            inspeccionesSemana.unshift({
                id: 'actual',
                data: dataBase,
                fecha: fechaInspeccion
            });
        }

        // ✅ FIX SEMANA COMPLETA - AGREGAR DÍAS VACÍOS
        semana.forEach(dia => {
            const existeDia = inspeccionesSemana.some(i => 
                i.fecha.getFullYear() === dia.getFullYear() &&
                i.fecha.getMonth() === dia.getMonth() &&
                i.fecha.getDate() === dia.getDate()
            );
            if (!existeDia) {
                inspeccionesSemana.push({
                    id: 'vacio',
                    data: { checklist: {}, operador: '' },
                    fecha: dia
                });
            }
        });
        inspeccionesSemana.sort((a, b) => b.fecha - a.fecha);

        // ✅ FIX: tipoLinea seguro
        const tipoLinea = dataBase.tipoLinea || window.tipoLinea || "DESCONOCIDA";
        
        // ✅ NUEVO TITULO (ARriba)
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.text("INSPECCION PREOPERACIONAL", 148, 18, { align: "center" });
        pdf.setFontSize(18);
        pdf.text(tipoLinea.toUpperCase(), 148, 25, { align: "center" });
        
        pdf.setFontSize(14);
        pdf.text(`EQUIPO: ${cema}`, 148, 35, { align: "center" });
        pdf.setFontSize(12);
        pdf.text(`SEMANA | ${formatearFecha(semana[0])} - ${formatearFecha(semana[6])}`, 148, 43, { align: "center" });

        // ✅ DATOS DEL EQUIPO COMPLETO (ARriba - FORMATO VERTICAL) - PROTEGIDO
        let yPos = 55;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("DATOS DEL EQUIPO:", 20, yPos); yPos += 10;
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(`CEMA: ${dataBase.equipo.cema || "---"}`, 20, yPos); yPos += 8;
        pdf.text(`COMEQ: ${dataBase.equipo.comeq || "---"}`, 20, yPos); yPos += 8;
        pdf.text(`TIPO: ${dataBase.equipo.tipo || "---"}`, 20, yPos); yPos += 8;
        pdf.text(`HOROMETRO: ${dataBase.equipo.horometro || "---"}`, 20, yPos); yPos += 8;
        pdf.text(`UBICACION: ${dataBase.equipo.ubicacion || "---"}`, 20, yPos); yPos += 8;
        pdf.text(`OPERADOR: ${dataBase.operador ? dataBase.operador.split("@")[0] : "---"}`, 20, yPos); yPos += 8;
        pdf.text(`IPE: ${dataBase.ipe || "---"}`, 20, yPos);

        // ✅ VERIFICAR checklist existe
        if (!dataBase.checklist) {
            Toastify({ text: "Error: Checklist no encontrado", duration: 4000, gravity: "top", backgroundColor: "red" }).showToast();
            return;
        }

        // TABLA CHECKLIST
        const ESTADOS = { B: { text: "X", bg: [39, 174, 96], color: 255 }, M: { text: "X", bg: [192, 57, 43], color: 255 }, NA: { text: "X", bg: [189, 195, 199], color: 0 } };

        const head1 = [{ content: "ITEM", rowSpan: 2 }];
        semana.forEach(d => head1.push({ content: formatearFecha(d), colSpan: 3, styles: { halign: "center" } }));
        const head2 = semana.flatMap(() => ["B", "M", "NA"]);

        // ✅ FIX: Usa checklist del dataBase actual + comparación de fecha EXACTA
        const items = Object.keys(dataBase.checklist);
        const rows = items.map(item => {
            const row = [item.replace(/_/g, " ").toUpperCase()];
            semana.forEach(dia => {
                const inspeccionDia = inspeccionesSemana.find(i => {
                    const fechaInspeccion = i.fecha;
                    const fechaDia = dia;
                    return fechaInspeccion.getFullYear() === fechaDia.getFullYear() &&
                           fechaInspeccion.getMonth() === fechaDia.getMonth() &&
                           fechaInspeccion.getDate() === fechaDia.getDate();
                });
                
                const estado = inspeccionDia ? inspeccionDia.data.checklist[item] : null;
                ["B", "M", "NA"].forEach(k => {
                    if (estado === k) {
                        row.push({ 
                            content: ESTADOS[k].text, 
                            styles: { fillColor: ESTADOS[k].bg, textColor: ESTADOS[k].color, fontStyle: "bold" } 
                        });
                    } else {
                        row.push("");
                    }
                });
            });
            return row;
        });

        // Firma
        const firma = [{ content: "FIRMA OPERADOR", styles: { fillColor: [52, 73, 94], fontStyle: "bold", halign: "center" } }];
        semana.forEach(dia => {
            const inspeccionDia = inspeccionesSemana.find(i => {
                const fechaInspeccion = i.fecha;
                const fechaDia = dia;
                return fechaInspeccion.getFullYear() === fechaDia.getFullYear() &&
                       fechaInspeccion.getMonth() === fechaDia.getMonth() &&
                       fechaInspeccion.getDate() === fechaDia.getDate();
            });
            firma.push({
                content: inspeccionDia && inspeccionDia.data.operador ? inspeccionDia.data.operador.split("@")[0] : "",
                colSpan: 3,
                styles: { fillColor: [236, 240, 241], halign: "center", fontStyle: "bold" }
            });
        });
        rows.push(firma);

        // ✅ TABLA CON SEPARADORES VISUALES PERFECTOS - columnStyles COMPLETO
        pdf.autoTable({
            startY: yPos + 15,
            theme: "grid",
            head: [head1, head2],
            body: rows,
            styles: { 
                fontSize: 7, 
                halign: "center", 
                valign: "middle",
                lineWidth: 0.5,
                cellPadding: 2
            },
            headStyles: { 
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 8
            },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 28 }, 2: { cellWidth: 12 }, 3: { cellWidth: 12 }, 4: { cellWidth: 12 },
                5: { cellWidth: 28 }, 6: { cellWidth: 12 }, 7: { cellWidth: 12 }, 8: { cellWidth: 12 },
                9: { cellWidth: 28 },10: { cellWidth: 12 },11: { cellWidth: 12 },12: { cellWidth: 12 },
                13: { cellWidth: 28 },14: { cellWidth: 12 },15: { cellWidth: 12 },16: { cellWidth: 12 },
                17: { cellWidth: 28 },18: { cellWidth: 12 },19: { cellWidth: 12 },20: { cellWidth: 12 }
            },
            didDrawCell: function(data) {
                if ([4,8,12,16,20].includes(data.column.index)) {
                    pdf.setDrawColor(0);
                    pdf.setLineWidth(1.5);
                    pdf.line(
                        data.cell.x + data.cell.width,
                        data.cell.y,
                        data.cell.x + data.cell.width,
                        data.cell.y + data.cell.height
                    );
                }
            }
        });

        pdf.save(`MOVA_Semanal_${cema}_${formatearFecha(semana[0])}.pdf`);
        Toastify({ text: `✅ PDF SEMANAL (${inspeccionesSemana.length} días)`, duration: 4000, gravity: "top", backgroundColor: "green" }).showToast();
    } catch (error) {
        console.error('Error PDF:', error);
        Toastify({ text: `Error: ${error.message}`, duration: 5000, gravity: "top", backgroundColor: "red" }).showToast();
    }
}



/* ================= HISTORIAL ================= */
async function verHistorialEquipo(cema) {
    try {
        mainContent.innerHTML = `
            <button class="btn btn-outline-secondary mb-4" onclick="mostrarMenuPreoperacional()">← Volver</button>
            <h2 class="mb-4">📚 Historial <strong>${cema}</strong></h2>
            <div class="spinner-border text-info mb-4" role="status"></div>
            <div id="lista-historial"></div>
        `;
        
        const lista = document.getElementById("lista-historial");
        
        // ✅ SOLUCIÓN: QUITAR orderBy() - ORDENAR EN CLIENTE
        const q = query(
            collection(db, window.coleccion),
            where("equipo.cema", "==", cema)
            // ❌ ELIMINADO: orderBy("fecha", "desc")
        );
        
        const snap = await getDocs(q);
        
        if (snap.empty) {
            lista.innerHTML = '<div class="alert alert-info text-center">No hay historial para este equipo</div>';
            return;
        }

        // ✅ ORDENAR EN CLIENTE (sin necesidad de index)
        const inspecciones = Array.from(snap.docs)
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.fecha?.toDate() || 0) - (a.fecha?.toDate() || 0));

        lista.innerHTML = `
            <div class="row g-3">
                ${inspecciones.map(inspeccion => {
                    const fecha = inspeccion.fecha?.toDate ? 
                        inspeccion.fecha.toDate().toLocaleDateString("es-CO") : "Sin fecha";
                    return `
                        <div class="col-md-6 col-lg-4">
                            <div class="card bg-dark border-info h-100">
                                <div class="card-body">
                                    <h6 class="card-title text-info">${fecha}</h6>
                                    <p class="card-text small">${inspeccion.equipo.tipo}</p>
                                    <button class="btn btn-outline-info w-100 exportar-historial" data-id="${inspeccion.id}">
                                        <i class="bi bi-download"></i> Exportar PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

        document.querySelectorAll(".exportar-historial").forEach(btn => {
            btn.onclick = () => generarPDF(btn.dataset.id);
        });
    } catch (error) {
        console.error('Error historial:', error);
        document.getElementById("lista-historial").innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}


/* ================= OTROS MENÚS ================= */
function mostrarEquipos() {
    mainContent.innerHTML = `
        <button class="btn btn-outline-secondary mb-4" onclick="mostrarDashboard()">← Dashboard</button>
        <h2 class="mb-4">⚙️ Gestión de Equipos</h2>
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i> Próximamente: Catálogo completo de equipos
        </div>
    `;
}

function mostrarReportes() {
    mainContent.innerHTML = `
        <button class="btn btn-outline-secondary mb-4" onclick="mostrarDashboard()">← Dashboard</button>
        <h2 class="mb-4">📊 Reportes</h2>
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i> Próximamente: Reportes consolidados y estadísticas
        </div>
    `;
}

function mostrarLogin() {
    mainContent.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center text-center px-4" style="min-height: 80vh; gap: 25px;">
            <div>
                <i class="bi bi-tools display-3 text-info mb-4"></i>
                <h1 class="display-4 fw-bold mb-3">Mantenimiento MOVA</h1>
                <p class="lead mb-4">Sistema de inspecciones preoperacionales</p>
            </div>

            <button class="btn btn-primary btn-lg px-5 py-3" data-bs-toggle="modal" data-bs-target="#IngresarModal">
                <i class="bi bi-box-arrow-in-right me-2"></i>Ingresar
            </button>

            <button class="btn btn-outline-light btn-lg px-5 py-3" data-bs-toggle="modal" data-bs-target="#RegistrarseModal">
                <i class="bi bi-person-plus me-2"></i>Registrarse
            </button>
        </div>
    `;
}

console.log("✅ Sistema MOVA cargado completamente - ¡Listo para usar!");








