import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

// Custom middleware that combines Clerk Auth with MongoDB User sync
const protect = async (req, res, next) => {
    // 1. Verify Clerk Token
    // We wrap Clerk's middleware logic manually or use it as a precursor?
    // Easiest is to use ClerkExpressRequireAuth which throws 401 if invalid.
    // However, Express middlewares are chained. 

    // Let's use the provided Middleware from the SDK
    ClerkExpressRequireAuth()(req, res, async (err) => {
        if (err) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }

        // 2. Sync to MongoDB
        try {
            const { userId } = req.auth;

            if (!userId) {
                return res.status(401).json({ message: 'No User ID found' });
            }

            let user = await User.findOne({ clerkId: userId });

            if (!user) {
                // Lazy User Creation
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

            req.user = user;
            next();

        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(500).json({ message: 'Server error during authentication' });
        }
    });
};

export { protect };
