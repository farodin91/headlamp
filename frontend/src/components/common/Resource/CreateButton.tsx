import { InlineIcon } from '@iconify/react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useClusterGroup } from '../../../lib/k8s';
import { apply } from '../../../lib/k8s/apiProxy';
import { KubeObjectInterface } from '../../../lib/k8s/KubeObject';
import { clusterAction } from '../../../redux/clusterActionSlice';
import {
  EventStatus,
  HeadlampEventType,
  useEventCallback,
} from '../../../redux/headlampEventSlice';
import { AppDispatch } from '../../../redux/stores/store';
import ActionButton from '../ActionButton';
import EditorDialog from './EditorDialog';

interface CreateButtonProps {
  isNarrow?: boolean;
}

export default function CreateButton(props: CreateButtonProps) {
  const { isNarrow } = props;
  const dispatch: AppDispatch = useDispatch();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const location = useLocation();
  const { t } = useTranslation(['translation']);
  const dispatchCreateEvent = useEventCallback(HeadlampEventType.CREATE_RESOURCE);
  const clusters = useClusterGroup();
  const [targetCluster, setTargetCluster] = React.useState(clusters[0] || '');

  // When the clusters in the group change, we want to reset the target cluster
  // if it's not in the new list of clusters.
  React.useEffect(() => {
    if (clusters.length === 0) {
      setTargetCluster('');
    } else if (!clusters.includes(targetCluster)) {
      setTargetCluster(clusters[0]);
    }
  }, [clusters]);

  const applyFunc = async (newItems: KubeObjectInterface[], clusterName: string) => {
    await Promise.allSettled(newItems.map(newItem => apply(newItem, clusterName))).then(
      (values: any) => {
        values.forEach((value: any, index: number) => {
          if (value.status === 'rejected') {
            let msg;
            const kind = newItems[index].kind;
            const name = newItems[index].metadata.name;
            const apiVersion = newItems[index].apiVersion;
            if (newItems.length === 1) {
              msg = t('translation|Failed to create {{ kind }} {{ name }}.', { kind, name });
            } else {
              msg = t('translation|Failed to create {{ kind }} {{ name }} in {{ apiVersion }}.', {
                kind,
                name,
                apiVersion,
              });
            }
            setErrorMessage(msg);
            setOpenDialog(true);
            throw msg;
          }
        });
      }
    );
  };

  function handleSave(newItemDefs: KubeObjectInterface[]) {
    let massagedNewItemDefs = newItemDefs;
    const cancelUrl = location.pathname;

    // check if all yaml objects are valid
    for (let i = 0; i < massagedNewItemDefs.length; i++) {
      if (massagedNewItemDefs[i].kind === 'List') {
        // flatten this List kind with the items that it has which is a list of valid k8s resources
        const deletedItem = massagedNewItemDefs.splice(i, 1);
        massagedNewItemDefs = massagedNewItemDefs.concat(deletedItem[0].items!);
      }
      if (!massagedNewItemDefs[i].metadata?.name) {
        setErrorMessage(
          t(`translation|Invalid: One or more of resources doesn't have a name property`)
        );
        return;
      }
      if (!massagedNewItemDefs[i].kind) {
        setErrorMessage(t('translation|Invalid: Please set a kind to the resource'));
        return;
      }
    }
    // all resources name
    const resourceNames = massagedNewItemDefs.map(newItemDef => newItemDef.metadata.name);
    setOpenDialog(false);

    dispatch(
      clusterAction(() => applyFunc(massagedNewItemDefs, targetCluster), {
        startMessage: t('translation|Applying {{ newItemName }}…', {
          newItemName: resourceNames.join(','),
        }),
        cancelledMessage: t('translation|Cancelled applying {{ newItemName }}.', {
          newItemName: resourceNames.join(','),
        }),
        successMessage: t('translation|Applied {{ newItemName }}.', {
          newItemName: resourceNames.join(','),
        }),
        errorMessage: t('translation|Failed to apply {{ newItemName }}.', {
          newItemName: resourceNames.join(','),
        }),
        cancelUrl,
      })
    );

    dispatchCreateEvent({
      status: EventStatus.CONFIRMED,
    });
  }

  return (
    <React.Fragment>
      {isNarrow ? (
        <ActionButton
          description={t('translation|Create / Apply')}
          onClick={() => setOpenDialog(true)}
          icon="mdi:plus-box"
          width="48"
          iconButtonProps={{
            color: 'primary',
          }}
        />
      ) : (
        <Button
          onClick={() => {
            setOpenDialog(true);
          }}
          startIcon={<InlineIcon icon="mdi:plus" />}
          color="primary"
          variant="contained"
        >
          {t('translation|Create')}
        </Button>
      )}
      <EditorDialog
        item={{}}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        saveLabel={t('translation|Apply')}
        errorMessage={errorMessage}
        onEditorChanged={() => setErrorMessage('')}
        title={t('translation|Create / Apply')}
        actions={
          clusters.length > 1
            ? [
                <FormControl>
                  <InputLabel id="edit-dialog-cluster-target">{t('glossary|Cluster')}</InputLabel>
                  <Select
                    labelId="edit-dialog-cluster-target"
                    id="edit-dialog-cluster-target-select"
                    value={targetCluster}
                    onChange={event => {
                      setTargetCluster(event.target.value as string);
                    }}
                  >
                    {clusters.map(cluster => (
                      <MenuItem key={cluster} value={cluster}>
                        {cluster}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>,
              ]
            : []
        }
      />
    </React.Fragment>
  );
}
