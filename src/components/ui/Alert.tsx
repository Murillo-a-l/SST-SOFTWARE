import React from 'react';

interface AlertProps {
    variant: 'error' | 'warning' | 'success';
    title?: string;
    children: React.ReactNode;
}

const variantClasses = {
    error: {
        bg: 'bg-red-50 border-red-400',
        icon: 'text-red-400',
        title: 'text-red-800',
        text: 'text-red-700',
    },
    warning: {
        bg: 'bg-yellow-50 border-yellow-400',
        icon: 'text-yellow-400',
        title: 'text-yellow-800',
        text: 'text-yellow-700',
    },
    success: {
        bg: 'bg-green-50 border-green-400',
        icon: 'text-green-400',
        title: 'text-green-800',
        text: 'text-green-700',
    },
};

export const Alert: React.FC<AlertProps> = ({ variant, title, children }) => {
    const classes = variantClasses[variant];

    return (
        <div className={`border-l-4 p-4 ${classes.bg}`} role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    {/* You can use an icon library here */}
                    <svg className={`h-5 w-5 ${classes.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-3a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    {title && <h3 className={`text-sm font-medium ${classes.title}`}>{title}</h3>}
                    <div className={`text-sm ${classes.text}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
