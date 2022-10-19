import { UserTypes } from '../types/user';
import { HttpAPI } from './http-api';
import { User } from '../models/user';
import { UserService } from '../services/user';
import { createRegistrationData } from './list';

export class ClientManager {
  private http = new HttpAPI();
  private users: User[];

  constructor(private repo = UserService) {}

  get clients() {
    return this.users;
  }

  async init() {
    this.users = await this.repo.getUsers();
    if (this.users.length > 0) return;

    await this.createUser();
  }

  async createUser(amount = 10) {
    const newUsers: UserTypes.RegistrationData[] = [];
    for (let i = 0; i < amount; i++) {
      newUsers.push(createRegistrationData());
    }

    for (const user of newUsers) {
      await this.registrate(user);
    }
  }

  async registrate(data: UserTypes.RegistrationData) {
    const res = await this.http.reqistration(data);
    if (!res.success) {
      throw res.error;
    }

    const user = await this.repo.getUserById(res.response.id);
    if (!user) return;

    this.users.push(user!);
  }

  async auth(data: UserTypes.Credentials) {
    const res = await this.http.auth(data);
    if (!res.success) {
      throw res.error;
    }

    return res.response;
  }
}
