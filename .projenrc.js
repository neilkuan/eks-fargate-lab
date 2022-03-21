const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.3.0',
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
  workflowNodeVersion: '^14.17.0',
  gitignore: ['cdk.out', 'cdk.context.json'],
});
project.synth();