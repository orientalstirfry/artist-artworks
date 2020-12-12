import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import {  S3 } from 'aws-sdk';

const apiGatewayHttpResponse = (
  statusCode: number,
  body: { [key: string]: any },
  allowCors = false
): APIGatewayProxyResult => {
  const response: APIGatewayProxyResult = {
    statusCode,
    body: JSON.stringify(body),
  };
  if (allowCors) {
    response.headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };
  }
  return response;
};

const s3 = new S3();
export const getBucketContents = async (bucketName:string):Promise<any> => {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2({Bucket:bucketName},(err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  })
}

export const handle: APIGatewayProxyHandler = async (event, _context) => {

  let artistsToFilter = [];
  if(event.queryStringParameters)
  {
    const { artists } = event.queryStringParameters;
    artistsToFilter = artists.split('+');
  }


  const bucketContentResponse = await getBucketContents(process.env.ASSET_BUCKET_NAME);
  const artistArtworks = {};
  bucketContentResponse.Contents.map((bucketItem) => {
    const fileName = bucketItem.Key.split('/');
    const artistName = fileName[0];
    const paintingFileName = fileName[1].split('.');
    const paintingName = paintingFileName[0];

    if (!Object.keys(artistArtworks).includes(artistName)) {
      if (artistsToFilter.length === 0 || artistsToFilter.includes(artistName)) {
        artistArtworks[artistName] = [];
      }
    } 
    if (artistsToFilter.length === 0 || artistsToFilter.includes(artistName)) {
      artistArtworks[artistName].push({
        paintingName,
        url: `https://s3.ap-southeast-2.amazonaws.com/${process.env.ASSET_BUCKET_NAME}/${bucketItem.Key}`
      });
    }
  });



  return apiGatewayHttpResponse(200, artistArtworks, true);
};

