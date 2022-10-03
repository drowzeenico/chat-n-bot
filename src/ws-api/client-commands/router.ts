import { Client } from '../connection';
import { IClientMessage } from '../server';
import { EchoCommand, EchoPayload, EchoResponse } from './echo';
import { PingCommand, PingPayload, PingResponse } from './ping';
import { BroadcastCommand, BroadcastPayload, BroadcastResponse } from './broadcast';

export interface ICommand<I, O> {
  readonly name: string;

  process(payload: I, client: Client): Promise<O>;
}

type ICommandProcessors = typeof EchoCommand.process | typeof PingCommand.process | typeof BroadcastCommand.process;
export type IPayload = Parameters<ICommandProcessors>[0];
export type IResponse = Awaited<ReturnType<ICommandProcessors>>;

type Handler = (msg: IClientMessage, client: Client) => Promise<IResponse>;

export const Router = new Map<string, Handler>();

Router.set(EchoCommand.name, async (msg: IClientMessage, client: Client): Promise<EchoResponse> => {
  return await EchoCommand.process(msg.payload as EchoPayload, client);
});

Router.set(PingCommand.name, async (msg: IClientMessage, client: Client): Promise<PingResponse> => {
  return await PingCommand.process(msg.payload as PingPayload, client);
});

Router.set(BroadcastCommand.name, async (msg: IClientMessage, client: Client): Promise<BroadcastResponse> => {
  return await BroadcastCommand.process(msg.payload as BroadcastPayload, client);
});
