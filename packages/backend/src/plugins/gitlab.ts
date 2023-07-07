import { PluginEnvironment } from '../types';
import { Router } from 'express-serve-static-core';
import { createRouter } from 'backstage/plugin-catalog-backend-module-gitlab';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return createRouter({
    logger: env.logger,
    config: env.config,
  });
}
