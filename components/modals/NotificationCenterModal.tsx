import React from 'react';
import type { Notification } from '../../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onResolve: (notification: Notification) => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    switch (type) {
        case 'warning': return <span className="text-yellow-500">⚠️</span>;
        case 'task': return <span className="text-blue-500">✍️</span>;
        default: return <span className="text-gray-500">ℹ️</span>;
    }
}

export const NotificationCenterModal: React.FC<ModalProps> = ({ isOpen, onClose, notifications, onResolve }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">🔔 Central de Ações Pendentes</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto flex-grow">
                    {notifications.length > 0 ? (
                        <ul className="space-y-3">
                            {notifications.map(notification => (
                                <li key={notification.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl pt-1">
                                                <NotificationIcon type={notification.type} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {notification.notificationType === 'DUPLICATE_EMPLOYEE' ? 'Possível Duplicidade' : 'Assinatura Requerida'}
                                                </p>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.date).toLocaleString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onResolve(notification)}
                                            className="bg-indigo-600 text-white font-bold py-1 px-3 rounded-md text-sm hover:bg-indigo-700 whitespace-nowrap"
                                        >
                                            Resolver
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Nenhuma ação pendente.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
