import { pbkdf2Sync } from 'crypto';
import { Config } from '../common/config';
import Database from '../common/db';
import { RegistrationData } from '../http-api/controller/user/register';
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
    // stupid TypeORM can't return User Entity after save
    // so that's why we need to re-request our user
    // ridiculous!
    const saved = await this.repo.save({
      login: userToSave.login,
      email: userToSave.email,
      password: this.hashPassword(userToSave.password),
    });

    return await this.repo.findOneBy({ id: saved.id });
  }
}

export const UserService = new UserServices();
