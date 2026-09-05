export class Address {
  _id?: string;
  user_id?: string;
  company_id?: string;
  unit_id?: string;
  title: string;
  zipcode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  address: string;
  house?: string;
  landmark?: string;
  lat: number;
  lng: number;
  is_default: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  constructor(data?: Partial<Address>) {
    this._id = data?._id;
    this.user_id = data?.user_id;
    this.company_id = data?.company_id;
    this.unit_id = data?.unit_id;
    this.title = data?.title || 'Endereço Principal';
    this.zipcode = data?.zipcode || '';
    this.street = data?.street || '';
    this.number = data?.number || data?.house || '';
    this.complement = data?.complement || '';
    this.neighborhood = data?.neighborhood || '';
    this.city = data?.city || '';
    this.state = data?.state || '';
    this.address = data?.address || '';
    this.house = data?.house || data?.number || '';
    this.landmark = data?.landmark || '';
    this.lat = Number(data?.lat || 0);
    this.lng = Number(data?.lng || 0);
    this.is_default = Boolean(data?.is_default);
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
  }

  static fromJson(json: any): Address {
    if (!json) return new Address();
    return new Address({
      _id: json._id || json.id,
      user_id: json.user_id,
      company_id: json.company_id,
      unit_id: json.unit_id,
      title: json.title || 'Endereço Principal',
      zipcode: json.zipcode || json.cep || '',
      street: json.street || json.logradouro || '',
      number: json.number || json.house || '',
      complement: json.complement || json.complemento || '',
      neighborhood: json.neighborhood || json.bairro || '',
      city: json.city || json.localidade || '',
      state: json.state || json.uf || '',
      address: json.address || '',
      house: json.house || json.number || '',
      landmark: json.landmark || '',
      lat: Number(json.lat || 0),
      lng: Number(json.lng || 0),
      is_default: Boolean(json.is_default),
      createdAt: json.createdAt || json.created_at,
      updatedAt: json.updatedAt || json.updated_at
    });
  }
}