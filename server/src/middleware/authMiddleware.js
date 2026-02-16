import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';
import redis from '../config/redis.js';


// @desc    Protect routes using Clerk Auth & Redis Cache
const protect = async (req, res, next) => {
    // console.log("Auth Middleware hit. Path:", req.path);

    ClerkExpressRequireAuth()(req, res, async (err) => {
        if (err) {
            console.error("Clerk Auth Error:", err);
            return res.status(401).json({ message: 'Not authorized, token failed', error: err.message });
        }

        try {
            const { userId } = req.auth;

            if (!userId) {
                return res.status(401).json({ message: 'No User ID found' });
            }

            // 1. Try Cache First
            if (redis.status !== 'disabled') {
                const cachedUser = await redis.get(`user:${userId}`);
                if (cachedUser) {
                    // console.log("Auth: Serving from Redis Cache"); 
                    req.user = typeof cachedUser === 'string' ? JSON.parse(cachedUser) : cachedUser;
                    return next();
                }
            }

            // 2. Fallback to DB
            let user = await User.findOne({ clerkId: userId });

            if (!user) {
                console.log(`Creating new MongoDB user for Clerk ID: ${userId}`);
                const clerkUser = await clerkClient.users.getUser(userId);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

                user = await User.create({
                    clerkId: userId,
                    name,
                    email,
                    credits: 5,
                    plan: 'free'
                });
            }

            // 3. Save to Cache (1 hour)
            if (redis.status !== 'disabled') {
                if (typeof redis.setex === 'function') {
                    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
                } else {
                    await redis.set(`user:${userId}`, user, { ex: 3600 });
                }
            }

            req.user = user;
            next();

        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(500).json({ message: 'Server error during authentication' });
        }
    });
};

export { protect };
