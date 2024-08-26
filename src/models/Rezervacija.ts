export default class Rezervacija {
    id: string;
    userId: string;
    roomId: string;
    startDate: Date;
    endDate: Date;
    brojOsoba: number;
    cijena: number;
  
    constructor(id: string, userId: string, roomId: string, startDate: Date, endDate: Date, brojOsoba: number, cijena: number) {
      this.id = id;
      this.userId = userId;
      this.roomId = roomId;
      this.startDate = startDate;
      this.endDate = endDate;
      this.brojOsoba = brojOsoba;
      this.cijena = cijena;
    }
  
    static fromApiResponse(response: any): Rezervacija {
      return new Rezervacija(response.id, response.userId, response.roomId, response.datumPocetka, response.datumZavrsetka, response.brojOsoba, response.cijena);
    }
  }
  