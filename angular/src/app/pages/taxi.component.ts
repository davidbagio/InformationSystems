import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccordionUpdateEventDetail } from '@porsche-design-system/components-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-taxi',
  standalone:false,
  template: `
    <p-button class="custom-button" (click)="goHome()">← Voltar à página inicial</p-button>

    <p-heading [tag]="'h1'" [align]="'center'">Página dos Táxis</p-heading>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <p-text-field-wrapper [label]="'Matrícula'" [hideLabel]="false">
        <input type="text" formControlName="matricula" />
      </p-text-field-wrapper>
      <div *ngIf="form.get('matricula')?.touched && form.get('matricula')?.invalid">
        Matrícula inválida! Ex: 12-AB-34
      </div>

      <p-text-field-wrapper [label]="'Ano de Compra'" [hideLabel]="false">
        <input type="number" formControlName="anoCompra" />
      </p-text-field-wrapper>
      <div *ngIf="form.get('anoCompra')?.touched && form.get('anoCompra')?.invalid">
        Ano inválido! Não pode ser superior ao ano atual.
      </div>

      <p-select-wrapper [label]="'Marca'" [hideLabel]="false">
        <select formControlName="marca" (change)="onMarcaChange()">
          <option *ngFor="let marca of marcasDisponiveis" [value]="marca">{{ marca }}</option>
        </select>
      </p-select-wrapper>

      <p-select-wrapper [label]="'Modelo'" [hideLabel]="false">
        <select formControlName="modelo" [disabled]="!modelosDisponiveis.length">
          <option *ngFor="let modelo of modelosDisponiveis" [value]="modelo">{{ modelo }}</option>
        </select>
      </p-select-wrapper>

      <p-select-wrapper [label]="'Nível de Conforto'" [hideLabel]="false">
        <select formControlName="nivelConforto">
          <option value="Básico">Básico</option>
          <option value="Luxuoso">Luxuoso</option>
        </select>
      </p-select-wrapper>

      <p-button [disabled]="form.invalid">Submeter</p-button>
    </form>

    <hr />

    <div *ngIf="taxis.length === 0">
      <p-text [align]="'center'">Ainda não existem táxis registados</p-text>
    </div>

    <div *ngIf="taxis.length > 0">
      <p-heading [tag]="'h2'" [align]="'center'">Lista de Táxis</p-heading>

      <p-accordion *ngFor="let taxi of taxis; let i = index"
                   [heading]="taxi.marca + ' ' + taxi.modelo + ': ' + taxi.matricula"
                   [headingTag]="'h3'"
                   [open]="isOpen[i]"
                   (update)="onUpdate(i, $event)">
      <button (click)="removerTaxi(taxi.matricula)" class="delete-button">❌</button>
        <p-text><strong>Matrícula:</strong> {{ taxi.matricula }}</p-text>
        <p-text><strong>Ano de Compra:</strong> {{ taxi.anoCompra }}</p-text>
        <p-text><strong>Marca:</strong> {{ taxi.marca }}</p-text>
        <p-text><strong>Modelo:</strong> {{ taxi.modelo }}</p-text>
        <p-text><strong>Nível de Conforto:</strong> {{ taxi.nivelConforto }}</p-text>
        <p-text><strong>Data de Registo:</strong> {{ taxi.dataRegisto | date:'short' }}</p-text>
      </p-accordion>
    </div>
  `

})
export class TaxiComponent {
  form: FormGroup;

  taxis: any[] = [];
  isOpen: boolean[] = [];

  marcasDisponiveis: string[] = ['Toyota', 'BMW', 'Mercedes', 'Dacia', 'Ford'];
  modelosDisponiveis: string[] = [];

  modelosPorMarca: { [key: string]: string[] } = {
    'Toyota': ['Prius', 'Yaris', 'Supra', 'Camry','Corolla'],
    'BMW': ['Série 3', 'X1', 'Z4'],
    'Mercedes': ['Classe E', 'Classe C', 'A-Class'],
    'Dacia': ['Sandero', 'Duster'],
    'Ford':['Focus','Puma']

  };

  private apiUrl = 'http://localhost:3000/taxis';

  constructor(private fb: FormBuilder, private http: HttpClient,private router: Router) {
    this.form = this.fb.group({
      matricula: ['', [Validators.required, Validators.pattern(/^\d{2}-[A-Z]{2}-\d{2}$/)]],
      anoCompra: ['', [Validators.required, Validators.max(new Date().getFullYear())]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      nivelConforto: ['', [Validators.required, Validators.pattern(/^(Básico|Luxuoso)$/i)]]
    });
  }

  ngOnInit(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.taxis = data;
        this.isOpen = data.map(() => false);
      },
      error: (err) => {
        console.error('Erro ao obter táxis:', err);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const taxi = this.form.value;

      this.http.post<any>(this.apiUrl, taxi).subscribe({
        next: (novoTaxi) => {
          this.taxis.unshift(novoTaxi);
          this.isOpen.unshift(false);
          this.form.reset();
          this.modelosDisponiveis = [];
        },
        error: (err) => {
          console.error('Erro ao submeter táxi:', err);
        }
      });
    }
  }

  onMarcaChange() {
    const marcaSelecionada = this.form.get('marca')?.value;
    this.modelosDisponiveis = this.modelosPorMarca[marcaSelecionada] || [];
    this.form.get('modelo')?.setValue('');
  }

  onUpdate(index: number, e: CustomEvent<AccordionUpdateEventDetail>) {
    this.isOpen[index] = e.detail.open;
  }
  
  goHome() {
    this.router.navigate(['/']);
  }

  removerTaxi(matricula: string) {
    this.http.delete(`http://localhost:3000/taxis/${matricula}`).subscribe({
      next: () => {
        this.taxis = this.taxis.filter(taxi => taxi.matricula !== matricula);
      },
      error: err => {
        console.error('Erro ao remover táxi', err);
      }
    });
  }
}
