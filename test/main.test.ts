import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { MyStack } from '../src/main';

test('Test NLB Lab', () => {
  const app = new App();
  const stack = new MyStack(app, 'eks-faragte-lab');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-Cluster');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-FargateProfile');
  Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource',
    Match.objectLike({
      Manifest: '[{"apiVersion":"v1","kind":"Service","metadata":{"name":"hello-kubernetes","annotations":{"service.beta.kubernetes.io/aws-load-balancer-scheme":"internet-facing","service.beta.kubernetes.io/aws-load-balancer-type":"external","service.beta.kubernetes.io/aws-load-balancer-nlb-target-type":"ip"},"labels":{"aws.cdk.eks/prune-c834d8118b48dcd0f8cca69209766bf060a6f38fb2":""}},"spec":{"type":"LoadBalancer","ports":[{"port":80,"targetPort":8080}],"selector":{"app":"hello-kubernetes"}}},{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"name":"hello-kubernetes","labels":{"aws.cdk.eks/prune-c834d8118b48dcd0f8cca69209766bf060a6f38fb2":""}},"spec":{"replicas":1,"selector":{"matchLabels":{"app":"hello-kubernetes"}},"template":{"metadata":{"labels":{"app":"hello-kubernetes"}},"spec":{"containers":[{"name":"hello-kubernetes","image":"paulbouwer/hello-kubernetes:1.5","ports":[{"containerPort":8080}]}]}}}}]',
      ClusterName: {
        Ref: 'EksClusterFAB68BDB',
      },
    }));
});

test('Test ALB Lab', () => {
  const app = new App();
  const stack = new MyStack(app, 'eks-faragte-lab');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-Cluster');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-FargateProfile');
  Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource',
    Match.objectLike({
      Manifest: '[{"apiVersion":"v1","kind":"Service","metadata":{"name":"hello-kubernetes-alb","labels":{"aws.cdk.eks/prune-c8fcf9c210d33a7d0c96ace52d958f2b790cd95924":""}},"spec":{"type":"NodePort","ports":[{"port":80,"targetPort":8080}],"selector":{"app":"hello-kubernetes-alb"}}},{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"name":"hello-kubernetes-alb","labels":{"aws.cdk.eks/prune-c8fcf9c210d33a7d0c96ace52d958f2b790cd95924":""}},"spec":{"replicas":1,"selector":{"matchLabels":{"app":"hello-kubernetes-alb"}},"template":{"metadata":{"labels":{"app":"hello-kubernetes-alb"}},"spec":{"containers":[{"name":"hello-kubernetes","image":"paulbouwer/hello-kubernetes:1.5","ports":[{"containerPort":8080}]}]}}}},{"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"name":"hello-kubernetes-alb-ingress","annotations":{"kubernetes.io/ingress.class":"alb","alb.ingress.kubernetes.io/scheme":"internet-facing","alb.ingress.kubernetes.io/target-type":"ip"},"labels":{"aws.cdk.eks/prune-c8fcf9c210d33a7d0c96ace52d958f2b790cd95924":""}},"spec":{"rules":[{"http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"hello-kubernetes-alb","port":{"number":80}}}}]}}]}}]',
      ClusterName: {
        Ref: 'EksClusterFAB68BDB',
      },
    }));
});

test('Test EFS-CSI', () => {
  const app = new App();
  const stack = new MyStack(app, 'eks-faragte-lab');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-Cluster');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-FargateProfile');
  Template.fromStack(stack).hasResourceProperties('AWS::EFS::FileSystem',
    Match.objectLike(
      {
        Encrypted: true,
        FileSystemTags: [
          {
            Key: 'Name',
            Value: 'eks-faragte-lab/EfsCsiStorageClass/Efs',
          },
        ],
      },
    ),
  );
  Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource',
    Match.objectLike({
      Manifest: {
        'Fn::Join': [
          '',
          [
            '[{"apiVersion":"v1","kind":"ConfigMap","metadata":{"name":"aws-auth","namespace":"kube-system","labels":{"aws.cdk.eks/prune-c8276effa82e8898b42b9c78f505165726793cff05":""}},"data":{"mapRoles":"[{\\"rolearn\\":\\"',
            {
              'Fn::GetAtt': [
                'EksClusterfargateprofiledefaultPodExecutionRole22895DDB',
                'Arn',
              ],
            },
            '\\",\\"username\\":\\"system:node:{{SessionName}}\\",\\"groups\\":[\\"system:bootstrappers\\",\\"system:nodes\\",\\"system:node-proxier\\"]}]","mapUsers":"[]","mapAccounts":"[]"}}]',
          ],
        ],
      },
      ClusterName: {
        Ref: 'EksClusterFAB68BDB',
      },
    }),
  );
});