import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ssm from '@aws-cdk/aws-ssm';
import {Vpc} from "@aws-cdk/aws-ec2";
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from '@aws-cdk/aws-route53';
import {Duration} from "@aws-cdk/core";

export class BenkhardCoreStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'DefaultVPC', {isDefault: true});
    const cluster = new ecs.Cluster(this, 'PlatformCluster', {
      vpc,
    });

    const certificateArn = ssm.StringParameter.valueFromLookup(this, '/com/benkhard/wildcard-certificate')
    const certificate = acm.Certificate.fromCertificateArn(this, 'WildcardCertificate', certificateArn);

    const hostedZoneId = ssm.StringParameter.valueFromLookup(this, '/com/benkhard/public-hosted-zone-id');
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'PublicHostedZone', { hostedZoneId: hostedZoneId, zoneName: 'benkhard.com' });

    const loadBalancerFargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "JenkinsService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("jenkins/jenkins"), containerPort: 8080 },
      memoryLimitMiB: 1024, // Default is 512
      publicLoadBalancer: true, // Default is false
      assignPublicIp: true,
      certificate: certificate,
      healthCheckGracePeriod: Duration.minutes(5),
      domainName: 'jenkins.benkhard.com',
      domainZone: hostedZone,
    });

    loadBalancerFargateService.targetGroup.configureHealthCheck({
      path: '/login'
    })
  }
}
