import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { Interval } from '@nestjs/schedule';
import { CacheService } from '../cache/cache.service';
import { IFaceMatchRequest } from '../helpers.service';

@Injectable()
export class NeuroTechFaceMatchService implements OnModuleInit {
  constructor(private readonly cacheService: CacheService) {}

  async onModuleInit() {
    await this.generateToken();  // Trigger the token generation immediately
  }

  async faceMatch(faceMatchRequest: IFaceMatchRequest) {
    if (!faceMatchRequest.sourceImage || !faceMatchRequest.targetImage) {
      return {
        ...faceMatchRequest,
        code: -3,
        message: 'source and target images are compulsory',
      };
    }

    const imageSizeValidationMessage = this.validateImageSize(
      faceMatchRequest.sourceImage,
      faceMatchRequest.targetImage,
    );
    if (imageSizeValidationMessage !== null) {
      return {
        ...faceMatchRequest,
        code: -3,
        message: imageSizeValidationMessage,
      };
    }

    try {
      const token = await this.fetchToken();

      if (token === null || token === undefined) {
        return {
          ...faceMatchRequest,
          code: -2,
          message: 'unable to retrive token',
        };
      }

      const neuroTechResourceUrl = process.env.NEURO_TECH_FACEMATCH_RESOURCE;
      const neuroTechFaceMatchRequest = {
        probe: faceMatchRequest.sourceImage,
        candidate: faceMatchRequest.targetImage,
      };

      const faceMatchResponse = await axios.post(
        neuroTechResourceUrl,
        neuroTechFaceMatchRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(faceMatchResponse.data)

      if (
        faceMatchResponse.status === 200 &&
        faceMatchResponse.data !== null &&
        faceMatchResponse.data?.code === 0
      ) {
        const score = faceMatchResponse.data?.score
          ? faceMatchResponse.data.score
          : 0;
        faceMatchRequest.score = score;
        faceMatchRequest.processedScore = this.adjustScore(score);
        faceMatchRequest.status = faceMatchResponse?.data?.status

        return {
          ...faceMatchRequest,
          code: 0,
          message: faceMatchResponse?.data?.status,
        };
      } else {
        return {
          ...faceMatchRequest,
          code: -1,
          message: faceMatchResponse?.data?.description,
        };
      }
    } catch (error) {
      console.log(`Failed to to perform Neurotech facematch: ${error.message}`);
      return {
        ...faceMatchRequest,
        code: -2,
        message: 'Internal server error',
      };
    }
  }

  async fetchToken() {
    try {
      const token = await this.cacheService.getFromCache('faceMatchToken');
      console.log('token from cache client ', token);
      if (token) {
        return token;
      } else {
        return this.generateToken();
      }
    } catch(error) {
      return null;
    }
  }

  @Interval(parseInt(process.env.NEURO_TECH_TOKEN_INTERVAL || '11400000', 11400000)) //interval in milliseconds 
  async generateToken() {
    try {
      const neuroTechAuthUrl = process.env.NEURO_TECH_FACEMATCH_AUTH;
      const neuroTechAuthRequest = {
        publicKey: process.env.FACE_MATCH_PUBLIC_KEY,
        privateKey: process.env.FACE_MATCH_PRIVATE_KEY,
        userId: process.env.FACE_MATCH_USER_ID,
      };

      const response = await axios.post(
        neuroTechAuthUrl,
        neuroTechAuthRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(
        `Authentication response status from neuro tech: ${JSON.stringify(response.status)}`,
      );

      if (response.status === 200 && response.data.code === 0) {
        const token = response.data.accessToken;
        const ttl = (response.data.expiresIn - 300) * 1000;
        await this.cacheService.setToCache('faceMatchToken', token, ttl);

        return token;
      }
    } catch (error) {
      console.log(`Failed to authenticate Neurotech error: ${error.message}`);
    }

    return null;
  }

  /*
   * Adjusts the score if it meets the threshold, ensuring gradual progression.
   * @param score - The original score to adjust.
   * @returns The adjusted score or the original score if below the threshold.
   */
  adjustScore(score: number): number {
    if (score < 40.0) {
      return score; // Return original score if conditions are not met
    }

    const minAdjustedScore = 80.0;
    const maxAdjustedScore = 99.987109653;

    // Normalize the score, mapping 40 to 0 and 100 to 1
    const normalizedScore = (score - 40) / 60.0;

    // Gradually adjust the score using a smooth progression function
    return (
      minAdjustedScore +
      (maxAdjustedScore - minAdjustedScore) * Math.pow(normalizedScore, 1.5)
    );
  }

  validateImageSize(
    base64ProbeImage: string,
    base64CandidateImage: string,
  ): string | null {
    const imageSizeLimitMB = parseInt(process.env.NEURO_TECH_IMAGE_SIZE_LIMIT || '10', 10);

    const maxSizeInBytes = imageSizeLimitMB * 1024 * 1024;
    let errorMessage = '';

    const decodeBase64 = (base64String: string): Buffer | null => {
      try {
        return Buffer.from(base64String, 'base64');
      } catch (error) {
        return null;
      }
    };

    const probeImageBuffer = decodeBase64(base64ProbeImage);
    const candidateImageBuffer = decodeBase64(base64CandidateImage);

    if (!probeImageBuffer) {
      errorMessage += 'Invalid Base64 string for Probe image. ';
    }

    if (!candidateImageBuffer) {
      errorMessage += 'Invalid Base64 string for Candidate image. ';
    }

    if (errorMessage) {
      return errorMessage.trim();
    }

    if (probeImageBuffer && probeImageBuffer.length > maxSizeInBytes) {
      errorMessage += `Probe image size is greater than the image size limit (${imageSizeLimitMB}MB). `;
    }

    if (candidateImageBuffer && candidateImageBuffer.length > maxSizeInBytes) {
      if (errorMessage) {
        errorMessage += ', ';
      }
      errorMessage += `Candidate image size is greater than the image size limit (${imageSizeLimitMB}MB).`;
    }

    return errorMessage ? errorMessage.trim() : null;
  }
}