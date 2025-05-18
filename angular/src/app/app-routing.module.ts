import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route } from '@angular/router';
import * as pages from './pages';

export type ExtendedRoute = Route & {
  name?: string;
};

export const routes: ExtendedRoute[] = [
  {
    path: 'paginaMotorista',
    component: pages.PaginaMotoristaComponent,
    name: 'Página do Motorista'
  },
  { path: 'cliente', 
    component: pages.ClienteComponent, 
    name: 'Página do Cliente'
  },
  {
    path: 'motorista',
    component: pages.MotoristaComponent,
    name: 'Registar Motorista',
  },
  {
    path: 'taxi',
    component: pages.TaxiComponent,
    name: 'Página do Táxi'
  },
  {
    path: 'viagem',
    component: pages.PrecosComponent,
    name: 'Página da Viagem'
  },
  {
    path: '',
    component: pages.IndexComponent,  
    name: 'Página Inicial', 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
