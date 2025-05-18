import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
export * from './motorista.component';
export * from './taxi.component';
export * from './viagem.component';
export * from './cliente.component';
export * from './paginaMotorista.component';



@Component({
  selector: 'app-index',
  standalone: false,
  template: `
    <div class="video-background">
      <video autoplay muted loop id="bg-video" playsinline>
        <source src="assets/gen4.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

    <div class="logo-container" (click)="showRoleSelection()">
      <img src="assets/role_selection.png" alt="Role Selection Logo" />
    </div>

    <!-- Seleção do tipo de utilizador -->
    <div class="role-selection" *ngIf="!userRole && showRoleMenu">
      <h2>Escolha o tipo de utilizador</h2>
      <button (click)="selectRole('gestor')">Gestor</button>
      <button (click)="selectRole('cliente')">Cliente</button>
      <button (click)="selectRole('motorista')">Motorista</button>
    </div>

    <!-- Página do Gestor -->
    <ng-container *ngIf="userRole === 'gestor'">
      <div class="menu-bar" (click)="toggleMenu()">☰ Menu</div>
      <div class="menu-options" [class.open]="menuOpen">
        <div class="close-button" (click)="closeMenu()">←</div>
        <div class="menu-item" (click)="navigateToMotoristas()" style="background-image: url('../assets/motorista.jpg')">Motoristas</div>
        <div class="menu-item" (click)="navigateToTaxis()" style="background-image: url('../assets/taxis.jpg')">Táxis</div>
        <div class="menu-item" (click)="navigateToViagem()" style="background-image: url('../assets/viagem.jpg')">Viagem</div>
      </div>
    </ng-container>


  `,
  styleUrls: ['../app.component.scss'],
  styles: [`
    .video-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: -1;
    }

    #bg-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .menu-bar {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 1rem 1.5rem;
      cursor: pointer;
      font-size: 1.2rem;
      border-radius: 8px;
      z-index: 10;
      transition: background 0.3s;
    }

    .menu-bar:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .menu-options {
      position: absolute;
      top: 0;
      left: -250px;
      width: 250px;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      padding: 4rem 1rem 2rem 1rem;
      border-radius: 8px 0 0 8px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 10;
      transform: translateX(0);
      transition: transform 0.3s ease;
    }

    .menu-options.open {
      transform: translateX(250px);
    }

    .close-button {
      font-size: 2rem;
      color: white;
      cursor: pointer;
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 20;
    }

    .menu-item {
      color: white;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 1rem;
      border-radius: 4px;
      transition: background 0.2s;
      background-size: cover;
      background-position: center;
      text-align: center;
      height: 80px;
    }

    .menu-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .role-selection, form {
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.9);
      padding: 2rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    form input {
      padding: 0.5rem;
      width: 200px;
    }

    form button, .role-selection button {
      padding: 0.5rem 1rem;
      font-weight: bold;
      cursor: pointer;
    }

    .logo-container {
      position: absolute;
      top: 2rem;
      right: 1rem; /* <- alterado de left: 50% */
      cursor: pointer;
      z-index: 20;
    }

    .logo-container img {
      width: 75px;
      height: auto;
    }
  `]
})
export class IndexComponent {
  menuOpen = false;
  userRole: 'gestor' | 'cliente' | 'motorista' | null = null;
  
  showRoleMenu = false;
  loginData = { email: '', nif: null, pass: '' };
  signupData = { nome: '', idade: null, nif: null, email: '', pass: '', morada: '' };
  motoristaLoginData = { nif: '', cartaConducao: '' };

  constructor(private http: HttpClient, private router: Router, private location: Location) {}

  selectRole(role: string) {
    this.userRole = role as any;
    this.showRoleMenu = false; // Esconde o menu de seleção de papel após a seleção
  
    if (role === 'motorista') {
      this.router.navigate(['/paginaMotorista']);
    } else if (role === 'cliente') {
      this.router.navigate(['/cliente']);
    }
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  navigateToMotoristas() {
    this.router.navigate(['/motorista']);
  }

  navigateToTaxis() {
    this.router.navigate(['/taxi']);
  }

  navigateToViagem() {
    this.router.navigate(['/viagem']);
  }
  

  goBack() {
    this.location.back();
  }

  showRoleSelection() {
    this.userRole = null;
    this.showRoleMenu = true;
  }
}
