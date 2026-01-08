import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-[#262626] bg-[#0a0a0a] pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-black" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">StudyBuddy</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-xs">
                            Empowering students with AI-driven insights for smarter, deeper, and more efficient learning.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
                            <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link to="/zen" className="hover:text-white transition-colors">Zen Mode</Link></li>
                            <li><Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link to="/blog" className="hover:text-white transition-colors">Study Tips</Link></li>
                            <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
                            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-sm">© 2026 StudyBuddy AI. Built for learners.</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        All Systems Normal
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
