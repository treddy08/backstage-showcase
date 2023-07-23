import {
  EntityAboutCard,
  EntityHasSystemsCard,
  EntityLayout,
  EntityLinksCard,
  EntitySwitch,
} from '@backstage/plugin-catalog';
import { EntityCatalogGraphCard } from '@backstage/plugin-catalog-graph';
import { Grid } from '@mui/material';
import React from 'react';

import {
  ClusterAvailableResourceCard,
  ClusterContextProvider,
  ClusterInfoCard,
} from '@janus-idp/backstage-plugin-ocm';
import { isType } from '../../utils';
import { entityWarningContent } from '../Content/EntityWarning';

const isType = (types: string | string[]) => (entity: Entity) => {
  if (!entity?.spec?.type) {
    return false;
  }
  return typeof types === 'string'
    ? entity?.spec?.type === types
    : types.includes(entity.spec.type as string);
};

export const resourcePage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {entityWarningContent}
        </Grid>
        <EntitySwitch>
          <EntitySwitch.Case if={isType('kubernetes-cluster')}>
            <ClusterContextProvider>
              <Grid container item direction="column" md={3}>
                <Grid item>
                  <EntityLinksCard />
                </Grid>
                <Grid item>
                  <ClusterAvailableResourceCard />
                </Grid>
              </Grid>
              <Grid container item direction="column" md={9}>
                <Grid item>
                  <ClusterInfoCard />
                </Grid>
                <Grid item>
                  <EntityCatalogGraphCard variant="gridItem" height={400} />
                </Grid>
              </Grid>
            </ClusterContextProvider>
          </EntitySwitch.Case>
          <EntitySwitch.Case>
            <Grid item md={6}>
              <EntityAboutCard variant="gridItem" />
            </Grid>

            <Grid item md={6} xs={12}>
              <EntityCatalogGraphCard variant="gridItem" height={400} />
            </Grid>

            <Grid item md={6}>
              <EntityHasSystemsCard variant="gridItem" />
            </Grid>
          </EntitySwitch.Case>
        </EntitySwitch>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/status" title="status">
      <EntitySwitch>
        <EntitySwitch.Case if={isType('kubernetes-cluster')}>
          <ClusterContextProvider>
            <Grid container direction="column" xs={6}>
              <Grid item>
                <ClusterInfoCard />
              </Grid>
              <Grid item>
                <ClusterAvailableResourceCard />
              </Grid>
            </Grid>
          </ClusterContextProvider>
        </EntitySwitch.Case>
      </EntitySwitch>
    </EntityLayout.Route>
  </EntityLayout>
);
