import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-motorista',
  standalone: false,
  template: `

      <button (click)="voltarMenuPrincipal()" class="btn-voltar">
      ← Voltar ao Menu Principal
    </button>
    <!-- FORMULÁRIO DE LOGIN - só aparece se ainda não está autenticado -->
    <form *ngIf="!isAuthenticated" (ngSubmit)="submitMotoristaLogin()" #motoristaLoginForm="ngForm" class="login-form">
      <label for="nif">NIF do Motorista:</label>
      <input list="nifOptions" type="text" placeholder="Escreva ou selecione o NIF" [(ngModel)]="motoristaLoginData.nif" name="motoristaNif" required />
      <datalist id="nifOptions">
        <option *ngFor="let motorista of motoristas" [value]="motorista.nif"></option>
      </datalist>

      <label for="carta">Nº Carta de Condução:</label>
      <input type="text" placeholder="Nº Carta de Condução" [(ngModel)]="motoristaLoginData.cartaConducao" name="cartaConducao" required />

      <button type="submit">Entrar</button>
    </form>

    <!-- CONTEÚDO APÓS LOGIN -->
    <ng-container *ngIf="isAuthenticated">
      <div class="container">
        <h1>Bem-vindo, Motorista!</h1>

        <div class="options">
          <h2>O que pretende fazer?</h2>
          <ul>
            <li><button (click)="requisitarTurno()">Requisitar Táxi para um Turno</button></li>
            <li><button (click)="aceitarPedido()">Aceitar Pedido de Táxi</button></li>
            <li><button (click)="registarViagem()">Registar Viagem com Cliente</button></li>
          </ul>
        </div>

        <!-- Dropdown de táxis -->
        <div *ngIf="mostrarDropdown && taxisDisponiveis.length > 0" class="dropdown-container">
          <label for="selecao-taxi">Selecione um táxi disponível:</label>
          <select id="selecao-taxi" [(ngModel)]="taxiSelecionado">
            <option *ngFor="let taxi of taxisDisponiveis" [value]="taxi._id">
              {{ taxi.modelo }} - {{ taxi.matricula }}
            </option>
          </select>

          <label for="inicio">Data de Início:</label>
          <input type="datetime-local" id="inicio" [(ngModel)]="periodoInicio" />

          <label for="fim">Data de Fim:</label>
          <input type="datetime-local" id="fim" [(ngModel)]="periodoFim" />

          <button (click)="confirmarRequisicao()">Confirmar Requisição</button>
        </div>

        <!-- Dropdown de viagens -->
        <div *ngIf="mostrarViagens && viagensDisponiveis.length > 0" class="dropdown-container">
          <label for="selecao-viagem">Selecione uma viagem disponível:</label>
          <select id="selecao-viagem" [(ngModel)]="viagemSelecionada">
            <option *ngFor="let viagem of viagensDisponiveis" [value]="viagem._id">
              Nº Pessoas: {{ viagem.numeroPessoas }} | Origem: {{ viagem.origem }} | Destino: {{ viagem.destino }} | Distância: {{viagem.distancia}} km| Cliente: {{ viagem.cliente?.nome }}
            </option>
          </select>
          <button (click)="confirmarAceiteViagem()">Confirmar Aceitação</button>
        </div>

        <!-- Turnos Associados -->
        <div *ngIf="turnosAssociados.length > 0" class="turnos-container">
          <h2>Turnos Associados</h2>
          <ul>
            <li *ngFor="let turno of turnosAssociados">
              Táxi: {{ turno.taxi.modelo }} - {{ turno.taxi.matricula }} |
              Período: {{ turno.periodo.inicio | date:'short' }} - {{ turno.periodo.fim | date:'short' }} |
              Nível de Conforto: {{ turno.taxi.nivelConforto }}
            </li>
          </ul>
        </div>

        <div class="mensagem" *ngIf="mensagem">
          <p>{{ mensagem }}</p>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .login-form {
      padding: 2rem;
      text-align: center;
    }

    .login-form input {
      width: 300px;
      padding: 0.5rem;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .login-form button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .container {
      padding: 2rem;
      text-align: center;
    }

    .options {
      margin-top: 2rem;
    }

    .options ul {
      list-style: none;
      padding: 0;
    }

    .options li {
      margin-bottom: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .mensagem {
      margin-top: 2rem;
      font-size: 1.1rem;
      color: green;
    }

    .dropdown-container {
      margin-top: 2rem;
    }

    .btn-voltar {
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  display: inline-block;
  margin-top: 20px;
}

.btn-voltar:hover {
  background-color: #333;
}

    select, input[list] {
      width: 300px;
      padding: 0.5rem;
      font-size: 1rem;
      margin-right: 1rem;
    }
  `]
})
export class PaginaMotoristaComponent implements OnInit {
  mensagem: string = '';
  taxisDisponiveis: any[] = [];
  taxiSelecionado: string = '';
  taxisRequisitados: any[] = [];
  mostrarDropdown: boolean = false;

  viagensDisponiveis: any[] = [];
  viagemSelecionada: string = '';
  mostrarViagens: boolean = false;

  motoristas: any[] = [];
  motoristaLoginData = { nif: '', cartaConducao: '' };
  isAuthenticated: boolean = false;

  periodoInicio: string = '';
  periodoFim: string = '';

  turnosAssociados: any[] = [];

  motoristaLat: number | null = null;
  motoristaLng: number | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/motoristas').subscribe({
      next: (data) => {
        this.motoristas = data;
      },
      error: (err) => {
        console.error('Erro ao carregar motoristas:', err);
      }
    });
  }

  submitMotoristaLogin() {
    const { nif, cartaConducao } = this.motoristaLoginData;

    if (!nif || !cartaConducao) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const params = new HttpParams()
      .set('nif', nif)
      .set('carta', cartaConducao);

    this.http.get('http://localhost:3000/motoristas/login', { params }).subscribe(
      (response: any) => {
        console.log('Login de motorista bem-sucedido', response);
        alert('Login efetuado com sucesso!');
        this.isAuthenticated = true;

        // Fetch associated turnos
        this.obterTurnosAssociados();
      },
      (error) => {
        console.error('Erro no login do motorista', error);
        alert('Erro ao fazer login do motorista!');
      }
    );
  }

  requisitarTurno() {
    this.mensagem = 'A carregar táxis disponíveis...';
    this.mostrarViagens = false;

    this.http.get<any[]>('http://localhost:3000/taxis').subscribe({
      next: (data) => {
        this.taxisDisponiveis = data;
        if (data.length > 0) {
          this.mensagem = 'Preencha os campos abaixo para requisitar um turno.';
          this.mostrarDropdown = true;
        } else {
          this.mensagem = 'Não há táxis disponíveis no momento.';
          this.mostrarDropdown = false;
        }
      },
      error: (err) => {
        console.error('Erro ao obter táxis:', err);
        this.mensagem = 'Erro ao carregar táxis disponíveis.';
        this.mostrarDropdown = false;
      }
    });
  }

  confirmarRequisicao() {
    if (this.taxiSelecionado && this.periodoInicio && this.periodoFim) {
      const inicio = new Date(this.periodoInicio);
      const fim = new Date(this.periodoFim);
      const now = new Date();

      // Validate that 'inicio' is not before the current time
      if (inicio < now) {
        this.mensagem = 'A data de início não pode ser anterior ao momento atual.';
        return;
      }

      // Validate that 'fim' is after 'inicio'
      if (fim <= inicio) {
        this.mensagem = 'A data de fim deve ser posterior à data de início.';
        return;
      }

      // Validate that the time difference is not greater than 8 hours
      const diffInHours = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
      if (diffInHours > 8) {
        this.mensagem = 'O período entre início e fim não pode ser maior que 8 horas.';
        return;
      }

      // Fetch existing turnos of the motorista
      this.http.get<any[]>(`http://localhost:3000/api/turnos/motorista`, { params: { motoristaNif: this.motoristaLoginData.nif } })
        .subscribe({
          next: (turnos) => {
            // Check for overlapping periods
            const hasOverlap = turnos.some(turno => {
              const turnoInicio = new Date(turno.periodo.inicio);
              const turnoFim = new Date(turno.periodo.fim);

              return (inicio < turnoFim && fim > turnoInicio); // Overlap condition
            });

            if (hasOverlap) {
              this.mensagem = 'O período selecionado colide com outro turno existente.';
              return;
            }

            // Proceed with creating the turno
            const taxi = this.taxisDisponiveis.find(t => t._id === this.taxiSelecionado);
            if (taxi) {
              const turnoData = {
                motorista: this.motoristaLoginData.nif,
                taxi: taxi._id,
                inicio: this.periodoInicio,
                fim: this.periodoFim,
              };

              this.http.post('http://localhost:3000/api/turnos', turnoData).subscribe({
                next: (res: any) => {
                  this.mensagem = `Turno criado com sucesso para o táxi: ${taxi.modelo} - ${taxi.matricula}`;
                  this.mostrarDropdown = false;
                  this.taxisRequisitados.push(taxi);
                  this.obterTurnosAssociados();
                },
                error: (err) => {
                  console.error('Erro ao criar turno:', err);
                  this.mensagem = 'Erro ao criar turno.';
                }
              });
            } else {
              this.mensagem = 'Táxi não encontrado.';
            }
          },
          error: (err) => {
            console.error('Erro ao verificar turnos existentes:', err);
            this.mensagem = 'Erro ao verificar turnos existentes.';
          }
        });
    } else {
      this.mensagem = 'Por favor, preencha todos os campos.';
    }
  }

  aceitarPedido() {
    this.mensagem = 'A carregar viagens disponíveis...';
    this.mostrarDropdown = false;
    this.mostrarViagens = false;

    this.obterLocalizacaoMotorista().then(({ lat, lng }) => {
      // Obter os turnos associados ao motorista
      this.http.get<any[]>(`http://localhost:3000/api/turnos/motorista`, { params: { motoristaNif: this.motoristaLoginData.nif } })
        .subscribe({
          next: (turnos) => {
            console.log('Turnos associados:', turnos);

            if (turnos.length === 0) {
              this.mensagem = 'Por favor, requisite um turno antes de aceitar pedidos.';
              return;
            }

            // Obter viagens disponíveis do backend
            this.http.get<any[]>('http://localhost:3000/viagens').subscribe({
              next: (viagens) => {
                console.log('Viagens retornadas do servidor:', viagens);

                // Filtrar viagens compatíveis com o nível de conforto e que não rejeitaram o motorista
                this.viagensDisponiveis = viagens
                  .filter((viagem) => {
                    const motoristaRejeitado = viagem.motoristasRejeitados.includes(this.motoristaLoginData.nif);
                    const nivelConfortoCompativel = turnos.some((turno) => turno.taxi.nivelConforto === viagem.nivelConforto);
                    return !motoristaRejeitado && nivelConfortoCompativel;
                  })
                  .map((viagem) => {
                    const distancia = this.calculateDistance(
                      lat,
                      lng,
                      viagem.originalClientLat,
                      viagem.originalClientLng
                    );
                    return { ...viagem, distancia };
                  })
                  .sort((a, b) => a.distancia - b.distancia); // Ordenar por distância

                console.log('Viagens filtradas e ordenadas:', this.viagensDisponiveis);

                if (this.viagensDisponiveis.length > 0) {
                  this.mensagem = 'Selecione uma viagem para aceitar.';
                  this.mostrarViagens = true;
                } else {
                  this.mensagem = 'Não há viagens disponíveis no momento compatíveis com o nível de conforto dos seus turnos.';
                }
              },
              error: (err) => {
                console.error('Erro ao obter viagens:', err);
                this.mensagem = 'Erro ao carregar viagens.';
              }
            });
          },
          error: (err) => {
            console.error('Erro ao obter turnos associados:', err);
            this.mensagem = 'Erro ao carregar turnos associados.';
          }
        });
    }).catch((error) => {
      console.error('Erro ao obter localização do motorista:', error);
    });
  }

  confirmarAceiteViagem() {
    const viagem = this.viagensDisponiveis.find(v => v._id === this.viagemSelecionada);
    const taxi = this.taxisRequisitados.find(t => t._id === this.taxiSelecionado);

    if (viagem && taxi) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const motoristaLat = position.coords.latitude;
            const motoristaLng = position.coords.longitude;

            this.http.put(`http://localhost:3000/viagens/${viagem._id}`, {
              status: true,
              motoristaNif: this.motoristaLoginData.nif,
              taxiMatricula: taxi.matricula,
              motoristaLat,
              motoristaLng,
            }).subscribe({
              next: (res: any) => {
                this.mensagem = `Viagem aceite: Nº Pessoas: ${viagem.numeroPessoas}, Origem: ${viagem.origem}, Destino: ${viagem.destino}, Cliente: ${viagem.cliente?.nome}`;
                console.log('[Motorista] Viagem aceite:', res.viagem);
                this.mostrarViagens = false;
              },
              error: (err) => {
                console.error('Erro ao atualizar status da viagem:', err);
                this.mensagem = 'Erro ao aceitar a viagem.';
              },
            });
          },
          (error) => {
            console.error('Erro ao obter localização do motorista:', error);
            alert('Não foi possível obter a localização do motorista.');
          }
        );
      } else {
        alert('Geolocalização não é suportada pelo navegador.');
      }
    } else {
      this.mensagem = 'Por favor, selecione uma viagem e um táxi válidos.';
    }
  }

  registarViagem() {
    this.mensagem = 'Viagem com cliente registada.';
    this.mostrarDropdown = false;
    this.mostrarViagens = false;
    console.log('[Motorista] Registar viagem');
  }

  obterTurnosAssociados() {
    const motoristaNif = this.motoristaLoginData.nif;

    if (!motoristaNif) {
      this.mensagem = 'Erro: Motorista não autenticado.';
      return;
    }

    this.http.get<any[]>(`http://localhost:3000/api/turnos/motorista`, { params: { motoristaNif } }).subscribe({
      next: (data) => {
        // Sort the turnos by ascending order of 'data de início'
        this.turnosAssociados = data.sort((a, b) => {
          const inicioA = new Date(a.periodo.inicio).getTime();
          const inicioB = new Date(b.periodo.inicio).getTime();
          return inicioA - inicioB; // Ascending order
        });

        if (this.turnosAssociados.length > 0) {
          this.mensagem = 'Turnos associados carregados com sucesso.';
        } else {
          this.mensagem = 'Nenhum turno associado encontrado.';
        }
      },
      error: (err) => {
        console.error('Erro ao obter turnos associados:', err);
        this.mensagem = 'Erro ao carregar turnos associados.';
      }
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  obterLocalizacaoMotorista(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            this.motoristaLat = lat;
            this.motoristaLng = lng;
            resolve({ lat, lng });
          },
          (error) => {
            console.error('Erro ao obter localização do motorista:', error);
            this.mensagem = 'Não foi possível obter a localização do motorista.';
            reject(error);
          }
        );
      } else {
        const error = 'Geolocalização não é suportada pelo navegador.';
        console.error(error);
        this.mensagem = error;
        reject(error);
      }
    });
  }
  voltarMenuPrincipal() {
  this.router.navigate(['/']); // Substitua '/menu-principal' pela rota correta
}
}
