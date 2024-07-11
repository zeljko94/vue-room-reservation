export class RezervacijeService {

    getRezervacije() {
        return fetch('/demo/data/rezervacije.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
