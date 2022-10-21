import { faker } from '@faker-js/faker';
import { ChatTypes } from '../types/chat';
import { UserTypes } from '../types/user';

export const PASSWORD = 'Password';
// all passwords were set to 'password'

export function getRegistrationData(): UserTypes.RegistrationData {
  return {
    login: faker.internet.userName(),
    email: faker.internet.email(),
    password: PASSWORD,
  };
}

export function getChatData(): ChatTypes.CreatePayload {
  const data: ChatTypes.CreatePayload = {
    name: faker.internet.domainName(),
  };

  if (Math.random() > 0.75) {
    data.password = PASSWORD;
  }

  return data;
}
