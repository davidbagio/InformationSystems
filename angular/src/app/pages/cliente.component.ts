import { Component, AfterViewInit, OnInit } from '@angular/core'; 
import * as L from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente',
  standalone: false,
  template: `


<button (click)="voltarMenuPrincipal()" class="btn-voltar">
      ← Voltar ao Menu Principal
    </button>
  <!-- Cliente escolhe entre login ou signup -->
  <ng-container *ngIf="!isAuthenticated">
    <div class="auth-buttons">
      <button class="styled-button" (click)="clientFormType = 'login'">Login</button>
      <button class="styled-button" (click)="clientFormType = 'signup'">Sign Up</button>
    </div>

    <!-- Formulário de Login -->
    <ng-container *ngIf="clientFormType === 'login'">
      <h3>Login</h3>
      <form (ngSubmit)="submitLogin()" #loginForm="ngForm">
        <input type="email" placeholder="Email" [(ngModel)]="loginData.email" name="email" required />
        <input type="NIF" placeholder="NIF" [(ngModel)]="loginData.nif" name="NIF" required />
        <input type="password" placeholder="Password" [(ngModel)]="loginData.pass" name="pass" required />
        <button type="submit">Entrar</button>
      </form>
    </ng-container>

    <!-- Formulário de Sign Up -->
    <ng-container *ngIf="clientFormType === 'signup'">
      <h3>Sign Up</h3>
      <form (ngSubmit)="submitSignup()" #signupForm="ngForm">
        <input type="text" placeholder="Nome" [(ngModel)]="signupData.nome" name="nome" required />
        <input type="number" placeholder="Idade" [(ngModel)]="signupData.idade" name="idade" required />
        <input type="number" placeholder="NIF" [(ngModel)]="signupData.nif" name="NIF" required />
        <input type="email" placeholder="Email" [(ngModel)]="signupData.email" name="email" required />
        <input type="password" placeholder="Password" [(ngModel)]="signupData.pass" name="pass" required />
        <input type="text" placeholder="Morada" [(ngModel)]="signupData.morada" name="morada" required />
        <button type="submit">Registar</button>
      </form>
    </ng-container>
  </ng-container>

    <ng-container *ngIf="isAuthenticated">
    <div class="container">
      <h1>Bem-vindo, Cliente!</h1>
      <button class="logout-button" (click)="logout()">LogOut</button>
      <div *ngIf="!showForm">
        <button (click)="toggleForm()" class="form-button">Solicitar Táxi</button>
      </div>

      <div *ngIf="showForm" class="form-container">
        <form (ngSubmit)="submitForm()">
          <label for="currentLocation">Localização Atual:</label>
          <p *ngIf="formData.currentLocation; else noLocation">
            {{ formData.currentLocation }}
          </p>
          <ng-template #noLocation>
            <p>Localização não detectada. Clique no botão abaixo para obter.</p>
          </ng-template>
          <button type="button" (click)="getCurrentLocation()">Obter Localização Atual</button>

          <label for="currentLocationPostalCode">Código Postal da Localização Atual:</label>
          <input
            type="text"
            id="currentLocationPostalCode"
            [(ngModel)]="currentLocationPostalCode"
            name="currentLocationPostalCode"
            placeholder="Insira o código postal"
            required
          />
          <button type="button" (click)="getCurrentLocationFromPostalCode()">OK</button>

          <label for="destination">Destino:</label>
          <p *ngIf="formData.destination; else noDestination">
            {{ formData.destination }}
          </p>
          <ng-template #noDestination>
            <p>Destino não definido. Clique no botão abaixo para selecionar no mapa ou insira o código postal.</p>
          </ng-template>
          <button type="button" (click)="openMap()">Selecionar no Mapa</button>

          <label for="destinationPostalCode">Código Postal do Destino:</label>
          <input
            type="text"
            id="destinationPostalCode"
            [(ngModel)]="destinationPostalCode"
            name="destinationPostalCode"
            placeholder="Insira o código postal"
            required
          />
          <button type="button" (click)="getDestinationFromPostalCode()">OK</button>

          <div *ngIf="showMap" id="map" style="height: 400px; margin-top: 20px;"></div>

          <label for="numPeople">Número de Pessoas:</label>
          <input
            type="number"
            id="numPeople"
            [(ngModel)]="formData.numPeople"
            name="numPeople"
            min="1"
            required
          />

          <!-- Nível de Conforto -->
          <label for="comfortLevel">Nível de Conforto:</label>
          <select
            id="comfortLevel"
            [(ngModel)]="formData.nivelConforto"
            name="nivelConforto"
            required
          >
            <option value="Básico">Básico</option>
            <option value="Luxuoso">Luxuoso</option>
          </select>

          <label for="inicio">Data e hora:</label>
          <input
            type="datetime-local"
            id="inicio"
            [(ngModel)]="formData.data"
            name="inicio"
            required
          />


          <div class="form-actions">
            <button type="submit">Enviar</button>
            <button type="button" (click)="toggleForm()">Voltar</button>
          </div>
        </form>
      </div>

      <div *ngIf="!showForm && trips.length > 0" class="trip-details">
        <h2>Detalhes das Viagens Solicitadas</h2>
        <div *ngFor="let trip of trips; let i = index" class="trip">
          <h3>Viagem {{ i + 1 }}</h3>
          <p><strong>Localização Atual:</strong> {{ trip.currentLocation }}</p>
          <p><strong>Destino:</strong> {{ trip.destination }}</p>
          <p><strong>Número de Pessoas:</strong> {{ trip.numPeople }}</p>
          <p><strong>Status:</strong> {{ trip.accepted ? 'Aceite' : 'Pendente' }}</p>
          <p><strong>Nível de Conforto:</strong> {{ trip.nivelConforto }}</p>

          <!-- Mostrar detalhes do motorista e táxi se a viagem foi aceita -->
          <div *ngIf="trip.accepted && trip.motorista">
            <h4>Detalhes do Motorista</h4>
            <p><strong>Nome:</strong> {{ trip.motorista.nome }}</p>
            <p><strong>Distância até o cliente:</strong> 
              {{ calculateDistance(trip.motoristaLat || 38.756734, trip.motoristaLng || -9.155412, trip.originalClientLat, trip.originalClientLng) | number:'1.2-2' }} km
            </p>
            <p><strong>Tempo estimado de chegada:</strong> 
              {{ calculateTime(calculateDistance(trip.motoristaLat || 38.756734, trip.motoristaLng || -9.155412, trip.originalClientLat, trip.originalClientLng)) }} minutos
            </p>
            <p><strong>Custo estimado:</strong> 
              {{ calculateCost(calculateDistance(trip.originalClientLat, trip.originalClientLng, trip.finalClientLat, trip.finalClientLng), trip.nivelConforto, trip.data, { 'Básico': 0.15, 'Luxuoso': 0.25 }, 20) }} €
              
            </p>

            <h4>Detalhes do Táxi</h4>
            <p><strong>Marca:</strong> {{ trip.taxi?.marca }}</p>
            <p><strong>Modelo:</strong> {{ trip.taxi?.modelo }}</p>
            <p><strong>Matrícula:</strong> {{ trip.taxi?.matricula }}</p>

            <div class="actions">
              <button (click)="acceptMotorista(trip)">Aceitar</button>
              <button (click)="rejectMotorista(trip)">Rejeitar</button>
            </div>
          </div>

          <!-- Mostrar botão para cancelar viagem se ainda não foi aceita -->
          <div *ngIf="!trip.accepted">
            <button type="button" (click)="cancelTrip(trip)">Cancelar</button>
          </div>
        </div>
      </div>
      
      
  `,
  styles: [`
    .container {
      text-align: center;
      margin-top: 100px;
      font-family: Arial, sans-serif;
    }

    h1 {
      color: #2c3e50;
      font-size: 2.5em;
    }

    .form-button, .form-actions button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 1em;
      cursor: pointer;
    }

    .form-container {
      margin-top: 20px;
      text-align: left;
      display: inline-block;
    }

    form {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-top: 10px;
    }

    input {
      margin-bottom: 10px;
      padding: 5px;
      font-size: 1em;
    }

    .trip-details {
      margin-top: 20px;
      text-align: left;
      display: inline-block;
    }

    .trip-details h2 {
      color: #2c3e50;
    }

    .trip {
      margin-bottom: 20px;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
    }

    .logout-button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 1em;
      font-weight: bold;
      color: white;
      background-color: #e74c3c;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .logout-button:hover {
      background-color: #c0392b;
      transform: scale(1.05);
    }

    .auth-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 50px;
    }

    .styled-button {
      padding: 12px 24px;
      font-size: 1.1em;
      font-weight: bold;
      border: none;
      border-radius: 8px;
      background-color:rgb(190, 192, 88);
      color: white;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .styled-button:hover {
      background-color:rgb(194, 196, 81);
      transform: scale(1.05);
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

    #map {
      width: 400px;
      height: 400px;
      margin-top: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      position: relative;
    }
  `]
})
export class ClienteComponent implements AfterViewInit, OnInit { 
  showForm = false;
  showMap = false;
  trips: any[] = [];
  destinationPostalCode = '';
  currentLocationPostalCode = '';
  clientFormType: 'login' | 'signup' | null = null;

  formData = {
    currentLocation: '',
    destination: '',
    numPeople: 1,
    clientName: '',
    nivelConforto: 'Básico',
    data: null,
  };

  isAuthenticated = false;
  loginData = { email: '', nif: null, pass: '' };
  signupData = { nome: '', idade: null, nif: null, email: '', pass: '', morada: '' };

  map: any;
  marker: any;
  clientName: string = ''; // Variable to store the client's name

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadTrips(); 
  }

  submitSignup() {
    console.log('Signup cliente:', this.signupData);
    
    this.http.post('http://localhost:3000/clientes', this.signupData).subscribe(
      (response) => {
        console.log(response);
        alert('Cliente registado com sucesso!');
        this.isAuthenticated = true;
      },
      (error) => {
        console.error(error);
        alert('Erro ao registar cliente!');
      }
    );
  }

  logout() {
  this.isAuthenticated = false; // Redefine o estado de autenticação
  this.router.navigate(['/cliente.component.ts']); // Redireciona para a página inicial
}

  loadTrips() {
    this.http.get<any[]>('http://localhost:3000/viagens/all').subscribe(
      (response) => {
        this.trips = response.map((trip) => ({
          id: trip._id,
          currentLocation: trip.origem,
          destination: trip.destino,
          numPeople: trip.numeroPessoas,
          clientName: trip.nomeCliente,
          accepted: trip.status,
          motorista: trip.motorista || null,
          motoristaLat: trip.motoristaLat || null,
          motoristaLng: trip.motoristaLng || null,
          taxi: trip.taxi || null,
          atribuida: trip.atribuida || false,
          nivelConforto: trip.nivelConforto || null,
          originalClientLat: trip.originalClientLat,
          originalClientLng: trip.originalClientLng,
          finalClientLat: trip.finalClientLat,
          finalClientLng: trip.finalClientLng,
        }));
      },
      (error) => {
        console.error('Erro ao carregar viagens:', error);
        alert('Erro ao carregar viagens. Tente novamente mais tarde.');
      }
    );
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async submitForm() {
    if (!this.formData.currentLocation || !this.formData.destination) {
      alert('Os campos "Localização Atual" e "Destino" não podem estar vazios.');
      return;
    }

    if (!this.currentLocationPostalCode || !this.destinationPostalCode) {
      alert('Por favor, insira os códigos postais para a localização atual e o destino.');
      return;
    }

    try {
      // Obter coordenadas da origem
      const origemResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${this.currentLocationPostalCode}&addressdetails=1`
      );
      const origemData = await origemResponse.json();

      if (!origemData || origemData.length === 0) {
        alert('Não foi possível obter as coordenadas para o código postal da origem.');
        return;
      }

      const origemCoords = {
        lat: parseFloat(origemData[0].lat),
        lng: parseFloat(origemData[0].lon),
      };

      // Obter coordenadas do destino
      const destinoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${this.destinationPostalCode}&addressdetails=1`
      );
      const destinoData = await destinoResponse.json();

      if (!destinoData || destinoData.length === 0) {
        alert('Não foi possível obter as coordenadas para o código postal do destino.');
        return;
      }

      const destinoCoords = {
        lat: parseFloat(destinoData[0].lat),
        lng: parseFloat(destinoData[0].lon),
      };

      // Criar o objeto tripData com as coordenadas
      const tripData = {
        origem: this.formData.currentLocation,
        destino: this.formData.destination,
        numeroPessoas: this.formData.numPeople,
        nomeCliente: this.formData.clientName,
        cliente: this.loginData.nif,
        nivelConforto: this.formData.nivelConforto,
        data: this.formData.data ? new Date(this.formData.data).toISOString() : null,
        originalClientLat: origemCoords.lat, // Latitude da origem
        originalClientLng: origemCoords.lng, // Longitude da origem
        finalClientLat: destinoCoords.lat, // Latitude do destino
        finalClientLng: destinoCoords.lng, // Longitude do destino
      };

      // Enviar os dados para o backend
      this.http.post('http://localhost:3000/viagens', tripData).subscribe(
        (response) => {
          console.log('Viagem enviada com sucesso', response);
          this.trips.push({ ...this.formData, accepted: false });
          this.resetFormData();
          this.showForm = false;
        },
        (error) => {
          console.error('Erro ao enviar a viagem', error);
          alert('Houve um erro ao enviar a viagem. Tente novamente mais tarde.');
        }
      );
    } catch (error) {
      console.error('Erro ao calcular as coordenadas:', error);
      alert('Erro ao calcular as coordenadas. Tente novamente mais tarde.');
    }
  }

  submitLogin() {

    if (!this.loginData.nif || !this.loginData.email || !this.loginData.pass) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const params = {
      nif: this.loginData.nif,
      email: this.loginData.email,
      pass: this.loginData.pass
    };
  
    this.http.get('http://localhost:3000/clientes/login', { params })
      .subscribe(
        (response: any) => {
          console.log('Login bem-sucedido', response);
          alert('Login com sucesso!');
          this.isAuthenticated = true;
        },
        (error) => {
          console.error('Erro ao fazer login', error);
          alert('Erro ao fazer login!');
        }
      );
  }

  cancelTrip(trip: any) {
    if (!trip.id) {
      alert('ID da viagem não encontrado.');
      return;
    }

    this.http.delete(`http://localhost:3000/viagens/${trip.id}`).subscribe(
      () => {
        console.log('Viagem deletada com sucesso');
        this.trips = this.trips.filter((t) => t.id !== trip.id); // Remova a viagem da lista local
      },
      (error) => {
        console.error('Erro ao deletar a viagem:', error);
        alert('Erro ao deletar a viagem. Tente novamente mais tarde.');
      }
    );
  }

  rejectTrip(trip: any) {
    if (!trip.id) {
      alert('ID da viagem não encontrado.');
      return;
    }

    this.http.put(`http://localhost:3000/viagens/${trip.id}/rejeitar`, {}).subscribe(
      (response: any) => {
        console.log('Viagem rejeitada com sucesso', response);
        trip.accepted = false; 
        trip.motorista = null;
        trip.taxi = null; 
      },
      (error) => {
        console.error('Erro ao rejeitar a viagem:', error);
        alert('Erro ao rejeitar a viagem. Tente novamente mais tarde.');
      }
    );
  }

  confirmTrip(trip: any) {
    if (!trip.id) {
      alert('ID da viagem não encontrado.');
      return;
    }

    this.http.put(`http://localhost:3000/viagens/${trip.id}/confirmar`, {}).subscribe(
      (response: any) => {
        console.log('Viagem confirmada com sucesso', response);
        trip.atribuida = true; 
      },
      (error) => {
        console.error('Erro ao confirmar a viagem:', error);
        alert('Erro ao confirmar a viagem. Tente novamente mais tarde.');
      }
    );
  }

  acceptMotorista(trip: any) {
    if (!trip.id) {
      alert('ID da viagem não encontrado.');
      return;
    }

    this.http.put(`http://localhost:3000/viagens/${trip.id}/confirmar`, {}).subscribe(
      (response: any) => {
        console.log('Motorista aceito com sucesso', response);
        trip.atribuida = true;
        alert('Motorista aceito com sucesso!');
      },
      (error) => {
        console.error('Erro ao aceitar o motorista:', error);
        alert('Erro ao aceitar o motorista. Tente novamente mais tarde.');
      }
    );
  }

  rejectMotorista(trip: any) {
    if (!trip.id || !trip.motorista) {
      alert('ID da viagem ou do motorista não encontrado.');
      return;
    }
  
    this.http.put(`http://localhost:3000/viagens/${trip.id}/rejeitar`, { motorista: trip.motorista }).subscribe(
      (response: any) => {
        console.log('Motorista rejeitado com sucesso', response);
        trip.motorista = null; // Remove o motorista da viagem no frontend
        trip.taxi = null; // Remove o táxi da viagem no frontend
        alert('Motorista rejeitado com sucesso!');
      },
      (error) => {
        console.error('Erro ao rejeitar o motorista:', error);
        alert('Erro ao rejeitar o motorista. Tente novamente mais tarde.');
      }
    );
  }
  

  resetFormData() {
    this.formData = {
      currentLocation: '',
      destination: '',
      numPeople: 1,
      clientName: '',
      nivelConforto: 'Básico',
      data: null,
    };
    this.showMap = false;
    this.destinationPostalCode = '';
    this.currentLocationPostalCode = '';
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.reverseGeocode(latitude, longitude).then((address) => {
            this.formData.currentLocation = address;
          });
        },
        () => {
          alert('Não foi possível obter a localização. Por favor, insira manualmente.');
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        const detailedAddress = [
          address.road,
          address.suburb,
          address.city || address.town || address.village,
          address.state,
          address.postcode
        ].filter(Boolean).join(', ');

        return detailedAddress || 'Localização desconhecida';
      } else {
        return 'Localização desconhecida';
      }
    } catch (error) {
      console.error('Erro ao obter o endereço:', error);
      return 'Erro ao obter o endereço';
    }
  }

  async getDestinationFromPostalCode() {
    if (!this.destinationPostalCode) {
      alert('Por favor, insira um código postal válido para o destino.');
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${this.destinationPostalCode}&addressdetails=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const address = data[0].address;
        const detailedAddress = [
          address.road,
          address.suburb,
          address.city || address.town || address.village,
          address.state,
          address.postcode
        ].filter(Boolean).join(', ');

        this.formData.destination = detailedAddress || 'Destino desconhecido';
      } else {
        alert('Não foi possível encontrar um endereço para o código postal fornecido.');
      }
    } catch (error) {
      console.error('Erro ao obter o endereço do destino a partir do código postal:', error);
      alert('Erro ao obter o endereço do destino a partir do código postal.');
    }
  }

  async getCurrentLocationFromPostalCode() {
    if (!this.currentLocationPostalCode) {
      alert('Por favor, insira um código postal válido para a localização atual.');
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${this.currentLocationPostalCode}&addressdetails=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const address = data[0].address;
        const detailedAddress = [
          address.road,
          address.suburb,
          address.city || address.town || address.village,
          address.state,
          address.postcode
        ].filter(Boolean).join(', ');

        this.formData.currentLocation = detailedAddress || 'Destino desconhecido';
      } else {
        alert('Não foi possível encontrar um endereço para o código postal fornecido.');
      }
    } catch (error) {
      console.error('Erro ao obter o endereço do destino a partir do código postal:', error);
      alert('Erro ao obter o endereço do destino a partir do código postal.');
    }
  }

  openMap() {
    this.showMap = true;

    setTimeout(() => {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map('map', {
        center: [38.736946, -9.142685],
        zoom: 13
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;

        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

        this.marker = L.marker([lat, lng]).addTo(this.map);
        this.reverseGeocode(lat, lng).then((address) => {
          this.formData.destination = address;
          this.showMap = false;
        });
      });

      this.map.invalidateSize();
    }, 0);
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

  calculateTime(distance: number): number {
    return Math.ceil(distance * 4); // Tempo em minutos
  }

  calculateCost(distance: number, nivelConforto: string, horarioInicio: string, tabelaPrecos: { [key: string]: number }, agravamento: number): number {
    const precoMinuto = tabelaPrecos[nivelConforto];
    const minutosTotais = distance * 4; // 1 km equivale a 4 minutos
    const inicio = new Date(horarioInicio);
    console.log('Distância:', distance, 'km');
    console.log('Minutos totais:', minutosTotais);
    console.log('Preço por minuto:', precoMinuto);

    let total = 0;

    for (let i = 0; i < minutosTotais; i++) {
      const horaAtual = (inicio.getHours() + Math.floor(i / 60)) % 24; // Calcula a hora com base no tempo decorrido
      let preco = precoMinuto;

      // Aplica o agravamento noturno se estiver entre 21h e 6h
      if (horaAtual >= 21 || horaAtual < 6) {
        preco *= 1 + (agravamento / 100);
      }

      total += preco;
    }

    return parseFloat(total.toFixed(2)); // Retorna o custo total arredondado para 2 casas decimais
  }

  ngAfterViewInit() {
    if (this.showMap) {
      this.openMap();
    }
  }
   voltarMenuPrincipal() {
  this.router.navigate(['/']); // Substitua '/menu-principal' pela rota correta
}
}