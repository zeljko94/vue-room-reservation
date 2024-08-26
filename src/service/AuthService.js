import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { BaseRestApiService } from './BaseRestApiService';

export class AuthService extends BaseRestApiService {
    
    constructor(loggedUserTokenKey) {
        super();
        this.loggedUserTokenKey = loggedUserTokenKey || 'userToken'; // Ensure you use the provided key or default to 'user'
    }

    async login(username, password) {
        try {
            const response = await axios.post(`${this.apiUrl}/Auth/Login`, {
                username: username,
                password: password,
            });
    
            if (response.status === 200) {
                const token = response.data;
                if (token) {
                    this.setLoggedInUserToken(token);
                    return token;
                } else {
                    throw new Error('Login failed: No token received');
                }
            } else {
                throw new Error(`Login failed: Status code ${response.status}`);
            }
        } catch (error) {
            throw error;
        }
    }
    

    async register(name, lastName, email, username, password, role) {
        try {
            const response = await axios.post(`${this.apiUrl}/Auth/Register`, {
                name,
                lastName,
                email,
                username,
                password,
                role,
            });

            return response.data;
        } catch (error) {
            console.error('Registration request failed:', error);
            throw error;
        }
    }

    getUserId() {
        const token = this.getLoggedInUserToken();
        return token ? this.decodeToken(token)?.nameid : null;
    }

    setLoggedInUserToken(token) {
        localStorage.setItem(this.loggedUserTokenKey, JSON.stringify(token));
    }

    isLoggedIn() {
        const token = this.getLoggedInUserToken();
        return token !== null && !this.isTokenExpired(token);
    }

    isAdmin() {
        const token = this.getLoggedInUserToken();
        const decodedToken = this.decodeToken(token);
        return decodedToken && decodedToken.role === 'admin';
    }

    getLoggedInUserToken() {
        return JSON.parse(localStorage.getItem(this.loggedUserTokenKey));
    }

    logout() {
        localStorage.removeItem(this.loggedUserTokenKey);
    }

    decodeToken(token) {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Token decoding failed:', error);
            return null;
        }
    }

    isTokenExpired(token) {
        const decodedToken = this.decodeToken(token);
        if (!decodedToken) return true;

        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    }
}
