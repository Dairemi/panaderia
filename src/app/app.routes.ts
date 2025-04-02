import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './home/home.component';
import { ProductoComponent } from './pages/producto/producto.component';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { authGuard } from './auth.guard';
import { RelacionComponent } from './pages/relacion/relacion.component';

export const routes: Routes = [
  {
      path: '',
      component: LoginComponent
  },
  {
      path: 'relaciones',
      component: RelacionComponent,
      canActivate: [authGuard]
  },
  {
      path: 'clientes',
      component: ClienteComponent,
      canActivate: [authGuard]
  },
  {
      path: 'productos',
      component: ProductoComponent,
      canActivate: [authGuard]
  },
  {
      path: '**',
      redirectTo: ''
  }
];
