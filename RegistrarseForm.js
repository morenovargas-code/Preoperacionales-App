import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
import { auth } from "./firebase.js"
import {Mostrarmensaje} from './Mostrarmensaje.js'

const registarseForm= document.querySelector('#registrarse-form')

registarseForm.addEventListener('submit',async (e)=> {
e.preventDefault()

const nombre = registarseForm['registrarse-nombre'].value
    const password = registarseForm['registrarse-password'].value

    // Limpiar y preparar base del correo
    let baseEmail = nombre
        .toLowerCase()
        .replace(/\s+/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

    let dominio = "@gmail.com"
    let email = baseEmail + dominio
    let contador = 1

       
    console.log("Correo generado:", email)

    // --- REGISTRAR USUARIO ---
    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
        console.log("Usuario creado:", userCredentials.user)

        // cerrar pestaña registro
        const registarsemodal = document.querySelector('#RegistrarseModal')
        const modal = bootstrap.Modal.getInstance(registarsemodal)
        modal.hide()

        Mostrarmensaje("Bienvenido " + userCredentials.user.email)

    } catch (error) {
        console.log("Error al crear usuario:", error)
        console.log(error.code)
        

        if (error.code==='auth/email-already-in-use'){
        Mostrarmensaje ("USUARIO YA REGISTRADO", "Error")   
        } 
        else if (error.code==='auth/weak-password')
        {Mostrarmensaje ("CONTRASEÑA DEBE TENER 6 DIGITOS", "Error")
        }
        else if (error.code){
         Mostrarmensaje ("ALGO SALIO MAL", "Error") 
        }
    }
})