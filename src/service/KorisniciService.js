export class KorisniciService {

    getKorisnici() {
        return fetch('/demo/data/korisnici.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
