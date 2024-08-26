export default class Soba {
    id: string;
    brojKreveta: number;
    naziv: string;
    opis: string;
    thumbnailImg: string;
    cijena: number;
  
    constructor(id: string, brojKreveta: number, naziv: string, opis: string, thumbnailImg: string, cijena: number) {
      this.id = id;
      this.brojKreveta = brojKreveta;
      this.naziv = naziv;
      this.opis = opis;
      this.thumbnailImg = thumbnailImg;
      this.cijena = cijena;
    }
  
    static fromApiResponse(response: any): Soba {
      return new Soba(response.id, response.brojKreveta, response.naziv, response.opis, response.thumbnailImg, response.cijena);
    }
  }
  