import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
import { auth, db } from "./firebase.js"
import { Mostrarmensaje } from './Mostrarmensaje.js'
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

const signInForm = document.querySelector('#ingresar-form')
signInForm.addEventListener('submit', async e => {
    e.preventDefault()

    const text = signInForm['ingresar-email'].value;
    const password = signInForm['ingresar-password'].value;
    try {
        const credentials = await signInWithEmailAndPassword(auth, text, password)
        console.log(credentials) 

        // Ocultar modal
        const modal = bootstrap.Modal.getInstance(document.querySelector('#IngresarModal'))
        modal.hide()

        // Mostrar mensaje de bienvenida
        Mostrarmensaje('Bienvenido ' + credentials.user.email)

        // ====== OBTENER DATOS ADICIONALES DEL USUARIO ======
        const docRef = doc(db, "usuarios", credentials.user.uid) // tu colección 'usuarios'
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            window.operadorActivo = data.nombre || credentials.user.email
            window.ipeActivo = data.ipe || "—"
        } else {
            // Si no hay documento, usar valores por defecto
            window.operadorActivo = credentials.user.email
            window.ipeActivo = "—"
        }

    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            Mostrarmensaje("CONTRASEÑA EQUIVOCADA", "Error")   
        } else if (error.code === 'auth/user-not-found') {
            Mostrarmensaje("USUARIO NO ENCONTRADO", "Error")
        } else if (error.code) {
            Mostrarmensaje("ALGO SALIO MAL", "Error") 
        }
    }
})
