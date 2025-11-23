import React, { useState, useEffect } from 'react';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';

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
    confirmButtonClass,
}) => {
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setInputText('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isConfirmDisabled = confirmText ? inputText !== confirmText : false;

    const handleConfirm = () => {
        if (!isConfirmDisabled) {
            onConfirm();
        }
    };

    return (
        <div className={modalOverlay}>
            <div className={`${modalPanel} max-w-lg`}>
                <div className={modalHeader}>
                    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                <div className={`${modalBody} space-y-4`}>
                    {children}
                    {confirmText && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700">
                                Para confirmar, digite "<span className="font-bold">{confirmText}</span>" abaixo:
                            </label>
                            <Input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    )}
                </div>
                <div className={modalFooter}>
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className={confirmButtonClass}
                    >
                        {confirmButtonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
