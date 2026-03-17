export interface Place {
    id: bigint;
    name: string;
    lat: number;
    lng: number;
    google_place_id: string;
    type: 'RESTAURANT' | 'BAR' | 'BAKERY';
    submitted_by: bigint;
    created_at: Date;
}

export type PlaceInsert = Omit<Place, 'id' | 'created_at'>;

export type PlaceUpdate = Partial<Omit<Place, 'id'>>;