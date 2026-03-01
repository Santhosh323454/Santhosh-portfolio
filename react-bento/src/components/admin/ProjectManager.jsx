import { useState } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import FileUploader from './FileUploader';

export default function ProjectManager() {
    const [projects, updateProjects] = useRealtimeData('projects');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ id: '', title: '', type: '', tech: '', description: '', githubLink: '', demoLink: '', image: '' });

    const handleEdit = (proj) => {
        setEditingId(proj.id);
        setFormData(proj);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this project?")) {
            const newProjects = projects.filter(p => p.id !== id);
            updateProjects(newProjects);
        }
    };

    const handleSave = () => {
        let newProjects;
        if (editingId === 'new') {
            newProjects = [...projects, { ...formData, id: Date.now().toString() }];
        } else {
            newProjects = projects.map(p => p.id === editingId ? { ...p, ...formData } : p);
        }
        updateProjects(newProjects);
        setEditingId(null);
        alert('Projects synced live!');
    };

    const handleCreateNew = () => {
        setEditingId('new');
        setFormData({ id: '', title: '', type: '', tech: '', description: '', githubLink: '', demoLink: '', image: '' });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-orange-900">Manage Projects</h2>
                <button onClick={handleCreateNew} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold hover:bg-orange-200 text-sm">
                    + Add Project
                </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {projects && projects.map((proj) => (
                    <div key={proj.id} className="p-4 border border-gray-100 rounded-xl bg-slate-50 flex flex-col gap-3">

                        {editingId === proj.id ? (
                            <ProjectForm formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} />
                        ) : (
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-800">{proj.title}</h3>
                                    <p className="text-xs font-semibold text-orange-600 mb-1">{proj.type}</p>
                                    <p className="text-xs text-slate-500 mb-2">{proj.tech}</p>
                                    <p className="text-sm text-slate-600 line-clamp-2">{proj.description}</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button onClick={() => handleEdit(proj)} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                                    <button onClick={() => handleDelete(proj.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Create New Form Inline */}
                {editingId === 'new' && (
                    <div className="p-4 border border-orange-200 rounded-xl bg-orange-50 flex flex-col gap-3">
                        <h3 className="font-bold text-orange-900 mb-2">Create New Project</h3>
                        <ProjectForm formData={formData} setFormData={setFormData} handleSave={handleSave} handleCancel={() => setEditingId(null)} />
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectForm({ formData, setFormData, handleSave, handleCancel }) {
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    return (
        <div className="flex flex-col gap-3">
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="p-2 border rounded" placeholder="Title" />
            <input type="text" name="type" value={formData.type} onChange={handleChange} className="p-2 border rounded" placeholder="Type (e.g. Android App)" />
            <input type="text" name="tech" value={formData.tech} onChange={handleChange} className="p-2 border rounded" placeholder="Tech Stack (comma separated)" />
            <input type="text" name="githubLink" value={formData.githubLink} onChange={handleChange} className="p-2 border rounded" placeholder="GitHub Code Link" />
            <input type="text" name="demoLink" value={formData.demoLink} onChange={handleChange} className="p-2 border rounded" placeholder="Live Demo Link" />
            <FileUploader
                label="Project Screenshot"
                type="image"
                folderName="projects"
                value={formData.image || ''}
                onChange={(url) => setFormData({ ...formData, image: url })}
            />
            <textarea name="description" value={formData.description} onChange={handleChange} className="p-2 border rounded text-sm" placeholder="Description" rows="2" />
            <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 text-sm">Save</button>
                <button onClick={handleCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-400 text-sm">Cancel</button>
            </div>
        </div>
    );
}
