import { Request, Response, NextFunction } from 'express';

export const validateFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];
    
    for (const field of fields) {
      const parts = field.split('.');
      let current: any = req.body;
      
      for (const part of parts) {
        if (current === undefined || current === null || !(part in current)) {
          missing.push(field);
          break;
        }
        current = current[part];
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
      return;
    }
    
    next();
  };
};
