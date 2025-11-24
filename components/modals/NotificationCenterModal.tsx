import React from 'react';
import type { Notification } from '../../types';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onResolve: (notification: Notification) => void;
}

const NotificationIcon: React.FC<{ type: Notification['type']; notificationType?: Notification['notificationType'] }> = ({ type, notificationType }) => {
  if (notificationType === 'SIGNATURE_REQUEST') {
    return (
      <span className="text-[#0F4C5C]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </span>
    );
  }
  if (notificationType === 'DUPLICATE_EMPLOYEE') {
    return <span className="text-amber-600">⚠️</span>;
  }
  switch (type) {
    case 'warning':
      return <span className="text-amber-500">⚠️</span>;
    case 'task':
      return <span className="text-blue-500">📝</span>;
    default:
      return <span className="text-gray-500">🔔</span>;
  }
};

export const NotificationCenterModal: React.FC<ModalProps> = ({ isOpen, onClose, notifications, onResolve }) => {
  if (!isOpen) return null;

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-3xl max-h-[90vh] flex flex-col`}>
        <div className={`${modalHeader} border-b border-[#E0E3E7]`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">Central</p>
            <h2 className="text-xl font-bold text-slate-900">Ações Pendentes</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>

        <div className={`${modalBody} overflow-y-auto`}>
          {notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li key={notification.id} className="p-4 border border-[#E3E8F2] rounded-xl bg-white/80 flex justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl pt-1">
                      <NotificationIcon type={notification.type} notificationType={notification.notificationType} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {notification.notificationType === 'DUPLICATE_EMPLOYEE' ? 'Possível Duplicidade' : 'Assinatura Requerida'}
                      </p>
                      <p className="text-sm text-slate-700">{notification.message}</p>
                      <p className="text-xs text-slate-400">{new Date(notification.date).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onResolve(notification)}
                    className="whitespace-nowrap"
                  >
                    Resolver
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">Nenhuma ação pendente.</p>
            </div>
          )}
        </div>

        <div className={`${modalFooter} border-t border-[#E0E3E7]`}>
          <Button variant="secondary" size="md" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
};
