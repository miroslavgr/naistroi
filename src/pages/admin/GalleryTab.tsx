import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useStore } from '../../store';

export const GalleryTab = () => {
    const { galleryImages, uploadImage, deleteImage } = useStore();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                await uploadImage(e.target.files[0]);
            } catch (err) {
                alert("Upload failed!");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-heading font-bold uppercase mb-6 flex items-center gap-2"><ImageIcon size={20}/> Галерия</h3>
            
            <div className="mb-8">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex flex-col items-center pt-5 pb-6">
                        {uploading ? (
                            <Loader2 className="animate-spin text-orange-500 mb-2" size={32}/>
                        ) : (
                            <Upload className="text-slate-400 mb-2" size={32}/>
                        )}
                        <p className="text-sm text-slate-500 font-bold uppercase">{uploading ? 'Качване...' : 'Натисни за качване на снимка'}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {galleryImages.map(img => (
                    <div key={img.id} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button 
                                onClick={() => deleteImage(img.id, img.url)}
                                className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50"
                                title="Изтрий"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {galleryImages.length === 0 && <div className="text-center text-slate-400 py-12">Няма качени снимки</div>}
        </div>
    );
};