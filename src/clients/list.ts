import { faker } from '@faker-js/faker';
import { UserTypes } from '../types/user';

export const PASSWORD = 'Password';
// all passwords were set to 'password'

export function createRegistrationData(): UserTypes.RegistrationData {
  return {
    login: faker.internet.userName(),
    email: faker.internet.email(),
    password: PASSWORD,
  };
}

export const getPause = (min = 1_000, max = 10_000) => {
  return faker.datatype.number({ min, max });
};
