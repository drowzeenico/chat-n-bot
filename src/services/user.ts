import { pbkdf2Sync } from 'crypto';
import { Config } from '../common/config';
import Database from '../common/db';
import { RegistrationData } from '../http-api/controllers/user';
import { User } from '../models/user';

class UserServices {
  private repo = Database.getRepository(User);

  hashPassword(password: string) {
    return pbkdf2Sync(password, Config.SALT, 1000, 64, `sha512`).toString(`hex`);
  }

  async getUserById(userId: number): Promise<User | null> {
    if (!userId) return null;
    const user = await this.repo.findOneBy({ id: userId });

    return user;
  }

  async save(userToSave: RegistrationData): Promise<User | null> {
    const userDTO = this.repo.create({
      login: userToSave.login,
      email: userToSave.email,
      password: this.hashPassword(userToSave.password),
    });

    return await this.repo.save(userDTO);
  }
}

export const UserService = new UserServices();
