import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('CacheService', () => {
    let service: CacheService;
    let cacheManagerMock: Partial<Cache>;

    beforeEach(async () => {
        cacheManagerMock = {
            get: jest.fn(),
            set: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CacheService,
                {
                    provide: CACHE_MANAGER,
                    useValue: cacheManagerMock
                }
            ]
        }).compile();

        service = module.get<CacheService>(CacheService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getFromCache', () => {
        it('should return a value from the cache', async () => {
            const tokenName = 'testToken';
            const tokenValue = 'mockTokenValue';
            jest.spyOn(cacheManagerMock, 'get').mockResolvedValueOnce(tokenValue);

            const result = await service.getFromCache(tokenName);
            expect(cacheManagerMock.get).toHaveBeenCalledWith(tokenName);
            expect(result).toBe(tokenValue);
        });
    });

    describe('setToCache', () => {
        it('should set a value in the cache', async () => {
            const tokenName = 'testToken';
            const tokenValue = 'mockTokenValue';
            const time = 100;

            await service.setToCache(tokenName, tokenValue, time);
            expect(cacheManagerMock.set).toHaveBeenCalledWith(tokenName, tokenValue, time);
        });
    });
});