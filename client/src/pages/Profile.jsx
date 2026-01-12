import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, CreditCard, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div className="text-center text-zinc-500 mt-20">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="border-b border-[#262626] pb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Profile</h1>
                <p className="text-zinc-500">Manage your account settings and preference.</p>
            </header>

            {/* Profile Card */}
            <div className="bento-card p-8">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#262626]">
                        {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-zinc-800 flex items-center justify-center">
                                <User className="h-10 w-10 text-zinc-500" />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <p className="text-zinc-400 font-mono text-sm">{user.email}</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg flex items-center justify-between border border-[#262626]">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-indigo-500" />
                            <div>
                                <p className="text-sm text-zinc-400">Current Plan</p>
                                <p className="text-white font-medium capitalize">{user.plan || 'Free'}</p>
                            </div>
                        </div>
                        {user.plan === 'free' && (
                            <button className="text-xs bg-white text-black px-3 py-1 rounded font-bold hover:bg-zinc-200">
                                Upgrade
                            </button>
                        )}
                    </div>

                    <div className="p-4 bg-[#1a1a1a] rounded-lg flex items-center justify-between border border-[#262626]">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-zinc-400">AI Credits</p>
                                <p className="text-white font-medium">{user.credits !== undefined ? user.credits : 'Unlimited'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#1a1a1a] rounded-lg flex items-center justify-between border border-[#262626]">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-sm text-zinc-400">Member Since</p>
                                <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
