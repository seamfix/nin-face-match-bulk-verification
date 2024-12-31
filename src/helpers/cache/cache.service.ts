import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    async getFromCache(tokenName) : Promise<string> {
        const token = await this.cacheManager.get<string>(tokenName)
        return token;
    }

    async setToCache(tokenName: string, token: string, time: number) {
        await this.cacheManager.set(tokenName, token, time);
    }
}