import { useState } from 'react';
import Modal from '../../common/Modal';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFolder?: (folder: { title: string; description: string; icon: string; slug: string }) => void;
}

const CreateFolderModal = ({ isOpen, onClose, onCreateFolder }: CreateFolderModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        if (onCreateFolder) {
            onCreateFolder({
                title: title.trim(),
                description: description.trim(),
                icon: 'folder',
                slug: slug || `folder-${Date.now()}`,
            });
        }

        // Reset
        setTitle('');
        setDescription('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tạo thư mục mới">
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 select-none">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên thư mục <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Tiếng Pháp A1, Hóa học Lớp 12..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mô tả ngắn
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập thông tin mô tả cho thư mục này..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                    />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                        Tạo thư mục
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateFolderModal;
