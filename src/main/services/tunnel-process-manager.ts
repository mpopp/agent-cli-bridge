import { EventEmitter } from 'events'
import { spawn, ChildProcess } from 'child_process'
import { logger } from '../logger'
import type { TunnelProcessState, TunnelStateChangedPayload } from '../../types/ipc'
import type { TunnelConfigRow } from '../database/config'

export class TunnelProcessManager extends EventEmitter {
  private state: TunnelProcessState = 'idle'
  private process: ChildProcess | null = null
  private intentionallyStopped = false
  private stopResolve: (() => void) | null = null

  getState(): TunnelProcessState {
    return this.state
  }

  private setState(newState: TunnelProcessState): void {
    this.state = newState
    const payload: TunnelStateChangedPayload = { state: newState }
    this.emit('stateChanged', payload)
  }

  start(config: TunnelConfigRow): void {
    if (this.state === 'running') {
      logger.warn('TunnelProcessManager: start() called while already running')
      return
    }

    logger.info({ command: config.command }, 'TunnelProcessManager: starting tunnel process')
    this.intentionallyStopped = false

    const parts = config.command.split(/\s+/)
    const cmd = parts[0]
    const args = parts.slice(1)

    this.process = spawn(cmd, args, { stdio: 'ignore', detached: false })

    this.setState('running')

    this.process.on('close', (code) => {
      logger.info({ code }, 'TunnelProcessManager: process closed')
      this.process = null
      if (this.stopResolve) {
        this.stopResolve()
        this.stopResolve = null
      }
      if (!this.intentionallyStopped) {
        this.setState('stopped')
      } else {
        this.setState('idle')
      }
    })

    this.process.on('error', (err) => {
      logger.error({ err }, 'TunnelProcessManager: process error')
      this.process = null
      if (this.stopResolve) {
        this.stopResolve()
        this.stopResolve = null
      }
      this.setState('error')
    })
  }

  stop(): Promise<void> {
    if (!this.process || this.state !== 'running') {
      this.setState('idle')
      return Promise.resolve()
    }

    this.intentionallyStopped = true

    return new Promise<void>((resolve) => {
      this.stopResolve = resolve

      const killTimeout = setTimeout(() => {
        if (this.process) {
          logger.warn('TunnelProcessManager: SIGTERM timeout, sending SIGKILL')
          this.process.kill('SIGKILL')
        }
      }, 5000)

      this.process!.once('close', () => {
        clearTimeout(killTimeout)
      })

      this.process!.kill('SIGTERM')
    })
  }
}

export const tunnelManager = new TunnelProcessManager()
