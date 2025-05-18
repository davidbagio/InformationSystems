import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccordionUpdateEventDetail } from '@porsche-design-system/components-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-precos',
  standalone: false,
  template: `
    <p-button class="custom-button" (click)="goHome()">← Voltar à página inicial</p-button>

    <p-heading [tag]="'h1'" [align]="'center'">Definição de Preços</p-heading>

    <form [formGroup]="precoForm" (ngSubmit)="definirPrecos()">
      <p-heading [tag]="'h2'">Preço por Minuto</p-heading>

      <div *ngFor="let nivel of niveisConforto">
        <p-text-field-wrapper [label]="nivel" [hideLabel]="false">
          <input type="number" step="0.01" formControlName="{{nivel}}" />
        </p-text-field-wrapper>
      </div>

      <p-heading [tag]="'h2'">Agravamento Noturno (%)</p-heading>

      <p-text-field-wrapper [label]="'Agravamento das 21h às 6h'" [hideLabel]="false">
        <input type="number" formControlName="agravamento" />
      </p-text-field-wrapper>

      <p-button [disabled]="precoForm.invalid">Guardar Configurações</p-button>
    </form>

    <hr />

    <p-heading [tag]="'h1'" [align]="'center'">Simular Custo de Viagem</p-heading>

    <form [formGroup]="viagemForm" (ngSubmit)="calcularCusto()">
      <p-select-wrapper [label]="'Nível de Conforto'" [hideLabel]="false">
        <select formControlName="nivelConforto">
          <option *ngFor="let nivel of niveisConforto" [value]="nivel">{{ nivel }}</option>
        </select>
      </p-select-wrapper>

      <div>
        <label for="inicio">Início da Viagem</label>
        <input type="datetime-local" formControlName="inicio" id="inicio" class="custom-datetime" />
      </div>

      <div>
        <label for="fim">Fim da Viagem</label>
        <input type="datetime-local" formControlName="fim" id="fim" class="custom-datetime" />
      </div>

      <p-button [disabled]="viagemForm.invalid">Calcular Custo</p-button>
    </form>

    <div *ngIf="custo !== null">
      <p-text [align]="'center'"><strong>Custo da viagem:</strong> {{ custo }} €</p-text>
    </div>
  `
})
export class PrecosComponent implements OnInit {
  precoForm: FormGroup;
  viagemForm: FormGroup;
  niveisConforto = ['Básico', 'Luxuoso'];
  tabelaPrecos: { [key: string]: number } = {};
  agravamento = 0;
  custo: number | null = null;

  constructor(private fb: FormBuilder) {
    this.precoForm = this.fb.group({
      'Básico': [0.15, [Validators.required, Validators.min(0.01)]],
      'Luxuoso': [0.25, [Validators.required, Validators.min(0.01)]],
      agravamento: [20, [Validators.required, Validators.min(0)]]
    });

    this.viagemForm = this.fb.group({
      nivelConforto: ['', Validators.required],
      inicio: ['', Validators.required],
      fim: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  definirPrecos() {
    this.tabelaPrecos = {
      'Básico': this.precoForm.value['Básico'],
      'Luxuoso': this.precoForm.value['Luxuoso']
    };
    this.agravamento = this.precoForm.value.agravamento;
    alert('Preços atualizados com sucesso!');
  }

  calcularCusto() {
    const { nivelConforto, inicio, fim } = this.viagemForm.value;
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    if (dataFim <= dataInicio) {
      alert('A hora de fim deve ser posterior à de início.');
      return;
    }

    const precoMinuto = this.tabelaPrecos[nivelConforto];
    const minutosTotais = Math.floor((dataFim.getTime() - dataInicio.getTime()) / 60000);

    let total = 0;
    const atual = new Date(dataInicio);
    for (let i = 0; i < minutosTotais; i++) {
      const hora = atual.getHours();
      let preco = precoMinuto;
      if (hora >= 21 || hora < 6) {
        preco *= 1 + (this.agravamento / 100);
      }
      total += preco;
      atual.setMinutes(atual.getMinutes() + 1);
    }

    this.custo = parseFloat(total.toFixed(2));
  }

  goHome() {
    window.location.href = '/';
  }
}
