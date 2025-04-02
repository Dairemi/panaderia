import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-relacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relacion.component.html',
  styleUrls: ['./relacion.component.css']
})
export class RelacionComponent implements OnInit {
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  datosCombinados: any[] = [];

  showForm = false;
  formType: 'create' | 'edit' = 'create';
  errorMessage: string | null = null;
  nextClienteNumber: number = 1;

  nCliente: string = '';
  nombreCliente: string = '';
  nombrePan: string = '';
  precio: number = 0;
  metodoPago: string = '';
  clienteId: string = '';

  constructor(
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.clienteService.getClientes().subscribe(clientes => {
      this.clientes = clientes.sort((a, b) => parseInt(a.nCliente) - parseInt(b.nCliente));
      this.calculateNextClienteNumber();
      this.productoService.getProductos().subscribe(productos => {
        this.productos = productos;
        this.combinarYOrdenarDatos();
      });
    });
  }

  calculateNextClienteNumber(): void {
    if (this.clientes.length === 0) {
      this.nextClienteNumber = 1;
      return;
    }

    const numerosClientes = this.clientes.map(c => parseInt(c.nCliente)).filter(n => !isNaN(n));

    if (numerosClientes.length === 0) {
      this.nextClienteNumber = 1;
      return;
    }

    numerosClientes.sort((a, b) => a - b);

    for (let i = 0; i < numerosClientes.length; i++) {
      if (numerosClientes[i] !== i + 1) {
        this.nextClienteNumber = i + 1;
        return;
      }
    }

    this.nextClienteNumber = numerosClientes[numerosClientes.length - 1] + 1;
  }

  combinarYOrdenarDatos(): void {
    const datos = this.productos.map(producto => {
      const cliente = producto.clienteId
        ? this.clientes.find(c => c.id === producto.clienteId)
        : null;

      return {
        id: producto.id,
        nCliente: cliente?.nCliente || '0',
        nombreCliente: cliente?.nombre || 'Sin cliente',
        nombrePan: producto.descripcion,
        precio: producto.precio,
        metodoPago: cliente?.metodoPago || '',
        clienteId: cliente?.id,
        productoData: producto,
        clienteData: cliente
      };
    });

    this.datosCombinados = datos.sort((a, b) => {
      const numA = parseInt(a.nCliente);
      const numB = parseInt(b.nCliente);
      return numA - numB;
    });
  }

  openForm(type: 'create' | 'edit', item?: any): void {
    this.formType = type;
    this.errorMessage = null;

    if (type === 'edit' && item) {
      this.nCliente = item.clienteData?.nCliente || '';
      this.nombreCliente = item.clienteData?.nombre || '';
      this.nombrePan = item.nombrePan;
      this.precio = item.precio;
      this.metodoPago = item.metodoPago;
      this.clienteId = item.clienteId || '';
    } else {
      this.nCliente = this.nextClienteNumber.toString();
      this.nombreCliente = '';
      this.nombrePan = '';
      this.precio = 0;
      this.metodoPago = '';
      this.clienteId = '';
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.nCliente = '';
    this.nombreCliente = '';
    this.nombrePan = '';
    this.precio = 0;
    this.metodoPago = '';
    this.clienteId = '';
  }

  validarCampos(): boolean {
    if (!this.nCliente || !this.nombreCliente || !this.nombrePan || !this.precio || !this.metodoPago) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return false;
    }
    if (this.precio <= 0) {
      this.errorMessage = 'El precio debe ser mayor a cero';
      return false;
    }
    return true;
  }

  async submitForm(): Promise<void> {
    if (!this.validarCampos()) {
      return;
    }

    try {
      if (this.formType === 'create') {
        const clienteExistente = this.clientes.find(c => c.nCliente === this.nCliente);
        if (clienteExistente) {
          this.nCliente = this.nextClienteNumber.toString();
          this.errorMessage = `Número de cliente ya existía. Se asignó automáticamente el ${this.nextClienteNumber}`;
          return;
        }

        const clienteCreado = await this.clienteService.agregarCliente({
          nCliente: this.nCliente,
          nombre: this.nombreCliente,
          metodoPago: this.metodoPago
        });

        await this.productoService.agregarProducto({
          descripcion: this.nombrePan,
          precio: this.precio,
          clienteId: clienteCreado.id
        });
      } else {
        if (this.clienteId) {
          await this.clienteService.modificarCliente({
            id: this.clienteId,
            nCliente: this.nCliente,
            nombre: this.nombreCliente,
            metodoPago: this.metodoPago
          });
        }

        const productoId = this.productos.find(p => p.clienteId === this.clienteId)?.id;
        if (productoId) {
          await this.productoService.modificarProducto({
            id: productoId,
            descripcion: this.nombrePan,
            precio: this.precio,
            clienteId: this.clienteId
          });
        }
      }

      this.closeForm();
      this.cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.errorMessage = 'Error al guardar los cambios. Verifica los datos.';
    }
  }

  async eliminarItem(item: any): Promise<void> {
    if (!confirm('¿Eliminar este registro permanentemente?')) return;

    try {
      if (item.clienteData?.id) {
        await this.clienteService.eliminarCliente(item.clienteData);
      }
      if (item.id) {
        await this.productoService.eliminarProducto(item.productoData);
      }
      this.cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.errorMessage = 'Error al eliminar el registro.';
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
