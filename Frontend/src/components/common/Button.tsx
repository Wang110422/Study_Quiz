interface ButtonProps {
    onClick?: () => void;
    text: string;
    className?: string;
}

const Button = ({ onClick, text, className }: ButtonProps) => {
    return (
        <div className="w-full">
            <button
                className={`w-full px-4 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || 'bg-blue-600 text-white'}`}
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
};
export default Button;