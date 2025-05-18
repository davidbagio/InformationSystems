import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AccordionUpdateEventDetail } from '@porsche-design-system/components-angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-motorista',
  standalone: false,
  template: `
    <p-button class="custom-button" (click)="goHome()">← Voltar à página inicial</p-button>

    <p-heading [tag]="'h3'" [align]="'center'">Motoristas da Empresa</p-heading>
    <div *ngIf="motoristas.length === 0">
      <p-text [align]="'center'">Ainda não existem motoristas</p-text>
    </div>

    <div style="max-width: 400px">
    <p-accordion *ngFor="let motorista of motoristas.slice().reverse(); let i = index"
             [heading]="motorista.nome"
             [headingTag]="'h3'"
             [open]="isOpen[i]"
             (update)="onUpdate(i, $event)">
  <button (click)="removerMotorista(motorista.nif)" class="delete-button">❌</button>

  <p-text><strong>Nome:</strong> {{ motorista.nome }}</p-text>
  <p-text><strong>NIF:</strong> {{ motorista.nif }}</p-text>
  <p-text><strong>Género:</strong> {{ motorista.genero }}</p-text>
  <p-text><strong>Código Postal:</strong> {{ motorista.codigoPostal }}</p-text>
  <p-text><strong>Localidade:</strong> {{ motorista.localidade }}</p-text>
  <p-text><strong>Rua:</strong> {{ motorista.rua }}</p-text>
  <p-text><strong>Número da Porta:</strong> {{ motorista.numeroPorta }}</p-text>
  <p-text><strong>Número da Carta de Condução:</strong> {{ motorista.cartaConducao }}</p-text>
  <p-text><strong>Ano de Nascimento:</strong> {{ motorista.anoNascimento }}</p-text>
</p-accordion>
    </div>

    <hr>

    <form [formGroup]="motoristaForm" (ngSubmit)="onSubmit()">
      <p-heading [tag]="'h3'" [align]="'center'">Registo de Motorista</p-heading>

      <fieldset>
        <p-heading [tag]="'h3'" [size]="'large'">Dados Pessoais</p-heading>

        <p-text-field-wrapper [label]="'Nome'" [hideLabel]="false">
          <input type="text" formControlName="nome" />
        </p-text-field-wrapper>

        <div *ngIf="anoInvalido">Tem de ter pelo menos 18 anos.</div>

        <p-text-field-wrapper [label]="'NIF'" [hideLabel]="false">
          <input type="number" formControlName="nif" />
        </p-text-field-wrapper>
        <div *ngIf="nifInvalido">NIF tem de ter 9 dígitos positivos.</div>
        <div *ngIf="nifDuplicado">Este NIF já está registado.</div>

        <p-select-wrapper [label]="'Género'" [hideLabel]="false">
          <select formControlName="genero">
            <option value="">Seleciona o género</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </p-select-wrapper>
        <div *ngIf="generoInvalido">Género tem de ser masculino ou feminino.</div>
      </fieldset>

      <fieldset>
        <p-heading [tag]="'h3'" [size]="'large'">Morada</p-heading>

        <p-text-field-wrapper [label]="'Código Postal'" [hideLabel]="false">
          <input type="text" formControlName="codigoPostal" />
        </p-text-field-wrapper>

        <p-text-field-wrapper [label]="'Localidade'" [hideLabel]="false">
          <input type="text" formControlName="localidade" readonly />
        </p-text-field-wrapper>

        <p-text-field-wrapper [label]="'Rua'" [hideLabel]="false">
          <input type="text" formControlName="rua" />
        </p-text-field-wrapper>

        <p-text-field-wrapper [label]="'Número da porta'" [hideLabel]="false">
          <input type="number" formControlName="numeroPorta" />
        </p-text-field-wrapper>
    
      </fieldset>

      <fieldset>
        <p-heading [tag]="'h3'" [size]="'large'">Informações do Motorista</p-heading>

        <p-text-field-wrapper [label]="'Número da Carta de Condução'" [hideLabel]="false">
          <input type="text" formControlName="cartaConducao" />
        </p-text-field-wrapper>
        <div *ngIf="cartaDuplicada">Número da carta de condução já existe.</div>

        <p-text-field-wrapper [label]="'Ano de Nascimento'" [hideLabel]="false">
          <input type="number" formControlName="anoNascimento" />
        </p-text-field-wrapper>
      </fieldset>

      <p-button *ngIf="motoristaForm.valid && !cartaDuplicada && !nifDuplicado" (click)="onSubmit()">Submeter</p-button>
      <p-button *ngIf="motoristaForm.invalid || cartaDuplicada || nifDuplicado" [disabled]="true">Submeter</p-button>
    </form>
  `,
  styles: [
    `
      .motorista-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .motorista-header button {
        background: none;
        border: none;
        color: red;
        font-size: 18px;
        cursor: pointer;
      }
      .buttons-container {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 2rem;
        margin-top: 2rem;
      }
    `
  ]
})
export class MotoristaComponent implements OnInit{
  motoristaForm: FormGroup;
  mapaPostais: Map<string, string> = new Map();
  motoristas: any[] = [];
  isOpen: boolean[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    const currentYear = new Date().getFullYear();

    this.motoristaForm = this.fb.group({
      nome: ['', Validators.required],
      anoNascimento: ['', [Validators.required, Validators.min(currentYear - 100), Validators.max(currentYear - 18)]],
      nif: ['', [Validators.required, Validators.pattern(/^\d{9}$/), Validators.min(1)]],
      genero: ['', [Validators.required, Validators.pattern(/^(masculino|feminino)$/i)]],
      codigoPostal: ['', Validators.required],
      localidade: [''],
      cartaConducao: ['', Validators.required],
      numeroPorta: ['', Validators.required],
      rua: ['', Validators.required],
    });

    this.carregarCodigosPostais();

    this.motoristaForm.get('codigoPostal')?.valueChanges.subscribe(codigo => {
      const localidade = this.mapaPostais.get(codigo?.trim());
      this.motoristaForm.get('localidade')?.setValue(localidade || '');
    });
  }

  ngOnInit() {
    this.carregarMotoristas();
    this.carregarCodigosPostais();
  }

  carregarMotoristas() {
    this.http.get<any[]>('http://localhost:3000/motoristas') 
      .subscribe(data => {
        this.motoristas = data;
        this.isOpen = new Array(this.motoristas.length).fill(false);
      });
  }

  carregarCodigosPostais() {
    this.http.get('/assets/codigos_postais.csv', { responseType: 'text' }).subscribe(data => {
      const linhas = data.split('\n').slice(1);
      for (let linha of linhas) {
        const colunas = linha.trim().split(',');
        if (colunas.length < 17) continue;

        const codPostal = `${colunas[14]}-${colunas[15]}`;
        const localidade = colunas[3];

        if (codPostal && localidade) {
          this.mapaPostais.set(codPostal.trim(), localidade.trim());
        }
      }
    });
  }

  get anoInvalido() {
    const ano = this.motoristaForm.get('anoNascimento');
    return ano?.touched && ano?.invalid;
  }

  get nifInvalido() {
    const nif = this.motoristaForm.get('nif');
    return nif?.touched && nif?.invalid;
  }

  get generoInvalido() {
    const genero = this.motoristaForm.get('genero');
    return genero?.touched && genero?.invalid;
  }

  get cartaDuplicada() {
    const carta = this.motoristaForm.get('cartaConducao')?.value;
    return this.motoristas.some(m => m.cartaConducao === carta);
  }

  get nifDuplicado() {
    const nif = this.motoristaForm.get('nif')?.value;
    return this.motoristas.some(m => m.nif === nif);
  }

  onSubmit() {
    if (this.motoristaForm.valid && !this.cartaDuplicada && !this.nifDuplicado) {
      const motorista = this.motoristaForm.value;

      this.http.post('http://localhost:3000/motoristas', motorista)
        .subscribe({
          next: () => {
            this.motoristas.unshift(motorista);
            this.isOpen.unshift(false);
            this.motoristaForm.reset();
          },
          error: err => {
            console.error('Erro ao registar motorista', err);
          }
        });
    }
  }

  onUpdate(index: number, e: CustomEvent<AccordionUpdateEventDetail>) {
    this.isOpen[index] = e.detail.open;
  }

  removerMotorista(nif: string) {
    this.http.delete(`http://localhost:3000/motoristas/${nif}`).subscribe({
      next: () => {
        this.motoristas = this.motoristas.filter(motorista => motorista.nif !== nif);
      },
      error: err => {
        console.error('Erro ao remover motorista', err);
      }
    });
  }
  

  goHome() {
    this.router.navigate(['/']);
  }
}
