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
import { type Entity } from '@backstage/catalog-model';

import {
  ClusterAvailableResourceCard,
  ClusterContextProvider,
  ClusterInfoCard,
} from '@janus-idp/backstage-plugin-ocm';
import { isType } from '../../utils';
import { entityWarningContent } from '../Content/EntityWarning';

export const resourcePage = (
  <EntityLayout>
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
