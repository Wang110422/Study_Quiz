const SearchBar = () => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Tính năng tìm kiếm nay còn nhanh hơn"
                className="w-full rounded-full bg-gray-100 py-3 pl-12 pr-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
        </div>
    );
};

export default SearchBar;