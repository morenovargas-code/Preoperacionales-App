// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Auth
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDlO-XhUuitM6QN6cpam3SkeqpGcktFbWw",
  authDomain: "fir-app-tuto-d20d5.firebaseapp.com",
  projectId: "fir-app-tuto-d20d5",
  storageBucket: "fir-app-tuto-d20d5.firebasestorage.app",
  messagingSenderId: "754290122904",
  appId: "1:754290122904:web:d543ae6297e15f9f0930ed"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// 🔥 FIRESTORE (ESTO FALTABA)
export const db = getFirestore(app);