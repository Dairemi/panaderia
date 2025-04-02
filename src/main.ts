import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthService } from './app/services/auth.service';
import { ProductoService } from './app/services/producto.service';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

// Configuración de Firebase (reemplaza con tus datos reales)
const firebaseConfig = {
  apiKey: "AIzaSyAV_3AGGAfn5vzKN1fRc9jgNAEAgLZnODc",
  authDomain: "materias-5c6e7.firebaseapp.com",
  projectId: "materias-5c6e7",
  storageBucket: "materias-5c6e7.firebasestorage.app",
  messagingSenderId: "284204119108",
  appId: "1:284204119108:web:ce6e2d74db5ba4e814b811",
  measurementId: "G-H2WM863513"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    AuthService,
    ProductoService,
    // Configuración de Firebase sin importProvidersFrom
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
}).catch(err => console.error(err));
