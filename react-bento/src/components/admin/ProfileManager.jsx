import { useState, useEffect } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import FileUploader from './FileUploader';

export default function ProfileManager() {
    const [profile, updateProfile] = useRealtimeData('profile');
    const [formData, setFormData] = useState(profile || {});

    // Update local form state when the hook fetches the initial data
    useEffect(() => {
        if (profile && JSON.stringify(profile) !== JSON.stringify(formData)) {
            setFormData(profile);
        }
    }, [profile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            console.log('--- ATTEMPTING TO SAVE PROFILE ---');
            console.log('formData being sent to useRealtimeData:', formData);
            await updateProfile(formData);
            alert('Profile updated and broadcasted instantly!');
        } catch (error) {
            alert('Failed to save profile. Check the console for details.');
        }
    };

    if (!profile) return <p>Loading...</p>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <h2 className="text-xl font-bold text-orange-900 mb-4">Profile Data</h2>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Name</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Role</label>
                        <input type="text" name="role" value={formData.role || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <FileUploader
                        label="Hero Profile Image"
                        type="image"
                        folderName="avatars"
                        value={formData.avatarUrl || ''}
                        onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                    />
                    <FileUploader
                        label="About Section Image"
                        type="image"
                        folderName="avatars"
                        value={formData.aboutImageUrl || ''}
                        onChange={(url) => setFormData({ ...formData, aboutImageUrl: url })}
                    />
                    <FileUploader
                        label="Robot Avatar Image"
                        type="image"
                        folderName="avatars"
                        value={formData.robotImageUrl || ''}
                        onChange={(url) => setFormData({ ...formData, robotImageUrl: url })}
                    />
                    <FileUploader
                        label="Resume PDF"
                        type="pdf"
                        folderName="resumes"
                        value={formData.resumeUrl || ''}
                        onChange={(url) => setFormData({ ...formData, resumeUrl: url })}
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700">CGPA</label>
                    <input type="text" name="cgpa" value={formData.cgpa || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>

                {/* About Section content fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Hero Description</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Short intro for the top hero banner" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700">About Section Description</label>
                        <textarea name="longDescription" value={formData.longDescription || ''} onChange={handleChange} rows="3" className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Longer text for the About Me section" />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700">Education Details (About Section)</label>
                    <textarea name="educationDetails" value={formData.educationDetails || ''} onChange={handleChange} rows="3" className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Use • for bullet points (e.g. &#10;• B.Tech IT (2023 - 2027)&#10;• High School (76.6%))" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">LinkedIn URL</label>
                        <input type="text" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700">GitHub URL</label>
                        <input type="text" name="github" value={formData.github || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700">LeetCode URL</label>
                        <input type="text" name="leetcode" value={formData.leetcode || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-4 bg-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors"
                >
                    Save Profile
                </button>
            </div>
        </div>
    );
}
