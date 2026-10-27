
import { Injectable, signal } from '@angular/core';
import { Grado } from '../models/grado.model';
import { Nivel } from '../models/nivel.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GradoService {
  private readonly apiUrl = environment.apiUrl;
  private readonly claveStorage = 'grados';

  private cargarGrados(): Grado[] {
    const datos = localStorage.getItem(this.claveStorage);

    if (datos) {
      try {
        return JSON.parse(datos) as Grado[];
      } catch {
        return [];
      }
    }

    // Grados iniciales para que puedas probar el CRUD.
    const iniciales: Grado[] = [
      { id: 'G001', nombre: '3 años', nivel: 'Inicial' },
      { id: 'G002', nombre: '4 años', nivel: 'Inicial' },
      { id: 'G003', nombre: '5 años', nivel: 'Inicial' },
      { id: 'G004', nombre: '1.º grado', nivel: 'Primaria' },
      { id: 'G005', nombre: '2.º grado', nivel: 'Primaria' },
      { id: 'G006', nombre: '3.º grado', nivel: 'Primaria' },
      { id: 'G007', nombre: '4.º grado', nivel: 'Primaria' },
      { id: 'G008', nombre: '5.º grado', nivel: 'Primaria' },
      { id: 'G009', nombre: '6.º grado', nivel: 'Primaria' },
      { id: 'G010', nombre: '1.º grado', nivel: 'Secundaria' },
      { id: 'G011', nombre: '2.º grado', nivel: 'Secundaria' },
      { id: 'G012', nombre: '3.º grado', nivel: 'Secundaria' },
      { id: 'G013', nombre: '4.º grado', nivel: 'Secundaria' },
      { id: 'G014', nombre: '5.º grado', nivel: 'Secundaria' }
    ];

    localStorage.setItem(
      this.claveStorage,
      JSON.stringify(iniciales)
    );

    return iniciales;
  }

  private readonly listaGrados = signal<Grado[]>(this.cargarGrados());

  readonly grados = this.listaGrados.asReadonly();

  getTodos(): Grado[] {
    return this.listaGrados();
  }

  getPorId(id: string): Grado | undefined {
    return this.listaGrados().find(grado => grado.id === id);
  }

  getPorNivel(nivel: Nivel): Grado[] {
    return this.listaGrados().filter(grado => grado.nivel === nivel);
  }

  crear(grado: Omit<Grado, 'id'>): void {
    const nuevo: Grado = {
      ...grado,
      id: this.generarId()
    };

    this.guardar([...this.listaGrados(), nuevo]);
  }

  actualizar(id: string, cambios: Omit<Grado, 'id'>): boolean {
    const existe = this.listaGrados().some(grado => grado.id === id);

    if (!existe) {
      return false;
    }

    this.guardar(
      this.listaGrados().map(grado =>
        grado.id === id ? { ...grado, ...cambios } : grado
      )
    );

    return true;
  }

  eliminar(id: string): boolean {
    const existe = this.listaGrados().some(grado => grado.id === id);

    if (!existe) {
      return false;
    }

    this.guardar(
      this.listaGrados().filter(grado => grado.id !== id)
    );

    return true;
  }

  private guardar(grados: Grado[]): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(grados));
    this.listaGrados.set(grados);
  }

  private generarId(): string {
    return 'G' + Date.now().toString(36).toUpperCase();
  }
}
