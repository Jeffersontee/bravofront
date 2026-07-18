export interface ITimelineEvent {
    status: 'AGENDADO' | 'EM_DESLOCAMENTO' | 'CHECK_IN' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
    timestamp: string | Date;
    location?: { lat: number; lng: number };
    notes?: string;
}

export interface IServiceOrder {
    _id?: string;
    company_id: any; // Pode vir populado
    unit_id: any; // Pode vir populado
    service_id: any; // Pode vir populado
    collaborator_id?: any; // Pode vir populado
    scheduled_date?: string | Date;
    
    current_status: 'AGENDADO' | 'EM_DESLOCAMENTO' | 'CHECK_IN' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
    timeline: ITimelineEvent[];
    
    checkin_location?: { lat: number; lng: number };
    checkin_time?: string | Date;
    
    images_url?: string[];
    report_pdf_url?: string;
    follower_signature?: string;
    notes?: string;
    time_spent?: string;
    km_driven?: string;
    fuel_cost?: string;
    zone?: string;
    address_override?: string;
    observations?: string;
    
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
