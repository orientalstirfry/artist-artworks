#!/usr/bin/env node
import { App, Stack, StackProps } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Cors, LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import path from 'path';
import { Function as LambdaFunction, AssetCode, Runtime } from '@aws-cdk/aws-lambda';

const assetBucketName = "ga-2020-game-artist-artworks";
const apiName = "ga-2020-game-artist-artworks-api"


class ArtistArtworkApiApp extends App {
  constructor() {
    super();
    const env = {
      account: '206157294923',
      region: 'ap-southeast-2',
    };
    new AppStack(this, 'artist-artworks-api-stack', {
      env,
      assetBucketName
    });
  }
}

interface AppStackprops extends StackProps {
  assetBucketName: string;
}

class AppStack extends Stack {
  constructor(app: App, id: string, props?: AppStackprops) {
    super(app, id, props);

    const { assetBucketName } = props;
    const assetBucket = new Bucket(this, 'artistArtworkApiBucket', {
      bucketName: assetBucketName,
      publicReadAccess: true
    });

    const assetDeployment = new BucketDeployment(this, 'artistArtworkDeployment', {
      sources: [ Source.asset(path.resolve(__dirname, '..', 'src', 'assets'))],
      destinationBucket: assetBucket,      
    });

    const api = new RestApi(this, 'artistArtworkApi', {
      restApiName: apiName,
    });

    const lambda = new LambdaFunction(this, 'artistArtworksLambda', {
      functionName: 'get-artist-artworks',
      code: new AssetCode('dist'),
      handler: 'artist-artworks.handle',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        ASSET_BUCKET_ARN: assetBucket.bucketArn,
        ASSET_BUCKET_NAME: assetBucketName
      },
    });
    assetBucket.grantRead(lambda);

    const endpoint = api.root.addResource('artist-artworks');
    const endpointIntegration: LambdaIntegration = new LambdaIntegration(lambda);
    endpoint.addMethod('GET', endpointIntegration);
    endpoint.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: Cors.DEFAULT_HEADERS,
      allowCredentials: false,
    });

  }
}

const app = new ArtistArtworkApiApp();