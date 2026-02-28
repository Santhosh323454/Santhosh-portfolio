import { useNavigate } from 'react-router-dom';
import ProfileManager from '../components/admin/ProfileManager';
import ProjectManager from '../components/admin/ProjectManager';
import ExperienceManager from '../components/admin/ExperienceManager';
import { CURRENT_VERSION } from '../components/ThemeContext';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6 lg:p-12 transition-colors relative overflow-hidden">

            {/* Decorative Background Blobs for Lavender Theme */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/50 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-3xl pointer-events-none z-0"></div>

            <div className="max-w-6xl w-full mx-auto relative z-10">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-orange-100 backdrop-blur-sm bg-white/80">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-orange-100 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                            {/* 3D Boy Avatar Greeting */}
                            <img src={`/avatarr.png?v=${CURRENT_VERSION}`} alt="Admin Avatar" className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-orange-950">Welcome Back, Santhosh!</h1>
                            <p className="text-orange-600 font-medium">Manage your portfolio in real-time.</p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="px-6 py-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 font-bold transition-colors shadow-sm">
                        Secure Logout
                    </button>
                </div>

                {/* Management Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Profile Management Column */}
                    <div className="flex flex-col gap-8">
                        <ProfileManager />

                        {/* Note to admin */}
                        <div className="bg-orange-600 text-white p-6 rounded-2xl shadow-lg shadow-orange-200">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">âš¡ Live Synchronization Active</h3>
                            <p className="text-orange-100 text-sm">Any changes you make here are instantly broadcasted to all live visitors viewing your portfolio without requiring a page refresh. Test it by opening the homepage in another tab!</p>
                        </div>
                    </div>

                    {/* Project & Certifications Management Column */}
                    <div className="flex flex-col gap-8">
                        <ProjectManager />
                        <ExperienceManager />
                    </div>
                </div>

            </div>
        </div>
    );
}
