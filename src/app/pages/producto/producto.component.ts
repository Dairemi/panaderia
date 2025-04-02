import { Component } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent {
  productos: Producto[] = [];
  producto: Producto = {
    id: '',
    descripcion: '',
    precio: 0
  };

  constructor(private productoService: ProductoService) {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (error) => console.error('Error:', error)
    });
  }

  insertarProducto(): void {
    if (!this.producto.descripcion || !this.producto.precio) {
      alert('Descripción y precio son obligatorios');
      return;
    }

    this.productoService.agregarProducto(this.producto)
      .then(() => {
        this.cargarProductos();
        this.limpiarFormulario();
      });
  }

  selectProducto(producto: Producto): void {
    this.producto = { ...producto };
  }

  updateProducto(): void {
    if (!this.producto.id) {
      alert('Selecciona un producto primero');
      return;
    }

    this.productoService.modificarProducto(this.producto)
      .then(() => {
        this.cargarProductos();
        this.limpiarFormulario();
      });
  }

  deleteProducto(producto: Producto): void {
    if (!confirm('¿Eliminar este producto?')) return;

    this.productoService.eliminarProducto(producto)
      .then(() => this.cargarProductos());
  }

  limpiarFormulario(): void {
    this.producto = { id: '', descripcion: '', precio: 0 };
  }
}
