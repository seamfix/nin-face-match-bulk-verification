import { Injectable } from '@nestjs/common';
import { CacheService } from './cache/cache.service';
import axios from 'axios';
import { getMockImage } from 'src/process-nin/mock.base64.image';

export interface IFaceMatchRequest {
    sourceImage: string;
    targetImage: string;
    identifier: string | number;
    mode: string;
    score?: number;
    processedScore?: number;
    status?: string;
}

export interface ISftpRequest {
    folderName: string;
    imageId: string;
    mode: string;
}

export interface ISftpResponse {
    folderName: string;
    imageId: string;
    base64Image: string;
}

@Injectable()
export class HelpersService {
    constructor(private readonly cacheService: CacheService) {}

    async faceMatch(faceMatchRequest: IFaceMatchRequest) {
        if (!faceMatchRequest.sourceImage || !faceMatchRequest.targetImage) {
          return {
            ...faceMatchRequest,
            code: -3,
            message: 'source and target images are compulsory',
          };
        }
        try {
          const token = await this.generateOrFetchAuthenticationToken();
    
          const body = {
            image1: faceMatchRequest.sourceImage,
            image2: faceMatchRequest.targetImage,
          };
    
          const headers = {
            productId: process.env.PRODUCT_ID,
            mode: faceMatchRequest.mode,
            authorization: `Bearer ${token}`,
          };
    
          const faceMatchResponse = await axios.post(
            `${process.env.FACE_MATCH_MIDDLEWARE_BASE_URL}neuro-tech-verify-face`,
            body,
            {
              headers,
            },
          );

          console.log("result ", faceMatchResponse.data)
    
          if (faceMatchResponse.data?.code == 0) {
            faceMatchRequest.score = faceMatchResponse.data?.score;
            faceMatchRequest.processedScore =
              faceMatchResponse.data?.processedScore;
            faceMatchRequest.status = faceMatchResponse.data?.status;
            return {
              ...faceMatchRequest,
              code: 0,
              message: faceMatchResponse?.data?.description,
            };
          } else {
            return {
              ...faceMatchRequest,
              code: -1,
              message: faceMatchResponse?.data?.description,
            };
          }
        } catch (error) {
          console.log(
            `Failed to to perform Neurotech facematch: ${error.message}`,
          );
          return {
            ...faceMatchRequest,
            code: -2,
            message: 'Internal server error',
          };
        }
    }
    
    async generateOrFetchAuthenticationToken() {
        let token: string | undefined;
        try {
          token = await this.cacheService.getFromCache('faceMatchToken');
          console.log('token from cache client ', token);
          if (token) return token;
          const headers = {
            productId: process.env.PRODUCT_ID,
            mode: 'live',
          };
          const body = {
            publicKey: process.env.FACE_MATCH_PUBLIC_KEY,
            privateKey: process.env.FACE_MATCH_PRIVATE_KEY,
            userId: process.env.FACE_MATCH_USER_ID,
          };
    
          const response = await axios.post(
            `${process.env.FACE_MATCH_MIDDLEWARE_BASE_URL}neuro-tech-authenticate`,
            body,
            {
              headers,
            },
          );
    
          if (response.data?.code == 0) {
            token = response.data.accessToken;
            let expiresIn = response.data.expiresIn;
            expiresIn =
              typeof expiresIn === 'string' ? Number(expiresIn) : expiresIn;
            if (typeof expiresIn === 'number') {
              console.log('here is expires');
              let ttl = Math.round(response.data.expiresIn * 0.9) * 1000;
              await this.cacheService.setToCache('faceMatchToken', token, ttl);
            }
          }
          return token;
        } catch (error) {
          console.log(
            `Failed to authenticate Neurotech error: ${error.message}`,
          );
        }
    }

    async fetchImageFromSftpServer(sftpRequest: ISftpRequest) : Promise<ISftpResponse> {
        if (sftpRequest.mode.toLowerCase() === 'test') {
            const response = await this.mockResult(sftpRequest.folderName, sftpRequest.imageId)
            return response
        }
        delete sftpRequest.mode
        try {
            const responseFromServer = await axios.post(process.env.SFTP_SERVER_URL, sftpRequest, {
                headers: {
                  'Content-Type': 'application/json'
                },
            })
            return responseFromServer.data
        } catch (error) {
            console.log(error)
            return {
                folderName: sftpRequest.folderName,
            imageId: sftpRequest.imageId,
            base64Image: undefined
            }
        }
    }
      
      mockResult = async (folderName, imageId): Promise<ISftpResponse> => {
        const successResponse: ISftpResponse = {
            folderName: folderName,
            imageId: imageId,
            base64Image: getMockImage()
        } 
        
          
          const failureResponse: ISftpResponse = {
            folderName: folderName,
            imageId: imageId,
            base64Image: undefined
          };
        const randomNumber = Math.random()
        const randomResponse = randomNumber > 0.3 ? successResponse : failureResponse;
      
        const delay = Math.floor(Math.random() * (100 - 10 + 1)) + 10; // Random delay between 10ms and 100ms
      
        // Return the response after the delay
        await new Promise((resolve) => setTimeout(resolve, delay));
      
        return randomResponse;
      };
}
