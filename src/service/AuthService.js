import { KorisniciService } from './KorisniciService';

export class AuthService {

    constructor(loggedUserKey) {
        this.loggedUserKey = 'user';
    }


    login(email, password) {
        let korisniciService = new KorisniciService();
        return korisniciService.getKorisnici().then((korisnici) => {
            return korisnici.find(x => x.email === email && x.password === password);
        });

    }

    getUserId() {
        return this.getLoggedInUser().id;
    }

    setLoggedInUser(user) {
        localStorage.setItem(this.loggedUserKey, JSON.stringify(user));
    }

    isLoggedIn() {
        return this.getLoggedInUser() != undefined;
    }


    isAdmin() { 
        return this.getLoggedInUser() && this.getLoggedInUser().role == 'admin';
    }

    getLoggedInUser() {
        return JSON.parse(localStorage.getItem(this.loggedUserKey));
    }

    logout() {
        localStorage.setItem(this.loggedUserKey, null);
    }
}
