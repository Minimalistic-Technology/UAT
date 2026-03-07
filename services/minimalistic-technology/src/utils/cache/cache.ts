import { InMemoryCache } from "./in-memory-cache";

export interface ICache {
  set(
    type: string,
    args: string[],
    value: any,
    expirySeconds: number,
  ): Promise<void>;

  get(type: string, args: string[]): Promise<any>;

  evict(type: string, args: string[]): Promise<null>;
}

export class Cache implements ICache {
  private static instance: Cache;
  private delegate: ICache;

  private constructor() {
    this.delegate = InMemoryCache.getInstance();
  }

  static getInstance(): Cache {
    if (!this.instance) {
      this.instance = new Cache();
    }
    return this.instance;
  }

  async set(
    type: string,
    args: string[],
    value: any,
    expirySeconds: number = parseInt(process.env.CACHE_EXPIRE_S || "100", 10),
  ): Promise<void> {
    return this.delegate.set(type, args, value, expirySeconds);
  }

  async get(type: string, args: string[]): Promise<any> {
    return this.delegate.get(type, args);
  }

  async evict(type: string, args: string[]): Promise<null> {
    return this.delegate.evict(type, args);
  }
}

export const cache = Cache.getInstance();
