/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Config } from '@backstage/config';
import { GitLabIntegration } from './gitlab/GitLabIntegration';
import { defaultScmResolveUrl } from './helpers';
import { ScmIntegration, ScmIntegrationsGroup } from './types';
import { ScmIntegrationRegistry } from './registry';

/**
 * The set of supported integrations.
 *
 * @public
 */
export interface IntegrationsByType {
  /**
   * @deprecated in favor of `bitbucketCloud` and `bitbucketServer`
   */
  gitlab: ScmIntegrationsGroup<GitLabIntegration>;
}

/**
 * Exposes the set of supported integrations.
 *
 * @public
 */
export class ScmIntegrations implements ScmIntegrationRegistry {
  private readonly byType: IntegrationsByType;

  static fromConfig(config: Config): ScmIntegrations {
    return new ScmIntegrations({
      gitlab: GitLabIntegration.factory({ config }),
    });
  }

  constructor(integrationsByType: IntegrationsByType) {
    this.byType = integrationsByType;
  }

  get gitlab(): ScmIntegrationsGroup<GitLabIntegration> {
    return this.byType.gitlab;
  }

  list(): ScmIntegration[] {
    return Object.values(this.byType).flatMap(
      i => i.list() as ScmIntegration[],
    );
  }

  byUrl(url: string | URL): ScmIntegration | undefined {
    let candidates = Object.values(this.byType)
      .map(i => i.byUrl(url))
      .filter(Boolean);

    // Do not return deprecated integrations if there are other options
    if (candidates.length > 1) {
      const filteredCandidates = candidates;
      if (filteredCandidates.length !== 0) {
        candidates = filteredCandidates;
      }
    }

    return candidates[0];
  }

  byHost(host: string): ScmIntegration | undefined {
    return Object.values(this.byType)
      .map(i => i.byHost(host))
      .find(Boolean);
  }

  resolveUrl(options: {
    url: string;
    base: string;
    lineNumber?: number;
  }): string {
    const integration = this.byUrl(options.base);
    if (!integration) {
      return defaultScmResolveUrl(options);
    }

    return integration.resolveUrl(options);
  }

  resolveEditUrl(url: string): string {
    const integration = this.byUrl(url);
    if (!integration) {
      return url;
    }

    return integration.resolveEditUrl(url);
  }
}
