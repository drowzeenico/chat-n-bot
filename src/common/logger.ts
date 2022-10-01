import * as path from 'path'
import { createLogger, format, transports } from 'winston'

const projectPath = path.join(__dirname, '..', '..')

const createFileTransport = () => {
  return new transports.File({
    filename: path.join(projectPath, 'logs', 'combined.log'),
    maxsize: 1024 * 1024 * 128, // 128 MB
    maxFiles: 20,
    tailable: true,
  })
}

const createConsoleTransport = () => {
  const simpleFormat = format.simple()
  const MESSAGE = Symbol.for('message')
  const simpleTimestamp = format(info => {
    const { timestamp, module, ...rest } = info
    const simpled = simpleFormat.transform(rest)
    if (typeof simpled !== 'boolean') {
      // @ts-ignore
      simpled[MESSAGE] = `${timestamp} [${module}] ${simpled[MESSAGE]}`
    }
    return simpled
  })

  return new transports.Console({
    format: format.combine(format.timestamp(), format.colorize(), simpleTimestamp()),
  })
}

const logger = createLogger({
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
  exitOnError: false,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [createFileTransport(), createConsoleTransport()],
})

export const Logger = (module: string) => {
  return logger.child({ module })
}
