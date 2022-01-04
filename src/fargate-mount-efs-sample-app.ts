import {
  aws_eks as eks,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface FargateEfsSampleConstructProps {
  eksFargateCluster: eks.FargateCluster;
  efsFileSystemId: string;
  storageClassName: string;
  persistentVolumeStorageSize?: number;
  persistentVolumeClaimRequestSize?: number;
}

export class FargateEfsSampleConstruct extends Construct {
  persistentVolumeStorageSize: number;
  persistentVolumeClaimRequestSize: number;
  constructor(scope: Construct, id: string, props: FargateEfsSampleConstructProps) {
    super(scope, id);

    this.persistentVolumeStorageSize = props?.persistentVolumeStorageSize || 5;
    this.persistentVolumeClaimRequestSize = props?.persistentVolumeClaimRequestSize || 5;

    if ( this.persistentVolumeClaimRequestSize > this.persistentVolumeStorageSize) {
      throw new Error('persistentVolumeClaimRequestSize must be smaller than persistentVolumeStorageSize');
    }

    const newId = id.toLowerCase();
    const persistentVolume = {
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      metadata: {
        name: `${newId}-efs-pv`,
      },
      spec: {
        capacity: {
          storage: `${this.persistentVolumeStorageSize}Gi`,
        },
        volumeMode: 'Filesystem',
        accessModes: [
          'ReadWriteMany',
        ],
        persistentVolumeReclaimPolicy: 'Retain',
        storageClassName: props.storageClassName,
        csi: {
          driver: 'efs.csi.aws.com',
          volumeHandle: props.efsFileSystemId,
        },
      },
    };

    const persistentVolumeClaim = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        name: `${newId}-efs-claim`,
      },
      spec: {
        accessModes: [
          'ReadWriteMany',
        ],
        storageClassName: props.storageClassName,
        resources: {
          requests: {
            storage: `${this.persistentVolumeClaimRequestSize}Gi`,
          },
        },
      },
    };

    const pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: `${newId}-app`,
      },
      spec: {
        containers: [
          {
            name: `${newId}-app`,
            image: 'busybox',
            command: [
              '/bin/sh',
            ],
            args: [
              '-c',
              'while true; do echo $(date -u) >> /data/out1.txt; sleep 5; done',
            ],
            volumeMounts: [
              {
                name: 'persistent-storage',
                mountPath: '/data',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'persistent-storage',
            persistentVolumeClaim: {
              claimName: `${newId}-efs-claim`,
            },
          },
        ],
      },
    };

    props.eksFargateCluster.addManifest(`${id}-efs-storage-class`, persistentVolume, persistentVolumeClaim, pod);
  }
}