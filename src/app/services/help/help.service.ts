import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { lastValueFrom } from 'rxjs';

export interface HelpTopic {
  id: string;
  title: string;
  content: string[];
}

export interface HelpSection {
  id: string;
  title: string;
  icon: string;
  topics: HelpTopic[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private api = inject(ApiService);

  // Centraliza todos os textos de ajuda organizados por seção
  public helpSections = signal<HelpSection[]>([]);
  public isLoading = signal(false);

  constructor() { }

  /**
   * Carrega os tópicos de ajuda do backend
   */
  public async loadTopics(): Promise<void> {
    // Evitar recarregamento se já estiver populado
    if (this.helpSections().length > 0) return;

    try {
      this.isLoading.set(true);
      const res: any = await lastValueFrom(this.api.get('help'));
      if (res && res.data) {
        this.helpSections.set(res.data);
      }
    } catch (error) {
      console.error('Erro ao carregar Help Topics', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtém um tópico de ajuda específico pelo ID (busca em todas as seções)
   */
  getTopic(id: string): HelpTopic | undefined {
    for (const section of this.helpSections()) {
      const found = section.topics.find(t => t.id === id);
      if (found) return found;
    }
    return undefined;
  }

  async createSection(data: any): Promise<any> {
    const res: any = await lastValueFrom(this.api.post('help', data));
    await this.forceReload();
    return res;
  }

  async updateSection(id: string, data: any): Promise<any> {
    const res: any = await lastValueFrom(this.api.put(`help/${id}`, data));
    await this.forceReload();
    return res;
  }

  async deleteSection(id: string): Promise<any> {
    const res: any = await lastValueFrom(this.api.delete(`help/${id}`));
    await this.forceReload();
    return res;
  }

  async addTopic(sectionId: string, data: any): Promise<any> {
    const res: any = await lastValueFrom(this.api.post(`help/${sectionId}/topics`, data));
    await this.forceReload();
    return res;
  }

  async updateTopic(sectionId: string, topicId: string, data: any): Promise<any> {
    const res: any = await lastValueFrom(this.api.put(`help/${sectionId}/topics/${topicId}`, data));
    await this.forceReload();
    return res;
  }

  async deleteTopic(sectionId: string, topicId: string): Promise<any> {
    const res: any = await lastValueFrom(this.api.delete(`help/${sectionId}/topics/${topicId}`));
    await this.forceReload();
    return res;
  }

  private async forceReload() {
    this.helpSections.set([]);
    await this.loadTopics();
  }
}

