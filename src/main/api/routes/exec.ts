import { Request, Response, NextFunction } from 'express'
import { runCommand } from '../../services/exec-service'
import { AppError } from '../../errors/AppError'

export const execHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { command, cwd } = req.body

    if (!command || typeof command !== 'string' || command.trim() === '') {
      res.status(400).json({
        data: null,
        error: { code: 'BAD_REQUEST', message: 'Missing required field: command' },
        meta: {}
      })
      return
    }

    if (cwd !== undefined && typeof cwd !== 'string') {
      res.status(400).json({
        data: null,
        error: { code: 'BAD_REQUEST', message: 'Invalid field: cwd must be a string' },
        meta: {}
      })
      return
    }

    const result = await runCommand({ command, cwd })

    res.status(200).json({
      data: {
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr
      },
      error: null,
      meta: {}
    })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        data: null,
        error: { code: err.code, message: err.message },
        meta: {}
      })
      return
    }
    next(err)
  }
}
