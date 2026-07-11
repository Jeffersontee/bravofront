import { Injectable, signal } from '@angular/core';

export interface Order {
  id: string;
  category: string;
  description: string;
  status: 'Solicitado' | 'Orçamento enviado' | 'Confirmado pelo cliente' | 'Técnico a caminho' | 'Concluído';
  initialEstimate: number;
  finalValue?: number;
  technician?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  public customerName = signal<string>('Jefferson');
  public customerAddress = signal<string>('Rua Januario da Cunha Barbosa, 178');
  public customerPhone = signal<string>('(11) 98765-4321');

  private ordersSignal = signal<Order[]>([
    // Pedido inicial simulado para dar contexto ao app
    {
      id: '#1KMZTBV',
      category: 'Elétrica',
      description: 'Troca de disjuntores',
      status: 'Orçamento enviado',
      initialEstimate: 110,
      finalValue: 150,
      technician: 'Carlos',
      createdAt: new Date()
    }
  ]);

  public readonly orders = this.ordersSignal.asReadonly();

  public createOrder(category: string, description: string, estimate: number) {
    const newOrder: Order = {
      id: `#${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      category,
      description,
      status: 'Solicitado',
      initialEstimate: estimate,
      createdAt: new Date()
    };

    this.ordersSignal.update(current => [newOrder, ...current]);

    // Simula a chegada de um orçamento pelo profissional após 5 segundos
    setTimeout(() => {
      this.simulateBudgetSent(newOrder.id);
    }, 5000);

    return newOrder;
  }

  public updateStatus(orderId: string, status: Order['status']) {
    this.ordersSignal.update(current =>
      current.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  public confirmBudget(orderId: string) {
    this.ordersSignal.update(current =>
      current.map(o => o.id === orderId ? { ...o, status: 'Confirmado pelo cliente' as const } : o)
    );

    // Simulação do fluxo: Técnico a caminho após 4 segundos
    setTimeout(() => {
      this.updateStatus(orderId, 'Técnico a caminho');
      
      // Simulação do fluxo: Concluído após 8 segundos
      setTimeout(() => {
        this.updateStatus(orderId, 'Concluído');
      }, 8000);

    }, 4000);
  }

  public rejectBudget(orderId: string) {
    // Remove ou cancela o pedido
    this.ordersSignal.update(current =>
      current.filter(o => o.id !== orderId)
    );
  }

  private simulateBudgetSent(orderId: string) {
    const technicians = ['Carlos', 'Renato', 'Felipe', 'Juliana'];
    const randomTech = technicians[Math.floor(Math.random() * technicians.length)];

    this.ordersSignal.update(current =>
      current.map(o => {
        if (o.id === orderId && o.status === 'Solicitado') {
          // Valor final um pouco maior que a estimativa, como no protótipo do Claude
          const finalVal = o.initialEstimate + Math.floor(Math.random() * 40) + 10;
          return {
            ...o,
            status: 'Orçamento enviado' as const,
            finalValue: finalVal,
            technician: randomTech
          };
        }
        return o;
      })
    );
  }
}
