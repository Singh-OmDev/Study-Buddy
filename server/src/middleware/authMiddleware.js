import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';


const protect = async (req, res, next) => {
    
    console.log("Auth Middleware hit. Checking token...");

    ClerkExpressRequireAuth()(req, res, async (err) => {
        if (err) {
            console.error("Clerk Auth Error:", err);
            return res.status(401).json({ message: 'Not authorized, token failed', error: err.message });
        }
        console.log("Clerk Auth Success. UserID:", req.auth.userId);

        try {
            const { userId } = req.auth;

            if (!userId) {
                return res.status(401).json({ message: 'No User ID found' });
            }

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

            req.user = user;
            next();

        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(500).json({ message: 'Server error during authentication' });
        }
    });
};

export { protect };
