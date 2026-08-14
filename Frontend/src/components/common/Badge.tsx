import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
    size?: 'sm' | 'md';
    className?: string;
}

const variantStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
};

const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
};

const Badge = ({
    children,
    variant = 'indigo',
    size = 'sm',
    className = '',
}: BadgeProps) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
