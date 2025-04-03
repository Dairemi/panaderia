export interface Producto {
  id?: string;
  descripcion: string;
  precio: number;
  clienteId?: string | null;
}
