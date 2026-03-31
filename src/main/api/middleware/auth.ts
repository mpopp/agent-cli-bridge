import { Request, Response, NextFunction } from 'express'
import { getServerConfig } from '../../database/config'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']
  
  if (!apiKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const config = getServerConfig()
  if (!config || config.apiKey !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}
