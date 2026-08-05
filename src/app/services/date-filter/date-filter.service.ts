import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFilterService {
  // Por padrão, pega o primeiro e o último dia do mês atual
  public startDate = signal<string>(this.getFirstDayOfMonth());
  public endDate = signal<string>(this.getLastDayOfMonth());

  public setDateRange(start: string, end: string) {
    this.startDate.set(start);
    this.endDate.set(end);
  }

  private getFirstDayOfMonth(): string {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString();
  }

  private getLastDayOfMonth(): string {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return lastDay.toISOString();
  }
}
