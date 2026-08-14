import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, FolderPlus, UserPlus, Route } from 'lucide-react';
import Modal from '../../common/Modal';
import CreateFolderModal from './CreateFolderModal';

interface CreateNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const options = [
    {
        id: 'set',
        title: 'Bộ thẻ học mới',
        desc: 'Tạo bộ thẻ từ vựng với các thuật ngữ và định nghĩa',
        icon: Layers,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        id: 'folder',
        title: 'Thư mục mới',
        desc: 'Gộp các bộ thẻ học phần theo chủ đề hoặc môn học',
        icon: FolderPlus,
        color: 'bg-amber-100 text-amber-600',
    },
    {
        id: 'class',
        title: 'Tham gia lớp học',
        desc: 'Nhập mã lớp để tham gia lớp học của giáo viên',
        icon: UserPlus,
        color: 'bg-emerald-100 text-emerald-600',
    },
    {
        id: 'path',
        title: 'Lộ trình học mới',
        desc: 'Lên kế hoạch học từ vựng theo mục tiêu ngày',
        icon: Route,
        color: 'bg-purple-100 text-purple-600',
    },
];

const CreateNewModal = ({ isOpen, onClose }: CreateNewModalProps) => {
    const navigate = useNavigate();
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Tạo mới nội dung">
                <div className="space-y-3">
                    {options.map((opt) => {
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    onClose();
                                    if (opt.id === 'set') {
                                        navigate('/create-set');
                                    } else if (opt.id === 'folder') {
                                        setIsFolderModalOpen(true);
                                    }
                                }}
                                className="w-full bg-slate-50/70 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 rounded-2xl p-4 text-left transition-all flex items-center gap-3.5 cursor-pointer group"
                            >
                                <div className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                        {opt.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        {opt.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Modal>

            <CreateFolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
            />
        </>
    );
};

export default CreateNewModal;
