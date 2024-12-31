import axios from 'axios';
import { CacheService } from './cache/cache.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HelpersService } from './helpers.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCacheService = {
  getFromCache: jest.fn(),
  setToCache: jest.fn(),
};
