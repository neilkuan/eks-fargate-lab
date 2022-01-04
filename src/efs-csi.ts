import {
  aws_eks as eks,
  aws_efs as efs,
  aws_ec2 as ec2,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface EfsCsiStorageClassConstructProps {
  eksFargateCluster: eks.FargateCluster;
  createEfsStorageClass?: boolean;
}

export class EfsCsiStorageClassConstruct extends Construct {
  readonly fileSystemId: string;
  readonly storageClassName = 'efs-sc';
  constructor(scope: Construct, id: string, props: EfsCsiStorageClassConstructProps) {
    super(scope, id);

    const fileSystem = new efs.FileSystem(this, 'Efs', {
      vpc: props.eksFargateCluster.vpc,
    });
    fileSystem.connections.allowDefaultPortFrom(
      new ec2.Connections({
        peer: ec2.Peer.ipv4(props.eksFargateCluster.vpc.vpcCidrBlock),
      }));

    const createEfsStorageClass = props.createEfsStorageClass || true;
    if (createEfsStorageClass) {
      const storageClass = {
        apiVersion: 'storage.k8s.io/v1',
        kind: 'StorageClass',
        metadata: { name: this.storageClassName },
        provisioner: 'efs.csi.aws.com',
      };
      props.eksFargateCluster.addManifest('efs-storage-class', storageClass);
    }

    this.fileSystemId = fileSystem.fileSystemId;

    new CfnOutput(this, 'EfsFileSystemId', {
      value: fileSystem.fileSystemId,
    });
  }
}