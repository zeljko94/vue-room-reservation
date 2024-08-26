import { BaseRestApiService } from "./BaseRestApiService";

export class SobeService extends BaseRestApiService {

    constructor() {
        super();
        this.tableName = 'Sobe';
    }

    async getSobe() {
        return this.get(this.tableName);
    }

    async getSoba(id) {
        return this.get(`${this.tableName}/${id}`);
    }

    async createSoba(roomDto) {
        return this.post(this.tableName, roomDto);
    }

    async updateSoba(id, roomDto) {
        return this.put(`${this.tableName}/${id}`, roomDto);
    }

    async deleteSoba(id) {
        return this.delete(`${this.tableName}/${id}`);
    }

    async deleteSobe(ids) {
        return this.post(`${this.tableName}/delete-multiple`, ids);
    }
}
