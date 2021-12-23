import {
  App, Stack, StackProps,
  aws_eks as eks,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AlbIngressLabConstruct } from './alb-ingress-lab';
import { NlbServiceLabConstruct } from './nlb-service-lab';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    // will help you create one vpc, fargate profile, and nat gateway for each azs.
    const cluster = new eks.FargateCluster(this, 'EksCluster', {
      version: eks.KubernetesVersion.V1_21,
      albController: {
        version: eks.AlbControllerVersion.V2_3_0,
      },
    });

    new NlbServiceLabConstruct(this, 'NlbServiceLab', {
      eksFargateCluster: cluster,
    });

    new AlbIngressLabConstruct(this, 'AlbIngressLab', {
      eksFargateCluster: cluster,
    });
  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'eks-faragte-lab', { env: devEnv });

app.synth();