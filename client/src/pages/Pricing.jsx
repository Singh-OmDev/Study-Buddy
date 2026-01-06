import { ArrowRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    return (
        <div className="py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
                <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Pricing Plans</h2>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Invest in your brain.</h1>
                <p className="text-zinc-400 max-w-xl mx-auto text-lg">
                    Choose the plan that fits your study needs. Upgrade anytime as your academic goals grow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {/* Free Plan */}
                <div className="bento-card p-8 flex flex-col relative overflow-hidden group hover:border-zinc-600 transition-colors">
                    <div className="mb-4">
                        <span className="text-lg font-medium text-zinc-400">Starter</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">$0</span>
                            <span className="text-zinc-500">/mo</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <PlanFeature text="Basic Study Logging" />
                        <PlanFeature text="Focus Logic Timer" />
                        <PlanFeature text="3 Daily AI Chat Queries" />
                        <PlanFeature text="Limited Stats History (7 Days)" />
                    </ul>
                    <Link to="/register" className="w-full py-3 bg-[#1a1a1a] border border-[#333] text-white font-medium rounded-xl hover:bg-[#262626] transition-colors text-center">
                        Get Started Free
                    </Link>
                </div>

                {/* Pro Plan */}
                <div className="bento-card p-8 flex flex-col relative overflow-hidden border-zinc-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                    <div className="mb-4">
                        <span className="text-lg font-medium text-white">Pro Scholar</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">$9</span>
                            <span className="text-zinc-500">/mo</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <PlanFeature text="Unlimited Logs & History" check={true} />
                        <PlanFeature text="Unlimited AI Tutor Chat" check={true} />
                        <PlanFeature text="Advanced Analytics & Trends" check={true} />
                        <PlanFeature text="AI Resume & Revision Tools" check={true} />
                        <PlanFeature text="Prioritized Support" check={true} />
                    </ul>
                    <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg">
                        Upgrade to Pro
                    </button>
                </div>

                {/* Team Plan */}
                <div className="bento-card p-8 flex flex-col relative overflow-hidden group hover:border-zinc-600 transition-colors">
                    <div className="mb-4">
                        <span className="text-lg font-medium text-zinc-400">Team</span>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">$29</span>
                            <span className="text-zinc-500">/mo</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <PlanFeature text="Everything in Pro" />
                        <PlanFeature text="Shared Study Logspaces" />
                        <PlanFeature text="Team Leaderboards" />
                        <PlanFeature text="Admin Analytics" />
                    </ul>
                    <button className="w-full py-3 bg-[#1a1a1a] border border-[#333] text-white font-medium rounded-xl hover:bg-[#262626] transition-colors">
                        Contact Sales
                    </button>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-zinc-600 text-sm">Secure payments via Stripe. Cancel anytime.</p>
            </div>
        </div>
    );
};

const PlanFeature = ({ text, check = true }) => (
    <li className="flex items-start gap-3">
        <div className={`mt-0.5 p-0.5 rounded-full ${check ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
            {check ? <Check className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        </div>
        <span className="text-zinc-300 text-sm">{text}</span>
    </li>
);

export default Pricing;
