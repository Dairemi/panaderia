import { Component } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent {
  clientes: Cliente[] = [];
  cliente: Cliente = {
    id: '',
    nCliente: '',
    nombre: '',
    metodo: ''
  };

  constructor(private clienteService: ClienteService) {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (error) => console.error('Error al cargar clientes:', error)
    });
  }

  async insertarCliente(): Promise<void> {
    if (!this.cliente.nCliente || !this.cliente.nombre || !this.cliente.metodo) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const nuevoCliente = await this.clienteService.agregarCliente({
        nCliente: this.cliente.nCliente,
        nombre: this.cliente.nombre,
        metodo: this.cliente.metodo
      });

      this.clientes.push(nuevoCliente);
      this.limpiarFormulario();
      alert('Cliente agregado correctamente');
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      alert('Error al agregar cliente');
    }
  }

  selectCliente(cliente: Cliente): void {
    this.cliente = { ...cliente };
  }

  async updateCliente(): Promise<void> {
    if (!this.cliente.id) {
      alert('Selecciona un cliente primero');
      return;
    }

    try {
      await this.clienteService.modificarCliente(this.cliente);
      const index = this.clientes.findIndex(c => c.id === this.cliente.id);
      if (index !== -1) {
        this.clientes[index] = { ...this.cliente };
      }
      this.limpiarFormulario();
      alert('Cliente actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      alert('Error al actualizar cliente');
    }
  }

  async deleteCliente(cliente: Cliente): Promise<void> {
    if (!confirm('¿Eliminar este cliente permanentemente?')) return;

    try {
      await this.clienteService.eliminarCliente(cliente);
      this.clientes = this.clientes.filter(c => c.id !== cliente.id);
      alert('Cliente eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert('Error al eliminar cliente');
    }
  }

  limpiarFormulario(): void {
    this.cliente = {
      id: '',
      nCliente: '',
      nombre: '',
      metodo: ''
    };
  }
}
