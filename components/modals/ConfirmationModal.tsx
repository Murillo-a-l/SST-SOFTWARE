import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    confirmButtonText?: string;
    confirmButtonClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText,
    confirmButtonText = "Confirmar",
    confirmButtonClass = "bg-blue-600 hover:bg-blue-700",
}) => {
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setInputText(''); // Reset input when modal closes
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isConfirmDisabled = confirmText ? inputText !== confirmText : false;

    const handleConfirm = () => {
        if (!isConfirmDisabled) {
            onConfirm();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    {children}
                    {confirmText && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Para confirmar, digite "<span className="font-bold">{confirmText}</span>" abaixo:
                            </label>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className={`text-white px-4 py-2 rounded-lg text-sm font-semibold transition ${confirmButtonClass} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};