import { BaseRestApiService } from './BaseRestApiService';

export class RezervacijeService extends BaseRestApiService {

    constructor() {
        super();
        this.tableName = 'RoomReservations';
    }

    async getRezervacije() {
        return this.get(this.tableName);
    }

    async getRezervacija(id) {
        return this.get(`${this.tableName}/${id}`);
    }

    async createRezervacija(reservationDto) {
        return this.post(this.tableName, reservationDto);
    }

    async updateRezervacija(id, reservationDto) {
        return this.put(`${this.tableName}/${id}`, reservationDto);
    }

    async deleteRezervacija(id) {
        return this.delete(`${this.tableName}/${id}`);
    }

    async deleteRezervacije(ids) {
        return this.post(`${this.tableName}/delete-multiple`, ids);
    }
}
