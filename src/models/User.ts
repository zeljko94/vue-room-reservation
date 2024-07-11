export default class User {
    id: number;
    username: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  
    constructor(id: number, username: string, name: string, lastName: string, email: string, password: string, role: string) {
      this.id = id;
      this.name = name;
      this.lastName = lastName;
      this.username = username;
      this.email = email;
      this.password = password;
      this.role = role;
    }
  
    getDisplayName(): string {
      return `${this.name} ${this.lastName}`;
    }
  
    static fromApiResponse(response: any): User {
      return new User(response.id, response.username, response.name, response.lastName, response.email, response.password, response.role);
    }
  }
  