import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { CURRENT_VERSION } from './ThemeContext';

export default function ContactSection({ onMessageSent }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        const formData = new FormData(e.target);
        formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus('success');
                e.target.reset();
                if (onMessageSent) onMessageSent();
            } else {
                console.error("Web3Forms Error", data);
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error("Form submission failed:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section-container relative z-10 py-32 border-t border-brand-border dark:border-brand-darkborder bg-white dark:bg-brand-darkcard mt-12 rounded-t-[4rem] transition-colors">
            <h2 className="section-heading dark:text-white transition-colors">
                Get In <span className="heading-highlight">Touch</span>
            </h2>
            <p className="section-subheading">
                Let's discuss your project or any exciting opportunities!
            </p>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 max-w-5xl mx-auto">

                {/* Left: 3D Illustration Placeholder */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full flex justify-center lg:justify-start"
                >
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mt-12 sm:mt-0 flex items-end justify-center animate-float transition-colors">

                        {/* Bottom Image: Fits perfectly inside the circle, hiding the bottom of the body */}
                        <div className="absolute inset-0 rounded-full border-4 border-white dark:border-brand-darkborder shadow-ouali-card bg-slate-200 dark:bg-slate-800 flex items-end justify-center overflow-hidden transition-colors">
                            <img
                                src={`/avatar.png?v=${CURRENT_VERSION}`}
                                alt="Contact Santhosh"
                                className="w-[120%] max-w-none drop-shadow-2xl transition-transform"
                                style={{ marginBottom: '-5%' }}
                            />
                        </div>

                        {/* Top Image: Sits exactly on top, cropped to ONLY show the head, allowing it to overlap the top border */}
                        <div className="absolute inset-x-0 bottom-0 top-[-20%] pointer-events-none flex items-end justify-center z-10">
                            <img
                                src={`/avatar.png?v=${CURRENT_VERSION}`}
                                alt=""
                                aria-hidden="true"
                                className="w-[120%] max-w-none drop-shadow-2xl"
                                style={{
                                    marginBottom: '-5%',
                                    // Taper the sides inwards horizontally for the bottom half so shoulders don't stick out
                                    clipPath: 'polygon(0 0, 100% 0, 100% 30%, 80% 60%, 20% 60%, 0 30%)'
                                }}
                            />
                        </div>

                        {/* Notification Badge */}
                        <div className="absolute top-10 right-4 sm:right-10 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg rotate-12 flex items-center justify-center transition-colors z-20">
                            <Mail size={24} className="text-brand-orange" />
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-gray-800">
                                1
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Contact Form hooked up to Web3Forms */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full bg-white dark:bg-brand-darkcard p-8 sm:p-10 rounded-[2rem] border border-brand-border dark:border-brand-darkborder shadow-ouali-card transition-colors"
                >
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >
                        {/* Web3Forms Configuration */}
                        <input type="hidden" name="subject" value="New Portfolio Contact Submission!" />
                        <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                        <div className="flex flex-col sm:flex-row gap-5">
                            <input
                                type="text"
                                name="First Name"
                                required
                                placeholder="First Name"
                                className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-4 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all placeholder-brand-gray/50 font-medium disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                            <input
                                type="text"
                                name="Last Name"
                                placeholder="Last Name"
                                className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-4 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all placeholder-brand-gray/50 font-medium disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Email Address"
                                className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-4 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all placeholder-brand-gray/50 font-medium disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                            <input
                                type="tel"
                                name="Phone"
                                placeholder="Phone Number"
                                className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-4 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all placeholder-brand-gray/50 font-medium disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                        </div>

                        <textarea
                            name="message"
                            required
                            placeholder="Your Message"
                            rows="5"
                            className="w-full bg-brand-lightbg dark:bg-gray-900 text-brand-dark dark:text-white px-5 py-4 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all placeholder-brand-gray/50 font-medium resize-none disabled:opacity-50"
                            disabled={isSubmitting}
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`btn-primary w-full mt-2 transition-all ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${submitStatus === 'success' ? 'bg-green-500 hover:bg-green-600 border-green-500' : ''}`}
                        >
                            {isSubmitting ? 'Sending...' : submitStatus === 'success' ? 'Message Sent!' : 'Send Message'}
                        </button>

                        {submitStatus === 'error' && (
                            <p className="text-red-500 text-sm text-center mt-2 font-semibold">Failed to send message. Please try again.</p>
                        )}
                    </form>
                </motion.div>

            </div>
        </section>
    );
}
