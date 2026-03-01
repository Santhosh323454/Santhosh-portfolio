import { motion } from 'framer-motion';
import { ExternalLink, Smartphone, Globe, Code } from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { CURRENT_VERSION } from './ThemeContext';

export default function ProjectsSection() {
    const [projects] = useRealtimeData('projects');
    return (
        <section id="projects" className="section-container transition-colors">
            <h2 className="section-heading dark:text-white transition-colors">
                My <span className="heading-highlight">Projects</span>
            </h2>
            <p className="section-subheading">
                A showcase of my recent work in mobile development and AI integration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {projects.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="ouali-card flex flex-col overflow-hidden group"
                    >
                        {/* Top Image Handle */}
                        <div className="w-full bg-gray-100 dark:bg-gray-800/50 aspect-video relative flex flex-col items-center justify-center overflow-hidden border-b border-brand-border dark:border-brand-darkborder group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 transition-colors">
                            {p.image ? (
                                <img src={p.image.startsWith('http') ? p.image : `${p.image}?v=${CURRENT_VERSION}`} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 w-full h-full">
                                    <span className="text-brand-gray/50 dark:text-gray-500/50 font-bold mb-2">[ Project Screenshot ]</span>
                                    {/* Fake UI boxes to make it look like a template preview */}
                                    <div className="flex gap-2 w-full max-w-xs opacity-40 dark:opacity-20 transition-opacity">
                                        <div className="w-1/4 h-16 rounded-xl" style={{ backgroundColor: p.color || '#e2e8f0' }} />
                                        <div className="w-3/4 flex flex-col gap-2">
                                            <div className="w-full h-8 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                                            <div className="w-1/2 h-6 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Details */}
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-2xl font-black text-brand-dark dark:text-white mb-1 transition-colors">{p.title}</h3>
                            <p className="text-sm font-semibold mb-4" style={{ color: p.color }}>{p.type}</p>

                            <p className="text-brand-gray dark:text-gray-400 text-sm leading-relaxed flex-1 mb-6 transition-colors">
                                {p.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {(p.tech ? p.tech.split(', ') : []).map(tag => (
                                    <span key={tag} className="text-[11px] font-bold text-brand-gray dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md border border-brand-border dark:border-gray-700 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <a href={p.githubLink || '#'} target="_blank" rel="noreferrer" className="flex-1 btn-outline py-2.5 text-sm text-center flex justify-center items-center gap-1.5">
                                    <Code size={16} /> Code
                                </a>
                                {p.demoLink ? (
                                    <a href={p.demoLink} target="_blank" rel="noreferrer" className="flex-1 btn-primary py-2.5 text-sm shadow-none hover:-translate-y-0 text-center flex justify-center items-center gap-1.5">
                                        <ExternalLink size={16} /> Demo
                                    </a>
                                ) : (
                                    <button className="flex-1 btn-primary py-2.5 text-sm shadow-none hover:-translate-y-0 disabled:opacity-50 cursor-not-allowed flex justify-center items-center gap-1.5" disabled>
                                        <ExternalLink size={16} /> Demo
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* View All Projects Button */}
            <div className="mt-16 text-center">
                <a href="https://github.com/Santhosh323454" target="_blank" rel="noreferrer" className="btn-primary">
                    View All Projects <ExternalLink size={16} />
                </a>
            </div>
        </section>
    );
}
