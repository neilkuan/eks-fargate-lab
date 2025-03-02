import { KubectlV32Layer } from '@aws-cdk/lambda-layer-kubectl-v32';
import {
  App, Stack, StackProps,
  aws_eks as eks,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AlbIngressLabConstruct } from './alb-ingress-lab';
import { EfsCsiStorageClassConstruct } from './efs-csi';
import { FargateEfsSampleConstruct } from './fargate-mount-efs-sample-app';
import { NlbServiceLabConstruct } from './nlb-service-lab';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    // will help you create one vpc, fargate profile, and nat gateway for each azs.
    const cluster = new eks.FargateCluster(this, 'EksCluster', {
      version: eks.KubernetesVersion.V1_32,
      albController: {
        version: eks.AlbControllerVersion.V2_3_0,
      },
      kubectlLayer: new KubectlV32Layer(this, 'KubectlV32Layer'),
    });

    const efsCsiStorageClassConstruct =
    new EfsCsiStorageClassConstruct(this, 'EfsCsiStorageClass', {
      eksFargateCluster: cluster,
    });

    const fec = new FargateEfsSampleConstruct(this, 'FargateEfsSampleApp', {
      eksFargateCluster: cluster,
      // persistentVolumeStorageSize: 100,
      // persistentVolumeClaimRequestSize: 5,
      storageClassName: efsCsiStorageClassConstruct.storageClassName,
      efsFileSystemId: efsCsiStorageClassConstruct.fileSystemId,
    });
    fec.node.addDependency(efsCsiStorageClassConstruct);

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