import {
  aws_eks as eks,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface AlbIngressLabConstructProps {
  eksFargateCluster: eks.FargateCluster;
}

export class AlbIngressLabConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AlbIngressLabConstructProps) {
    super(scope, id);

    const appLabel = { app: 'hello-kubernetes-alb' };

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: 'hello-kubernetes-alb' },
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
        name: 'hello-kubernetes-alb',
      },
      spec: {
        type: 'NodePort',
        ports: [{ port: 80, targetPort: 8080 }],
        selector: appLabel,
      },
    };

    const ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'hello-kubernetes-alb-ingress',
        annotations: {
          'kubernetes.io/ingress.class': 'alb',
          'alb.ingress.kubernetes.io/scheme': 'internet-facing',
          'alb.ingress.kubernetes.io/target-type': 'ip',
        },
      },
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: service.metadata.name,
                      port: {
                        number: service.spec.ports[0].port,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    props.eksFargateCluster.addManifest('hello-kub-alb', service, deployment, ingress);
  }
}