import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { forceDownload } from '../utils/downloadUtils';
import { CURRENT_VERSION } from './ThemeContext';

export default function HeroSection() {
    const [profile] = useRealtimeData('profile');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    const handleDownload = async (resumeUrl) => {
        setIsDownloading(true);
        setDownloadSuccess(false);
        try {
            await forceDownload(resumeUrl);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <section className="pt-40 pb-20 px-6 sm:px-10 overflow-hidden relative">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* Left Side: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="flex-1 text-center lg:text-left z-10"
                >
                    {/* Social Icons */}
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                        <a href={profile.linkedin || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-brand-darkcard shadow-ouali-card flex items-center justify-center text-[#0A66C2] hover:scale-110 transition-transform"><FaLinkedin size={18} /></a>
                        <a href={profile.github || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-brand-darkcard shadow-ouali-card flex items-center justify-center text-gray-800 dark:text-gray-300 hover:scale-110 transition-transform"><FaGithub size={18} /></a>
                        <a href={profile.leetcode || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-brand-darkcard shadow-ouali-card flex items-center justify-center text-[#FFA116] hover:scale-110 transition-transform"><SiLeetcode size={18} /></a>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black text-brand-dark dark:text-white mb-4 tracking-tight transition-colors">
                        Hi, I'm {profile.name?.split(' ')[0]}<span className="text-brand-orange">{profile.name?.split(' ')[1] || ''}</span>
                    </h1>

                    <p className="text-lg text-brand-gray dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium transition-colors">
                        {profile.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <button
                            onClick={() => handleDownload(profile?.resumeUrl)}
                            disabled={isDownloading}
                            className={`btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${downloadSuccess ? 'bg-green-500 hover:bg-green-600 border-green-500' : ''}`}
                        >
                            {isDownloading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : downloadSuccess ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <Download size={18} />
                            )}

                            {isDownloading ? 'Downloading...' : downloadSuccess ? 'Success!' : 'Download CV'}
                        </button>
                        <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2">
                            <Mail size={18} /> Contact Me
                        </button>
                    </div>
                </motion.div>

                {/* Right Side: Portrait Frame Avatar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    className="flex-1 relative w-full flex justify-center lg:justify-end animate-float mt-16 lg:mt-0"
                >
                    {/* Main Portrait Container */}
                    <div className="relative w-72 h-[350px] sm:w-80 sm:h-[400px] md:w-96 md:h-[480px] z-10 shrink-0">

                        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden border-[6px] border-white dark:border-brand-darkborder shadow-2xl bg-gradient-to-bl from-orange-50 to-orange-200 dark:from-slate-800 dark:to-gray-900 z-10 p-1">
                            {/* Force image cover naturally without any complex blending modes that fail on Windows browsers */}
                            <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                                <img
                                    src={profile.avatarUrl ? `${profile.avatarUrl}?v=${CURRENT_VERSION}` : `/avatar.png?v=${CURRENT_VERSION}`}
                                    alt="Santhosh S"
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        </div>

                        {/* Floating UI Badges overlapping the border */}
                        <div className="absolute top-[10%] left-[-5%] bg-pink-500 text-white font-bold text-xs p-2.5 px-3 rounded-xl rotate-[-12deg] z-30 shadow-lg">Hi</div>
                        <div className="absolute top-[40%] right-[-8%] bg-yellow-400 text-black font-bold text-xs p-2.5 px-3 rounded-xl rotate-[15deg] z-30 shadow-lg">Java</div>
                        <div className="absolute bottom-[20%] left-[-5%] bg-brand-orange text-white font-bold text-xs p-2.5 px-3 rounded-xl rotate-[8deg] z-30 shadow-lg">Dev</div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
