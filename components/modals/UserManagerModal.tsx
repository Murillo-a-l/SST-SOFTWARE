
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { userService } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

const initialFormState: Omit<User, 'id'> = {
    nome: '',
    username: '',
    password: '',
    role: 'user',
};

export const UserManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setUsers(userService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                nome: selectedUser.nome,
                username: selectedUser.username,
                password: '', // Do not show password, only allow setting a new one
                role: selectedUser.role
            });
        } else {
            setFormData(initialFormState);
        }
    }, [selectedUser]);
    
    const handleSave = () => {
        if (!formData.nome || !formData.username) {
            alert('Nome e Nome de Usuário são obrigatórios.');
            return;
        }
        if (!selectedUser && !formData.password) {
            alert('A senha é obrigatória para novos usuários.');
            return;
        }

        if (selectedUser) {
            const dataToUpdate: Partial<Omit<User, 'id'>> = {
                nome: formData.nome,
                username: formData.username,
                role: formData.role
            };
            if(formData.password) {
                dataToUpdate.password = formData.password;
            }
            userService.update(selectedUser.id, dataToUpdate);
        } else {
            userService.add(formData);
        }

        onDataChange();
        setUsers(userService.getAll());
        setSelectedUser(null);
    };

    const handleDelete = () => {
        if (selectedUser && window.confirm(`Tem certeza que deseja excluir o usuário "${selectedUser.nome}"?`)) {
            // Prevent deleting the last admin
            const admins = users.filter(u => u.role === 'admin');
            if(selectedUser.role === 'admin' && admins.length <= 1) {
                alert("Não é possível excluir o último administrador do sistema.");
                return;
            }
            
            userService.remove(selectedUser.id);
            onDataChange();
            setUsers(userService.getAll());
            setSelectedUser(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">👥 Gerenciar Usuários</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                    {/* Lista de Usuários */}
                    <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Usuários Cadastrados</h3>
                        <ul>
                            {users.map(user => (
                                <li key={user.id}>
                                    <button onClick={() => setSelectedUser(user)} className={`w-full text-left p-2 rounded text-sm ${selectedUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        {user.nome} ({user.role})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Formulário de Edição/Criação */}
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selectedUser ? 'Editando Usuário' : 'Novo Usuário'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome Completo*</label>
                            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nome de Usuário*</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Senha*</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border rounded" placeholder={selectedUser ? "Deixe em branco para não alterar" : ""}/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Nível de Acesso</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'user'})} className="w-full p-2 border rounded">
                                <option value="user">Usuário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setSelectedUser(null)} className="bg-gray-200 px-4 py-2 rounded text-sm">Novo/Limpar</button>
                            {selectedUser && <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Excluir</button>}
                            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded text-sm">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
