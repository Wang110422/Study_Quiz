import Avartar from "../../common/Avartar";
import SearchBar from "../../common/SearchBar";

type HeaderProps = {
    onToggleSidebar: () => void;
};

const Header = ({ onToggleSidebar }: HeaderProps) => {
    return (
        <header className="relative z-30 bg-white text-black p-3 flex items-center justify-between border-b shadow-sm">
            <div className="flex items-center gap-2">
                <button
                    aria-label="Toggle sidebar"
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-md">
                    <SearchBar />
                </div>
            </div>

            <div className="flex items-center">
                <button className="mr-4 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className="flex items-center">
                    <Avartar />
                </div>
            </div>
        </header>
    );
};

export default Header;