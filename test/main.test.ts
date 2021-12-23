import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MyStack } from '../src/main';

test('Test NLB Lab', () => {
  const app = new App();
  const stack = new MyStack(app, 'eks-faragte-lab');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-Cluster');
  Template.fromStack(stack).findResources('Custom::AWSCDK-EKS-FargateProfile');
  Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
    ServiceToken: {
      'Fn::GetAtt': [
        'awscdkawseksKubectlProviderNestedStackawscdkawseksKubectlProviderNestedStackResourceA7AEBA6B',
        'Outputs.eksfaragtelabawscdkawseksKubectlProviderframeworkonEvent490E869EArn',
      ],
    },
    Manifest: '[{"apiVersion":"v1","kind":"Service","metadata":{"name":"hello-kubernetes","annotations":{"service.beta.kubernetes.io/aws-load-balancer-scheme":"internet-facing","service.beta.kubernetes.io/aws-load-balancer-type":"external","service.beta.kubernetes.io/aws-load-balancer-nlb-target-type":"ip"},"labels":{"aws.cdk.eks/prune-c834d8118b48dcd0f8cca69209766bf060a6f38fb2":""}},"spec":{"type":"LoadBalancer","ports":[{"port":80,"targetPort":8080}],"selector":{"app":"hello-kubernetes"}}},{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"name":"hello-kubernetes","labels":{"aws.cdk.eks/prune-c834d8118b48dcd0f8cca69209766bf060a6f38fb2":""}},"spec":{"replicas":1,"selector":{"matchLabels":{"app":"hello-kubernetes"}},"template":{"metadata":{"labels":{"app":"hello-kubernetes"}},"spec":{"containers":[{"name":"hello-kubernetes","image":"paulbouwer/hello-kubernetes:1.5","ports":[{"containerPort":8080}]}]}}}}]',
    ClusterName: {
      Ref: 'EksClusterFAB68BDB',
    },
    RoleArn: {
      'Fn::GetAtt': [
        'EksClusterCreationRole75AABE42',
        'Arn',
      ],
    },
    PruneLabel: 'aws.cdk.eks/prune-c834d8118b48dcd0f8cca69209766bf060a6f38fb2',
  });
});