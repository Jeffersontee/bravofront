export type PriorityLevel = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE' | '';

export interface GUTValues {
  gravity: number;
  urgency: number;
  trend: number;
}

/**
 * Deduz o nível de prioridade (cores) baseado nos valores da Matriz GUT herdados.
 */
export function getPriorityFromGUT(gravity: number = 1, urgency: number = 1, trend: number = 1): PriorityLevel {
  if (gravity === 5 && urgency === 5 && trend === 5) {
    return 'URGENTE';
  } else if (gravity === 4 && urgency === 4 && trend === 3) {
    return 'ALTA';
  } else if (gravity === 3 && urgency === 3 && trend === 2) {
    return 'MEDIA';
  } else if (gravity === 1 && urgency === 1 && trend === 1) {
    return 'BAIXA';
  } else {
    // Fallback para valores customizados não mapeados estritamente
    if (gravity >= 4) return 'ALTA';
    else if (gravity >= 3) return 'MEDIA';
    else return 'BAIXA';
  }
}

/**
 * Converte o nível de prioridade escolhido na UI para os respectivos valores da Matriz GUT.
 */
export function getGUTFromPriority(priority: PriorityLevel): GUTValues {
  switch (priority) {
    case 'BAIXA': return { gravity: 1, urgency: 1, trend: 1 };
    case 'MEDIA': return { gravity: 3, urgency: 3, trend: 2 };
    case 'ALTA': return { gravity: 4, urgency: 4, trend: 3 };
    case 'URGENTE': return { gravity: 5, urgency: 5, trend: 5 };
    default: return { gravity: 1, urgency: 1, trend: 1 };
  }
}
