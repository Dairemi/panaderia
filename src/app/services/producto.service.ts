import { Injectable, inject } from '@angular/core';
import { Producto } from '../models/producto.model';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private db: Firestore = inject(Firestore);

  getProductos(): Observable<Producto[]> {
    const productosCollection = collection(this.db, 'productos');
    return collectionData(productosCollection, { idField: 'id' }) as Observable<Producto[]>;
  }

  async agregarProducto(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const productosCollection = collection(this.db, 'productos');
    const docRef = await addDoc(productosCollection, producto);
    return { id: docRef.id, ...producto };
  }

  async modificarProducto(producto: Producto): Promise<void> {
    if (!producto.id) throw new Error('ID de producto no proporcionado');
    const documentRef = doc(this.db, 'productos', producto.id);
    await updateDoc(documentRef, {
      descripcion: producto.descripcion,
      precio: producto.precio,
      clienteIds: producto.clienteIds || []  // Asegurarse de actualizar clienteIds
    });
  }

  async eliminarProducto(producto: Producto): Promise<void> {
    if (!producto.id) throw new Error('ID de producto no proporcionado');
    const documentRef = doc(this.db, 'productos', producto.id);
    await deleteDoc(documentRef);
  }
}
