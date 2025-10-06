import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKeyHeader = req.headers['x-api-key'];
    const providedKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    const validApiKey = process.env.BACKEND_API_KEY || process.env.API_KEY;

    // In non-production, allow running without API key configured
    if (!validApiKey && process.env.NODE_ENV !== 'production') {
      return next();
    }

    if (!providedKey || providedKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    next();
  }
}