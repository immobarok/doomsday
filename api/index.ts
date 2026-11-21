import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

let cachedServer: ((req: Request, res: Response) => void) | null = null;

async function getServer(): Promise<(req: Request, res: Response) => void> {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    configureApp(app);
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance() as (
      req: Request,
      res: Response,
    ) => void;
  }
  return cachedServer;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  const server = await getServer();
  server(req, res);
}
