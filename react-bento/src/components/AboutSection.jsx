import { motion } from 'framer-motion';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { CURRENT_VERSION } from './ThemeContext';

export default function AboutSection() {
    const [profile] = useRealtimeData('profile');

    const stats = [
        { value: profile.cgpa, label: 'CGPA', sub: 'KSRCT (IT)' },
        { value: '2+', label: 'Projects', sub: 'Completed' },
        { value: '3', label: 'Certifications', sub: 'Achieved' },
    ];

    return (
        <section id="about" className="section-container relative z-10 transition-colors overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

                {/* Left Side: Photo + Graphic */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full max-w-lg relative"
                >
                    {/* Orange Star Background Shape */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20 dark:opacity-10 transition-opacity">
                        <svg viewBox="0 0 200 200" className="w-[120%] h-[120%] text-brand-orange fill-current" style={{ transform: 'rotate(15deg)' }}>
                            <path d="M100 0l22.45 69.098H195.1l-58.82 42.744L158.73 180.9 100 138.196l-58.73 42.705 22.45-69.056L4.9 69.098h72.65L100 0z" />
                        </svg>
                    </div>

                    <div className="relative z-10 w-64 h-[320px] sm:w-72 sm:h-[400px] lg:w-80 lg:h-[440px] mx-auto shrink-0 mt-8 mb-8">
                        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden border-[6px] border-white dark:border-brand-darkborder shadow-2xl bg-gradient-to-bl from-orange-50 to-orange-200 dark:from-slate-800 dark:to-gray-900 z-10 p-1 transition-colors">
                            <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                                {/* The actual photo */}
                                <img
                                    src={profile.aboutImageUrl ? `${profile.aboutImageUrl}?v=${CURRENT_VERSION}` : (profile.avatarUrl ? `${profile.avatarUrl}?v=${CURRENT_VERSION}` : `/avatar.png?v=${CURRENT_VERSION}`)}
                                    alt="Santhosh"
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        </div>

                        {/* Floating Tech Logos */}
                        <div className="absolute top-[10%] left-[-8%] bg-blue-500 text-white font-bold text-sm p-2.5 px-4 rounded-xl shadow-lg -rotate-12 z-30">React</div>
                        <div className="absolute bottom-[20%] right-[-5%] bg-yellow-400 text-black font-bold text-sm p-2.5 px-4 rounded-xl shadow-lg rotate-12 z-30">JS</div>
                    </div>
                </motion.div>

                {/* Right Side: Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="flex-1"
                >
                    <h2 className="section-heading text-left flex items-center gap-3 dark:text-white transition-colors">
                        About <span className="heading-highlight">Me</span>
                    </h2>

                    <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl p-6 mb-8 border border-orange-100 dark:border-orange-900/30 transition-colors">
                        <p className="text-brand-gray dark:text-gray-400 leading-relaxed mb-4 transition-colors">
                            {profile.longDescription || profile.description}
                        </p>
                        <div className="text-brand-gray dark:text-gray-400 leading-relaxed font-semibold text-sm transition-colors whitespace-pre-line">
                            {profile.educationDetails || "Education:\n• K S Rangasamy College of Technology — B.Tech IT (2023 - 2027)\n• ST. Michael Hr. Sec. School (76.6%)"}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between gap-4 border-t border-brand-border dark:border-brand-darkborder pt-8 transition-colors">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center flex-1">
                                <p className="text-3xl md:text-4xl font-black text-brand-orange mb-1">{s.value}</p>
                                <p className="text-sm font-bold text-brand-dark dark:text-white transition-colors">{s.label}</p>
                                <p className="text-xs text-brand-gray dark:text-gray-500 mt-1 hidden sm:block transition-colors">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center sm:text-left shadow-2xl">
                        <button className="btn-outline">
                            Learn More
                        </button>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
