import { Injectable, inject } from '@angular/core';
import { Cliente } from '../models/cliente.model';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private db: Firestore = inject(Firestore);

  getClientes(): Observable<Cliente[]> {
    const clientesCollection = collection(this.db, 'clientes');
    return collectionData(clientesCollection, { idField: 'id' }) as Observable<Cliente[]>;
  }

  async agregarCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    const clientesCollection = collection(this.db, 'clientes');
    const docRef = await addDoc(clientesCollection, {
      nCliente: cliente.nCliente,
      nombre: cliente.nombre,
      metodoPago: cliente.metodoPago
    });
    return { id: docRef.id, ...cliente };
  }

  async modificarCliente(cliente: Cliente): Promise<void> {
    if (!cliente.id) throw new Error('ID de cliente no proporcionado');
    const documentRef = doc(this.db, 'clientes', cliente.id);
    await updateDoc(documentRef, {
      nCliente: cliente.nCliente,
      nombre: cliente.nombre,
      metodoPago: cliente.metodoPago
    });
  }

  async eliminarCliente(cliente: Cliente): Promise<void> {
    if (!cliente.id) throw new Error('ID de cliente no proporcionado');
    const documentRef = doc(this.db, 'clientes', cliente.id);
    await deleteDoc(documentRef);
  }
}
