import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import {
  GithubEntityProvider,
  GithubOrgEntityProvider,
} from '@backstage/plugin-catalog-backend-module-github';
import { jsonSchemaRefPlaceholderResolver } from '@backstage/plugin-catalog-backend-module-openapi';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';
import { ManagedClusterProvider } from '@janus-idp/backstage-plugin-ocm-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GitlabDiscoveryEntityProvider } from '@backstage/plugin-catalog-backend-module-gitlab';
import { GitLabDiscoveryProcessor } from '@backstage/plugin-catalog-backend-module-gitlab';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  builder.addProcessor(
    GitLabDiscoveryProcessor.fromConfig(env.config, { logger: env.logger }),
  );

  const isOcmEnabled = env.config.getOptionalBoolean('enabled.ocm') || false;
  const isKeycloakEnabled =
    env.config.getOptionalBoolean('enabled.keycloak') || false;
  const isGithubEnabled =
    env.config.getOptionalBoolean('enabled.github') || false;
  const isGithubOrgEnabled =
    env.config.getOptionalBoolean('enabled.githubOrg') || false;

  if (isOcmEnabled) {
    builder.addEntityProvider(
      ManagedClusterProvider.fromConfig(env.config, {
        logger: env.logger,
        schedule: env.scheduler.createScheduledTaskRunner({
          frequency: { hours: 1 },
          timeout: { minutes: 15 },
          initialDelay: { seconds: 15 },
        }),
      }),
    );
  }

  if (isKeycloakEnabled) {
    builder.addEntityProvider(
      KeycloakOrgEntityProvider.fromConfig(env.config, {
        id: 'development',
        logger: env.logger,
        schedule: env.scheduler.createScheduledTaskRunner({
          frequency: { hours: 1 },
          timeout: { minutes: 50 },
          initialDelay: { seconds: 15 },
        }),
      }),
    );
  }

  if (isGithubEnabled) {
    builder.addEntityProvider(
      GithubEntityProvider.fromConfig(env.config, {
        logger: env.logger,
        schedule: env.scheduler.createScheduledTaskRunner({
          frequency: { minutes: 30 },
          timeout: { minutes: 3 },
          initialDelay: { minutes: 1 },
        }),
      }),
    );
  }

  if (isGithubOrgEnabled) {
    const providersConfig = env.config.getOptionalConfig(
      'catalog.providers.githubOrg',
    );

    providersConfig?.keys().forEach(id => {
      const githubOrgConfig = providersConfig?.getConfig(id);

      const githubOrgId = githubOrgConfig.getString('id');
      const githubOrgUrl = githubOrgConfig.getString('orgUrl');

      builder.addEntityProvider(
        GithubOrgEntityProvider.fromConfig(env.config, {
          id: githubOrgId,
          orgUrl: githubOrgUrl,
          logger: env.logger,
          schedule: env.scheduler.createScheduledTaskRunner({
            frequency: { minutes: 60 },
            timeout: { minutes: 15 },
            initialDelay: { seconds: 15 },
          }),
        }),
      );
    });
  }

  builder.addEntityProvider(
    ...GitlabDiscoveryEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      // optional: alternatively, use scheduler with schedule defined in app-config.yaml
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { seconds: 10 },
        timeout: { seconds: 60 },
      }),
      // optional: alternatively, use schedule
      scheduler: env.scheduler,
    }),
  );

  builder.setPlaceholderResolver('openapi', jsonSchemaRefPlaceholderResolver);
  builder.setPlaceholderResolver('asyncapi', jsonSchemaRefPlaceholderResolver);

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  return router;
}
