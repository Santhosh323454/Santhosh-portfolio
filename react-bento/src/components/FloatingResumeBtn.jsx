import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { forceDownload } from '../utils/downloadUtils';
import { CURRENT_VERSION } from './ThemeContext';

export default function FloatingResumeBtn() {
    const [profile] = useRealtimeData('profile');

    return (
        <motion.button
            onClick={() => forceDownload(profile?.resumeUrl ? `${profile?.resumeUrl}?v=${CURRENT_VERSION}` : null, 'Santhosh_S_Resume.pdf')}
            title="Download Resume"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 accent-btn text-sm shadow-xl cursor-pointer"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: 'backOut' }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
        >
            <Download size={16} />
            <span>Download Resume</span>
        </motion.button>
    );
}
