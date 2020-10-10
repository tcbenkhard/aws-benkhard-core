import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ssm from '@aws-cdk/aws-ssm';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Vpc} from "@aws-cdk/aws-ec2";

export class BenkhardCoreStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'DefaultVPC', {isDefault: true});
    const cluster = new ecs.Cluster(this, 'PlatformCluster', {
      vpc,
    });

    new ssm.StringParameter(this, 'PlatformClusterArnSSMParameter', {
      parameterName: '/com/benkhard/platform-cluster-arn',
      description: 'The arn of the Platform ECS cluster.',
      stringValue: cluster.clusterArn
    });

    new ssm.StringParameter(this, 'PlatformClusterNameSSMParameter', {
      parameterName: '/com/benkhard/platform-cluster-name',
      description: 'The name of the Platform ECS cluster.',
      stringValue: cluster.clusterArn
    });

    const userPool = new UserPool(this, 'BenkhardUserPool', {
      selfSignUpEnabled: true,
      userPoolName: 'benkhard-userpool',
      signInAliases: { username: true, email: true },
      autoVerify: { email: true, phone: true }
    })

    new ssm.StringParameter(this, 'UserPoolIdSSMParameter', {
      parameterName: '/com/benkhard/cognito/benkhard-userpool-id',
      description: 'The id of the benkhard userpool',
      stringValue: userPool.userPoolId
    })
  }
}
