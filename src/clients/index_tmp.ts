import { Worker } from 'worker_threads';
import Database, { makeDbConnection } from '../common/db';
import { User, UserDto } from '../models/user';
import { UserTypes } from '../types/user';
import { ThreadData } from './client';
import { HttpAPI } from './http-api';
import { getRegistrationData } from './templates';

type UserId = number;

const MAX_CLIENTS = 10;
const ClientPool = new Map<UserId, Worker>();
const http = new HttpAPI();

(async () => {
  await makeDbConnection();

  const createUsers = async (amount = MAX_CLIENTS) => {
    const newUsers: UserTypes.RegistrationData[] = [];
    for (let i = 0; i < amount; i++) {
      newUsers.push(getRegistrationData());
    }

    for (const user of newUsers) {
      await registrate(user);
    }
  };

  const registrate = async (data: UserTypes.RegistrationData): Promise<UserDto | string> => {
    const res = await http.reqistration(data);
    if (res.success) {
      return res.response;
    } else {
      return res.error.message;
    }
  };

  await createUsers();

  const users = await Database.getRepository(User).find({ take: MAX_CLIENTS });

  for (const [idx, user] of users.entries()) {
    const client = new Worker('./src/clients/worker.js', {
      workerData: {
        userId: user.id,
        createChat: idx % 4 === 0,
      } as ThreadData,
    });

    client.on('message', result => {
      console.log(result);
    });

    ClientPool.set(user.id, client);
  }
})();
