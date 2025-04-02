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
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {
  clientes: Cliente[] = [];
  cliente: Cliente = {
    id: '',
    nCliente: '',
    nombre: '',
    metodoPago: ''
  };

  constructor(private clienteService: ClienteService) {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (error) => console.error('Error:', error)
    });
  }

  insertarCliente(): void {
    if (!this.cliente.nCliente || !this.cliente.nombre) {
      alert('N° Cliente y Nombre son obligatorios');
      return;
    }

    this.clienteService.agregarCliente(this.cliente)
      .then(() => {
        this.cargarClientes();
        this.limpiarFormulario();
      });
  }

  selectCliente(cliente: Cliente): void {
    this.cliente = { ...cliente };
  }

  updateCliente(): void {
    if (!this.cliente.id) {
      alert('Selecciona un cliente primero');
      return;
    }

    this.clienteService.modificarCliente(this.cliente)
      .then(() => {
        this.cargarClientes();
        this.limpiarFormulario();
      });
  }

  deleteCliente(cliente: Cliente): void {
    if (!confirm('¿Eliminar este cliente?')) return;

    this.clienteService.eliminarCliente(cliente)
      .then(() => this.cargarClientes());
  }

  limpiarFormulario(): void {
    this.cliente = {
      id: '',
      nCliente: '',
      nombre: '',
      metodoPago: ''
    };
  }
}
