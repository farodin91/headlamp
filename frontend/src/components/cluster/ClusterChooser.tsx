import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { getClusterAccentColor } from '../../lib/cluster';

export interface ClusterChooserProps {
  clickHandler: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  cluster?: string;
}
export type ClusterChooserType =
  | React.ComponentType<ClusterChooserProps>
  | ReactElement<ClusterChooserProps>
  | null;

const SpanClusterName = styled('span')({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'block',
});

const ClusterChooser = React.forwardRef(function ClusterChooser(
  { clickHandler, cluster }: ClusterChooserProps,
  ref: React.Ref<HTMLButtonElement>
) {
  const { t } = useTranslation();
  const accentColor = getClusterAccentColor(cluster);

  return (
    <Button
      size="large"
      variant="contained"
      onClick={clickHandler}
      sx={theme => ({
        color: theme.palette.clusterChooser.button.color,
        background: accentColor,
        '&:hover': {
          background: theme.palette.clusterChooser.button.hover.background,
        },
        maxWidth: '20em',
        textTransform: 'none',
        padding: '6px 22px',
      })}
      ref={ref}
    >
      <SpanClusterName title={cluster}>
        <Trans t={t}>Cluster: {{ cluster }}</Trans>
      </SpanClusterName>
    </Button>
  );
});

export default ClusterChooser;
