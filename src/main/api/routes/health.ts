import { Request, Response } from 'express'
import os from 'os'

export const healthHandler = (req: Request, res: Response) => {
  res.json({ status: 'ok', hostname: os.hostname() })
}
