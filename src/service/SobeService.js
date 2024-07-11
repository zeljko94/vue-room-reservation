export class SobeService {

    getSobe() {
        return fetch('/demo/data/sobe.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
