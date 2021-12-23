const { awscdk } = require("projen");
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "eks-faragte-lab",
});
project.synth();