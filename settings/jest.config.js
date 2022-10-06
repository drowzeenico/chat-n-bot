require('dotenv').config({ path: process.cwd() + '/.env.test' })

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
}
