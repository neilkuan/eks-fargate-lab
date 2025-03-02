const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.181.0',
  defaultReleaseBranch: 'main',
  name: 'eks-fargate-lab',
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve'],
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan', 'github-actions'],
  },
  workflowNodeVersion: '^20',
  gitignore: ['cdk.out', 'cdk.context.json'],
  typescriptVersion: '4.6',
  devDeps: [
    '@types/prettier@2.6.0',
  ],
  deps: [
    '@aws-cdk/lambda-layer-kubectl-v32',
  ],
});
project.synth();