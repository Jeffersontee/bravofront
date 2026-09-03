export class StatusUtil {
  static getStatusColor(status: string): string {
    switch (status) {
      case 'SOLICITADO': return 'secondary';
      case 'DATA_SUGERIDA': return 'warning';
      case 'PROPOSTO': return 'tertiary';
      case 'APROVADO': return 'success';
      case 'AGENDADO': return 'primary';
      case 'EM_DESLOCAMENTO': return 'tertiary';
      case 'CHECK_IN': return 'warning';
      case 'EM_EXECUCAO': return 'warning';
      case 'RELATORIO_CHECKOUT': return 'secondary';
      case 'CONCLUIDO': return 'success';
      case 'CANCELADO': return 'danger';
      case 'RECUSADO': return 'danger';
      default: return 'medium';
    }
  }

  static getStatusLabel(status: string): string {
    switch (status) {
      case 'SOLICITADO': return 'Solicitado / Pendente';
      case 'DATA_SUGERIDA': return 'Nova Data Sugerida';
      case 'PROPOSTO': return 'Proposta de Valor';
      case 'APROVADO': return 'Aprovado Lojista';
      case 'AGENDADO': return 'Agendado';
      case 'EM_DESLOCAMENTO': return 'Técnico a caminho';
      case 'CHECK_IN': return 'Técnico no local';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'RELATORIO_CHECKOUT': return 'Aguardando Assinatura';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      case 'RECUSADO': return 'Recusado';
      default: return status;
    }
  }
}
