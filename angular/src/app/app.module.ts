import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';  
import { IndexComponent } from './pages/index';
import { MotoristaComponent } from './pages/motorista.component';
import { TaxiComponent } from './pages/taxi.component';
import { PaginaMotoristaComponent } from './pages/paginaMotorista.component';
import {PrecosComponent} from './pages/viagem.component';
import { ClienteComponent } from './pages/cliente.component';
import { PorscheDesignSystemModule } from '@porsche-design-system/components-angular'; 
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, MotoristaComponent,TaxiComponent,IndexComponent, PrecosComponent, ClienteComponent, PaginaMotoristaComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    PorscheDesignSystemModule, 
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
