import {
  aws_eks as eks,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface NlbServiceLabConstructProps {
  eksFargateCluster: eks.FargateCluster;
}

export class NlbServiceLabConstruct extends Construct {
  constructor(scope: Construct, id: string, props: NlbServiceLabConstructProps) {
    super(scope, id);

    const appLabel = { app: 'hello-kubernetes' };

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'hello-kubernetes' },
      spec: {
        replicas: 1,
        selector: { matchLabels: appLabel },
        template: {
          metadata: {
            labels: appLabel,
          },
          spec: {
            containers: [
              {
                name: 'hello-kubernetes',
                image: 'paulbouwer/hello-kubernetes:1.5',
                ports: [{ containerPort: 8080 }],
              },
            ],
          },
        },
      },
    };

    const service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: 'hello-kubernetes',
        // all annotations see: https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.3/guide/service/nlb/
        annotations: {
          'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
          'service.beta.kubernetes.io/aws-load-balancer-type': 'external',
          'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': 'ip',
        },
      },
      spec: {
        type: 'LoadBalancer',
        ports: [{ port: 80, targetPort: 8080 }],
        selector: appLabel,
      },
    };

    props.eksFargateCluster.addManifest('hello-kub', service, deployment);
  }
}