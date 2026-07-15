export class Address {
    constructor(
        public _id?: string,
        public title?: string,
        public address?: string,
        public landmark?: string,
        public house?: string,
        public lat?: number,
        public lng?: number,
        public user_id?: string,
        public city_id?: string,
        public created_at?: Date,
        public updated_at?: Date
    ) {}

    static fromJson(data: any): Address {
        if (!data) return new Address();

        let doc: any;
        if (typeof data === 'string') {
            try {
                // Tenta converter se for uma string JSON
                doc = JSON.parse(data);
            } catch (e) {
                // Se falhar (como o erro 'R.'), assume que a string é o próprio endereço
                return new Address(undefined, undefined, data);
            }
        } else {
            doc = data;
        }

        if (Array.isArray(doc)) doc = doc[0];

        // 2. Extração: Identifica se o objeto real está dentro de uma chave 'address', 'data' ou 'doc'
        // Garantimos que não pegamos a string do endereço formatado verificando o typeof
        const body = (doc?.address && typeof doc.address === 'object') ? doc.address : 
                     (doc?.data && typeof doc.data === 'object') ? doc.data : 
                     (doc?.doc && typeof doc.doc === 'object') ? doc.doc : doc;
        
        return new Address(
            body?._id || body?.id || doc?._id || doc?.id || doc?.uid,
            body?.title || body?.name || doc?.title || doc?.name,
            body?.address || doc?.address,
            body?.landmark || doc?.landmark,
            body?.house || doc?.house,
            body?.lat ?? doc?.lat ?? body?.latitude ?? doc?.latitude,
            body?.lng ?? doc?.lng ?? body?.longitude ?? doc?.longitude,
            body?.user_id || doc?.user_id,
            body?.city_id || doc?.city_id,
            body?.created_at ? new Date(body.created_at) : (doc?.created_at ? new Date(doc.created_at) : undefined),
            body?.updated_at ? new Date(body.updated_at) : (doc?.updated_at ? new Date(doc.updated_at) : undefined)
        );
    }
}