import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Reglas de validación por tipo de documento
 */
export const DOCUMENTO_REGLAS: Record<string, { largo: number; solo_numeros: boolean; label: string; ejemplo: string }> = {
  DNI:       { largo: 8,  solo_numeros: true,  label: 'DNI',                  ejemplo: '72345678' },
  PASAPORTE: { largo: 12, solo_numeros: false, label: 'Pasaporte',             ejemplo: 'AB1234567' },
  CE:        { largo: 12, solo_numeros: false, label: 'Carnet de Extranjería', ejemplo: '000123456' },
  OTRO:      { largo: 15, solo_numeros: false, label: 'Documento',             ejemplo: 'DOC-001' },
};

/** Validador que verifica el número según el tipo de documento seleccionado */
export function documentoValidator(tipoControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const parent = control.parent;
    if (!parent) return null;
    const tipo = parent.get(tipoControlName)?.value as string;
    const regla = DOCUMENTO_REGLAS[tipo];
    if (!regla) return null;

    const valor = control.value.toString().trim();

    if (tipo === 'DNI' && !/^\d{8}$/.test(valor)) {
      return { documento: `El DNI debe tener exactamente 8 dígitos numéricos` };
    }
    if (tipo === 'CE' && !/^\d{9,12}$/.test(valor)) {
      return { documento: `El Carnet de Extranjería debe tener entre 9 y 12 dígitos` };
    }
    if (tipo === 'PASAPORTE' && !/^[A-Za-z0-9]{6,12}$/.test(valor)) {
      return { documento: `El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos` };
    }
    if (valor.length < 6) {
      return { documento: `El ${regla.label} debe tener al menos 6 caracteres` };
    }
    return null;
  };
}

/** Devuelve el placeholder según el tipo de documento */
export function placeholderDocumento(tipo: string): string {
  return DOCUMENTO_REGLAS[tipo]?.ejemplo ?? 'Número de documento';
}

/** Validador de correo electrónico */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { email: 'Correo electrónico inválido' };
  };
}

/** Validador de teléfono peruano */
export function telefonoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const cleaned = control.value.toString().replace(/\s/g, '');
    if (!/^[9]\d{8}$/.test(cleaned) && !/^\d{7,9}$/.test(cleaned)) {
      return { telefono: 'Teléfono inválido (ej: 987654321 o 01234567)' };
    }
    return null;
  };
}

/** Validador de texto — solo letras, tildes y espacios */
export function soloLetrasValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s'\-]+$/.test(control.value)) {
      return { soloLetras: 'Solo se permiten letras y espacios' };
    }
    return null;
  };
}
