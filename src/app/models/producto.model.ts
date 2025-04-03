export interface Producto {
  id?: string;
  descripcion: string;
  precio: number;
  clienteIds?: string[]; // Array para múltiples clientes
}
