import { signOut} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
import {auth} from './firebase.js'
const salida = document.querySelector('#salida')
salida.addEventListener('click', async ()=>{
  await signOut(auth)
  console.log ('user signed out')

})