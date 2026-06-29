import { useState } from "react";
import Header from "../layout/Header/Header";
import Sidebar from "../layout/SideBar/Sidebar";
import Button from "../common/Button";
import FlashCard from "../features/FlashCard";

let textList = ["Kiểm tra", "Học", "Button 3", "Button 4"];

const FlashCardDetailPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
            <Sidebar open={sidebarOpen} />
            <main className={`transition-transform duration-200 ${sidebarOpen ? 'translate-x-64' : 'translate-x-0'} pt-6`}>
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-semibold mb-2">Title</h1>
                    <p className="text-slate-600 mb-6">Nội dung mô tả ngắn cho trang flash card.</p>

                    <div className="mx-auto w-full max-w-4xl">
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {textList.map((text, index) => (
                                <li key={index}>
                                    <Button text={text} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-10">
                        <FlashCard term="Term" definition="Definition" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FlashCardDetailPage;