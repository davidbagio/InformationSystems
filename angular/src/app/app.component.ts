import { Component, ViewEncapsulation } from '@angular/core';
import { routes } from './app-routing.module';

@Component({
  selector: 'app-root',
  template: `
    <div class="pageLayout">
      <p-grid>
        <p-grid-item [size]="12" style="text-align: center;">
          <img src="assets/login.png" alt="Gestão de Táxis" class="logo-title" />
        </p-grid-item>
        <p-grid-item [size]="12">
          <p-divider class="divider"></p-divider>
        </p-grid-item>
      </p-grid>
      <router-outlet></router-outlet>
      <p-toast></p-toast>
      <div class="corner-text">Gestão de Táxis</div>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class AppComponent {
  public routes = routes;
}
