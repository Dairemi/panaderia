import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';

interface RegistroForm {
  id?: string;
  nCliente?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  clienteId?: string;
}

interface RelacionForm {
  clienteId: string;
  productoId: string;
}

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
  showRelacionForm = false;
  formType: 'create' | 'edit' = 'create';
  registroForm: RegistroForm = {};
  relacionForm: RelacionForm = {
    clienteId: '',
    productoId: ''
  };
  errorMessage: string | null = null;
  nextClienteNumber: number = 1;
  currentView: 'combined' | 'clientes' | 'panaderia' = 'combined';

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
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes.sort((a, b) => parseInt(a.nCliente) - parseInt(b.nCliente));
        this.calculateNextClienteNumber();

        this.productoService.getProductos().subscribe({
          next: (productos) => {
            this.productos = productos;
            this.combinarDatos();
          },
          error: (error) => {
            console.error('Error al cargar productos:', error);
            this.errorMessage = 'Error al cargar los productos';
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.errorMessage = 'Error al cargar los clientes';
      }
    });
  }

  calculateNextClienteNumber(): void {
    if (this.clientes.length > 0) {
      const lastNumber = parseInt(this.clientes[this.clientes.length - 1].nCliente);
      this.nextClienteNumber = lastNumber + 1;
    } else {
      this.nextClienteNumber = 1;
    }
  }

  combinarDatos(): void {
    this.datosCombinados = this.productos
      .filter(p => p.clienteId)
      .map(producto => {
        const cliente = this.clientes.find(c => c.id === producto.clienteId);
        return {
          id: producto.id,
          nCliente: cliente?.nCliente || 'Sin número',
          nombreCliente: cliente?.nombre || 'Cliente no encontrado',
          nombrePan: producto.descripcion,
          precio: producto.precio,
          clienteId: cliente?.id,
          productoId: producto.id,
          productoData: producto,
          clienteData: cliente
        };
      })
      .sort((a, b) => {
        const numA = parseInt(a.nCliente) || 0;
        const numB = parseInt(b.nCliente) || 0;
        return numA - numB;
      });
  }

  productosFiltrados(): Producto[] {
    return this.productos.filter(p => !p.clienteId);
  }

  changeView(view: 'combined' | 'clientes' | 'panaderia'): void {
    this.currentView = view;
  }

  openRelacionForm(): void {
    this.relacionForm = {
      clienteId: '',
      productoId: ''
    };
    this.showRelacionForm = true;
    this.errorMessage = null;
  }

  async relacionarProductoCliente(): Promise<void> {
    try {
      if (!this.relacionForm.clienteId || !this.relacionForm.productoId) {
        this.errorMessage = 'Debe seleccionar un cliente y un producto';
        return;
      }

      const producto = this.productos.find(p => p.id === this.relacionForm.productoId);
      if (!producto) {
        this.errorMessage = 'Producto no encontrado';
        return;
      }

      await this.productoService.modificarProducto({
        ...producto,
        clienteId: this.relacionForm.clienteId
      });

      this.showRelacionForm = false;
      this.cargarDatos();
    } catch (error) {
      console.error('Error al relacionar:', error);
      this.errorMessage = 'Error al relacionar producto con cliente';
    }
  }

  async eliminarRelacion(item: any): Promise<void> {
    if (!confirm('¿Eliminar esta relación permanentemente?')) return;

    try {
      await this.productoService.modificarProducto({
        ...item.productoData,
        clienteId: null
      });
      this.cargarDatos();
    } catch (error) {
      console.error('Error al eliminar relación:', error);
      this.errorMessage = 'Error al eliminar la relación';
    }
  }

  openClienteForm(cliente?: Cliente): void {
    this.formType = cliente ? 'edit' : 'create';
    this.errorMessage = null;

    this.registroForm = {
      id: cliente?.id,
      nCliente: cliente?.nCliente || this.nextClienteNumber.toString(),
      nombre: cliente?.nombre || ''
    };
    this.showForm = true;
  }

  openProductoForm(producto?: Producto): void {
    this.formType = producto ? 'edit' : 'create';
    this.errorMessage = null;

    this.registroForm = {
      id: producto?.id,
      descripcion: producto?.descripcion || '',
      precio: producto?.precio || 0
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.registroForm = {};
    this.errorMessage = null;
  }

  async submitForm(): Promise<void> {
    try {
      this.errorMessage = null;

      if (this.currentView === 'clientes') {
        const numeroCliente = parseInt(this.registroForm.nCliente || '0');
        if (isNaN(numeroCliente)) {
          this.errorMessage = 'El número de cliente debe ser un valor numérico';
          return;
        }

        if (this.formType === 'create') {
          const existeCliente = this.clientes.some(c => c.nCliente === this.registroForm.nCliente);
          if (existeCliente) {
            this.errorMessage = 'El número de cliente ya existe';
            return;
          }

          await this.clienteService.agregarCliente({
            nCliente: this.registroForm.nCliente || '',
            nombre: this.registroForm.nombre || ''
          });
        } else if (this.registroForm.id) {
          await this.clienteService.modificarCliente({
            id: this.registroForm.id,
            nCliente: this.registroForm.nCliente || '',
            nombre: this.registroForm.nombre || ''
          });
        }
      }
      else if (this.currentView === 'panaderia') {
        if (this.formType === 'create') {
          await this.productoService.agregarProducto({
            descripcion: this.registroForm.descripcion || '',
            precio: this.registroForm.precio || 0,
            clienteId: null
          });
        } else if (this.registroForm.id) {
          const productoExistente = this.productos.find(p => p.id === this.registroForm.id);
          if (productoExistente) {
            await this.productoService.modificarProducto({
              id: this.registroForm.id,
              descripcion: this.registroForm.descripcion || '',
              precio: this.registroForm.precio || 0,
              clienteId: productoExistente.clienteId || null
            });
          }
        }
      }

      this.closeForm();
      this.cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.errorMessage = 'Error al guardar los cambios. Verifica los datos.';
    }
  }

  async deleteCliente(cliente: Cliente): Promise<void> {
    if (!confirm('¿Eliminar este cliente y todas sus relaciones?')) return;

    try {
      const productosRelacionados = this.productos.filter(p => p.clienteId === cliente.id);
      for (const producto of productosRelacionados) {
        await this.productoService.modificarProducto({
          ...producto,
          clienteId: null
        });
      }

      await this.clienteService.eliminarCliente(cliente);
      this.cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.errorMessage = 'Error al eliminar el cliente';
    }
  }

  async deleteProducto(producto: Producto): Promise<void> {
    if (!confirm('¿Eliminar este producto permanentemente?')) return;

    try {
      await this.productoService.eliminarProducto(producto);
      this.cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.errorMessage = 'Error al eliminar el producto';
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
