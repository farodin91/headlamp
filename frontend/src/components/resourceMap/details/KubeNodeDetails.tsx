import { Box } from '@mui/system';
import { memo, ReactElement, useEffect } from 'react';
import { KubeObject } from '../../../lib/k8s/cluster';
import Deployment from '../../../lib/k8s/deployment';
import Job from '../../../lib/k8s/job';
import ReplicaSet from '../../../lib/k8s/replicaSet';
import ConfigDetails from '../../configmap/Details';
import CronJobDetails from '../../cronjob/Details';
import DaemonSetDetails from '../../daemonset/Details';
import EndpointDetails from '../../endpoints/Details';
import HpaDetails from '../../horizontalPodAutoscaler/Details';
import IngressClassDetails from '../../ingress/ClassDetails';
import IngressDetails from '../../ingress/Details';
import { LeaseDetails } from '../../lease/Details';
import { LimitRangeDetails } from '../../limitRange/Details';
import NamespaceDetails from '../../namespace/Details';
import { NetworkPolicyDetails } from '../../networkpolicy/Details';
import NodeDetails from '../../node/Details';
import PodDetails from '../../pod/Details';
import PDBDetails from '../../podDisruptionBudget/Details';
import PriorityClassDetails from '../../priorityClass/Details';
import ResourceQuotaDetails from '../../resourceQuota/Details';
import RoleBindingDetails from '../../role/BindingDetails';
import RoleDetails from '../../role/Details';
import { RuntimeClassDetails } from '../../runtimeClass/Details';
import SecretDetails from '../../secret/Details';
import ServiceDetails from '../../service/Details';
import ServiceAccountDetails from '../../serviceaccount/Details';
import StatefulSetDetails from '../../statefulset/Details';
import VolumeClaimDetails from '../../storage/ClaimDetails';
import StorageClassDetails from '../../storage/ClassDetails';
import VolumeDetails from '../../storage/VolumeDetails';
import VpaDetails from '../../verticalPodAutoscaler/Details';
import MutatingWebhookConfigList from '../../webhookconfiguration/MutatingWebhookConfigDetails';
import ValidatingWebhookConfigurationDetails from '../../webhookconfiguration/ValidatingWebhookConfigDetails';
import WorkloadDetails from '../../workload/Details';

const kindComponentMap: Record<
  string,
  (props: { name?: string; namespace?: string }) => ReactElement
> = {
  Pod: PodDetails,
  Deployment: props => <WorkloadDetails {...props} workloadKind={Deployment} />,
  ReplicaSet: props => <WorkloadDetails {...props} workloadKind={ReplicaSet} />,
  Job: props => <WorkloadDetails {...props} workloadKind={Job} />,
  Service: ServiceDetails,
  CronJob: CronJobDetails,
  DaemonSet: DaemonSetDetails,
  ConfigMap: ConfigDetails,
  Endpoints: EndpointDetails,
  HorizontalPodAutoscaler: HpaDetails,
  Ingress: IngressDetails,
  Lease: LeaseDetails,
  LimitRange: LimitRangeDetails,
  Namespace: NamespaceDetails,
  NetworkPolicy: NetworkPolicyDetails,
  Node: NodeDetails,
  PodDisruptionBudget: PDBDetails,
  PriorityClass: PriorityClassDetails,
  ResourceQuota: ResourceQuotaDetails,
  ClusterRole: RoleDetails,
  Role: RoleDetails,
  RoleBinding: RoleBindingDetails,
  RuntimeClass: RuntimeClassDetails,
  Secret: SecretDetails,
  ServiceAccount: ServiceAccountDetails,
  StatefulSet: StatefulSetDetails,
  PersistentVolumeClaim: VolumeClaimDetails,
  StorageClass: StorageClassDetails,
  PersistentVolume: VolumeDetails,
  VerticalPodAutoscaler: VpaDetails,
  MutatingWebhookConfiguration: MutatingWebhookConfigList,
  ValidatingWebhookConfiguration: ValidatingWebhookConfigurationDetails,
  IngressClass: IngressClassDetails,
};

function DetailsNotFound() {
  return null;
}

/**
 * Shows details page for a given Kube resource
 */
export const KubeObjectDetails = memo(({ resource }: { resource: KubeObject }) => {
  const kind = resource.kind;
  const { name, namespace } = resource.metadata;

  const Component = kindComponentMap[kind] ?? DetailsNotFound;

  useEffect(() => {
    if (!kindComponentMap[kind]) {
      console.error(
        'No details component for kind ${kind} was found. See KubeNodeDetails.tsx for more info'
      );
    }
  }, [kind, kindComponentMap]);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box sx={{ marginTop: '-70px' }}>
        <Component name={name} namespace={namespace} />
      </Box>
    </Box>
  );
});