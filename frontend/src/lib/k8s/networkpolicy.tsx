import { apiFactoryWithNamespace } from './apiProxy';
import { LabelSelector } from './cluster';
import { KubeObject, KubeObjectInterface } from './KubeObject';

export interface NetworkPolicyPort {
  port?: string | number;
  protocol?: string;
  endPort?: number;
}

export interface IPBlock {
  cidr: string;
  except: string[];
}

export interface NetworkPolicyPeer {
  ipBlock?: IPBlock;
  namespaceSelector?: LabelSelector;
  podSelector?: LabelSelector;
}

export interface NetworkPolicyEgressRule {
  ports: NetworkPolicyPort[];
  to: NetworkPolicyPeer[];
}

export interface NetworkPolicyIngressRule {
  ports: NetworkPolicyPort[];
  from: NetworkPolicyPeer[];
}

export interface KubeNetworkPolicy extends KubeObjectInterface {
  egress: NetworkPolicyEgressRule[];
  ingress: NetworkPolicyIngressRule[];
  podSelector: LabelSelector;
  policyTypes: string[];
}

class NetworkPolicy extends KubeObject<KubeNetworkPolicy> {
  static objectName = 'NetworkPolicy';
  static apiEndpoint = apiFactoryWithNamespace('networking.k8s.io', 'v1', 'networkpolicies');

  static get pluralName() {
    return 'networkpolicies';
  }
}

export default NetworkPolicy;
