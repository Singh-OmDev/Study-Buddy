import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log("Upstash Redis credentials found, connecting via HTTP...");
    redis = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
} else if (process.env.REDIS_URI) {
    console.log("Redis URI found, connecting via TCP...");
    const options = {};
    if (process.env.REDIS_URI.startsWith('rediss://')) {
        options.tls = {
            rejectUnauthorized: false
        };
    }

    redis = new Redis(process.env.REDIS_URI, options);

    redis.on('connect', () => {
        console.log('Redis connected successfully');
    });

    redis.on('error', (err) => {
        console.error('Redis connection error:', err);
    });
} else {
    console.log("Redis URI not found, caching disabled.");
    // Mock redis client to avoid crashes if not configured
    redis = {
        get: async () => null,
        set: async () => { },
        setex: async () => { },
        del: async () => { },
        quit: async () => { },
        status: 'disabled'
    };
}

export default redis;
