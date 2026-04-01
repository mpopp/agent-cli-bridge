import { spawn } from 'child_process'
import { AppError } from '../errors/AppError'
import { logExecution } from '../services/history-service'

export interface ExecuteOptions {
  cwd?: string
  timeoutSeconds: number
  maxOutputBytes: number
}

export interface ExecuteResult {
  exitCode: number
  stdout: string
  stderr: string
}

export const executeCommand = (command: string, options: ExecuteOptions): Promise<ExecuteResult> => {
  return new Promise((resolve, reject) => {
    const { cwd, timeoutSeconds, maxOutputBytes } = options

    const child = spawn(command, [], {
      shell: true,
      cwd: cwd ?? process.env.HOME ?? process.cwd(),
      detached: true
    })

    const killChild = () => {
      try {
        if (child.pid !== undefined) {
          process.kill(-child.pid, 'SIGKILL')
        }
      } catch {
        child.kill('SIGKILL')
      }
    }

    let stdoutBuf = ''
    let stderrBuf = ''
    let outputExceeded = false
    let timedOut = false
    const startTime = Date.now()

    const timer = setTimeout(() => {
      timedOut = true
      killChild()
    }, timeoutSeconds * 1000)

    child.stdout.on('data', (chunk: Buffer) => {
      if (outputExceeded) return
      stdoutBuf += chunk.toString()
      if (Buffer.byteLength(stdoutBuf + stderrBuf) > maxOutputBytes) {
        outputExceeded = true
        killChild()
      }
    })

    child.stderr.on('data', (chunk: Buffer) => {
      if (outputExceeded) return
      stderrBuf += chunk.toString()
      if (Buffer.byteLength(stdoutBuf + stderrBuf) > maxOutputBytes) {
        outputExceeded = true
        killChild()
      }
    })

    child.on('close', (code) => {
      clearTimeout(timer)
      const duration = Date.now() - startTime

      if (timedOut) {
        logExecution({
          command,
          cwd: cwd ?? process.env.HOME ?? process.cwd(),
          exitCode: null,
          duration,
          status: 'executed',
          blockReason: null,
          stdoutPreview: stdoutBuf,
          stderrPreview: stderrBuf + '\n[TIMEOUT EXCEEDED]'
        })
        return reject(new AppError(500, 'EXECUTION_TIMEOUT', 'Command execution exceeded the timeout limit.'))
      }

      if (outputExceeded) {
        logExecution({
          command,
          cwd: cwd ?? process.env.HOME ?? process.cwd(),
          exitCode: null,
          duration,
          status: 'executed',
          blockReason: null,
          stdoutPreview: stdoutBuf,
          stderrPreview: stderrBuf + '\n[OUTPUT SIZE EXCEEDED]'
        })
        return reject(new AppError(500, 'OUTPUT_SIZE_EXCEEDED', 'Command output exceeded the maximum allowed size.'))
      }

      logExecution({
        command,
        cwd: cwd ?? process.env.HOME ?? process.cwd(),
        exitCode: code ?? 1,
        duration,
        status: 'executed',
        blockReason: null,
        stdoutPreview: stdoutBuf,
        stderrPreview: stderrBuf
      })

      resolve({
        exitCode: code ?? 1,
        stdout: stdoutBuf,
        stderr: stderrBuf
      })
    })

    child.on('error', (err) => {
      clearTimeout(timer)
      const duration = Date.now() - startTime
      logExecution({
        command,
        cwd: cwd ?? process.env.HOME ?? process.cwd(),
        exitCode: null,
        duration,
        status: 'executed',
        blockReason: null,
        stdoutPreview: stdoutBuf,
        stderrPreview: stderrBuf + '\n[ERROR: ' + err.message + ']'
      })
      reject(new AppError(500, 'EXECUTION_ERROR', `Failed to start process: ${err.message}`))
    })
  })
}
