import { CURRENT_VERSION } from '../components/ThemeContext';

// Initial mock data based on user's resume
const DEFAULT_DATA = {
    profile: {
        name: 'Santhosh S',
        role: 'Aspiring Java Developer',
        cgpa: '7.48',
        description: 'Aspiring Java Developer with a strong foundation in Java, Spring Boot, MySQL, and Flutter, interested in developing scalable backend applications and solving real-world problems.',
        linkedin: 'https://linkedin.com/in/santhosh-s-24b791320',
        github: 'https://github.com/Santhosh323454',
        leetcode: 'https://leetcode.com/santhosh_323',
        avatarUrl: `/avatar.png?v=${CURRENT_VERSION}`
    },
    projects: [
        {
            id: 'task-master',
            title: 'Task Master',
            type: 'Productivity Android App',
            tech: 'Flutter, Hive DB',
            description: 'Built a production-ready productivity app with advanced UI, dark/light mode, and offline persistence using Hive DB.',
            link: 'https://github.com/Santhosh323454/task_master_app',
            image: 'https://images.unsplash.com/photo-1540350394557-8d14678e7f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'smart-context-ai',
            title: 'Smart Context AI',
            type: 'Chrome Extension',
            tech: 'JavaScript, Gemini Vision API',
            description: 'Engineered a smart AI assistant that delivers real-time answers analyzing code/text from screenshots.',
            link: '#',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ],
    certifications: [
        {
            id: 'google-ai',
            name: 'Google AI/ML Internship',
            issuer: 'EduSkill',
            year: '2025',
            certificateUrl: ''
        },
        {
            id: 'oracle-cloud',
            name: 'Oracle Cloud Infrastructure Certified',
            issuer: 'Oracle',
            year: '2025',
            certificateUrl: ''
        },
        {
            id: 'salesforce-agentforce',
            name: 'Salesforce Agentforce Specialist',
            issuer: 'Salesforce',
            year: '2025',
            certificateUrl: ''
        }
    ]
};

// Initialize Broadcast Channel
const channel = new BroadcastChannel('portfolio_updates');

export const mockDb = {
    // Get data from localStorage or fallback to default
    getData: (key) => {
        try {
            const stored = localStorage.getItem(`portfolio_${key}`);
            return stored ? JSON.parse(stored) : DEFAULT_DATA[key];
        } catch (error) {
            console.error("Local storage parsing error:", error);
            return DEFAULT_DATA[key];
        }
    },

    // Update data, save to localStorage, and broadcast change
    updateData: (key, newData) => {
        localStorage.setItem(`portfolio_${key}`, JSON.stringify(newData));
        channel.postMessage({ type: 'UPDATE', key, payload: newData });
    },

    // Listen to changes from other tabs via BroadcastChannel
    subscribe: (key, callback) => {
        const handleMessage = (event) => {
            if (event.data.type === 'UPDATE' && event.data.key === key) {
                callback(event.data.payload);
            }
        };

        // Also listen to native window 'storage' event as a fallback 
        // if changes happen in the same origin but different contexts
        const handleStorage = (event) => {
            if (event.key === `portfolio_${key}`) {
                try {
                    callback(JSON.parse(event.newValue));
                } catch (error) {
                    console.error("Local storage change parsing error:", error);
                }
            }
        };

        channel.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
        };
    }
};
