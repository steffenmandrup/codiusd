import { mkdirSync as mkdir } from 'fs'
import { Injector } from 'reduct'
import Config from './Config'
import PodManager from './PodManager'
import PeerFinder from './PeerFinder'
import HttpServer from './HttpServer'
import BackgroundValidatePeers from './BackgroundValidatePeers'
import Secret from './Secret'
import Money from './Money'

import { create as createLogger } from '../common/log'
const log = createLogger('App')

export default class App {
  private config: Config
  private peerFinder: PeerFinder
  private httpServer: HttpServer
  private podManager: PodManager
  private secret: Secret
  private money: Money
  private backgroundValidatePeers: BackgroundValidatePeers

  constructor (deps: Injector) {
    this.config = deps(Config)

    if (!this.config.memdownPersist && !this.config.devMode) this.makeRootDir()

    this.peerFinder = deps(PeerFinder)
    this.httpServer = deps(HttpServer)
    this.podManager = deps(PodManager)
    this.secret = deps(Secret)
    this.money = deps(Money)
    this.backgroundValidatePeers = deps(BackgroundValidatePeers)
  }

  async start () {
    log.info('starting codiusd...')
    if (!this.config.devMode) {
      await this.secret.load()
      await this.money.start()
    }
    await this.httpServer.start()
    this.peerFinder.start()
    this.podManager.start()
    this.backgroundValidatePeers.start()
  }

  private makeRootDir () {
    try {
      mkdir(this.config.codiusRoot, 0o700)
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }
    }
  }
}
