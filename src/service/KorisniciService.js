import { BaseRestApiService } from "./BaseRestApiService";

export class KorisniciService extends BaseRestApiService {
    constructor() {
        super();
        this.tableName = 'Users';
    }

    async getKorisnici() {
        return this.get(this.tableName);
    }

    async getKorisnikById(id) {
        return this.get(`${this.tableName}/${id}`);
    }

    async createKorisnik(user) {
        return this.post(this.tableName, user);
    }

    async updateKorisnik(id, user) {
        return this.put(`${this.tableName}/${id}`, user);
    }

    async deleteKorisnik(id) {
        return this.delete(`${this.tableName}/${id}`);
    }

    async deleteKorisnici(ids) {
        return this.post(`${this.tableName}/delete-multiple`, ids);
    }
}
