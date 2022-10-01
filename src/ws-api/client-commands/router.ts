import { IClientMessage } from '../server';
import { EchoCommand, EchoPayload, EchoResponse } from './echo';
import { PingCommand, PingPayload, PingResponse } from './ping';

export interface ICommand<I, O> {
  readonly name: string;

  process(payload: I): Promise<O>;
}

type ICommandProcessors = typeof EchoCommand.process | typeof PingCommand.process;
export type IPayload = Parameters<ICommandProcessors>[0];
export type IResponse = Awaited<ReturnType<ICommandProcessors>>;

type Handler = (msg: IClientMessage) => Promise<IResponse>;

export const Router = new Map<string, Handler>();

Router.set(EchoCommand.name, async (msg: IClientMessage): Promise<EchoResponse> => {
  return await EchoCommand.process(msg.payload as EchoPayload);
});

Router.set(PingCommand.name, async (msg: IClientMessage): Promise<PingResponse> => {
  return await PingCommand.process(msg.payload as PingPayload);
});
