import { Request, Response, NextFunction } from 'express'
import { logger } from '../../logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path }, 'Internal server error')
  res.status(500).json({ error: 'Internal server error' })
}
