import { Injectable } from '@angular/core';
import { cargarValorDesdeStorage, guardarValorEnStorage } from '../../../shared/utils/storage.util';
import { PerfilAdmin } from '../interfaces/perfil-admin.interface';

const CLAVE_STORAGE = 'rla_perfil_admin';

@Injectable({ providedIn: 'root' })
export class AdminPerfilService {
  private valorPorDefecto(): PerfilAdmin {
    return {
      nombres: 'Administrador',
      apellidos: 'del Sistema',
      dni: '',
      correo: '',
      telefono: '',
      fotoUrl: undefined,
    };
  }

  obtener(): PerfilAdmin {
    return cargarValorDesdeStorage<PerfilAdmin>(CLAVE_STORAGE, this.valorPorDefecto());
  }

  guardar(perfil: PerfilAdmin): void {
    guardarValorEnStorage(CLAVE_STORAGE, perfil);
  }
}