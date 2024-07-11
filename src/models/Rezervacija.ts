export default class Rezervacija {
    id: number;
    korisnikId: number;
    sobaId: number;
    datumPocetka: Date;
    datumZavrsetka: Date;
    brojOsoba: number;
    cijena: number;
  
    constructor(id: number, korisnikId: number, sobaId: number, datumPocetka: Date, datumZavrsetka: Date, brojOsoba: number, cijena: number) {
      this.id = id;
      this.korisnikId = korisnikId;
      this.sobaId = sobaId;
      this.datumPocetka = datumPocetka;
      this.datumZavrsetka = datumZavrsetka;
      this.brojOsoba = brojOsoba;
      this.cijena = cijena;
    }
  
    static fromApiResponse(response: any): Rezervacija {
      return new Rezervacija(response.id, response.korisnikId, response.sobaId, response.datumPocetka, response.datumZavrsetka, response.brojOsoba, response.cijena);
    }
  }
  