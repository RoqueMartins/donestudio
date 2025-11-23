
import React, { useState, useEffect } from 'react';
import { User, Plan } from '../types';
import { Search, UserPlus, Shield, Trash2, CheckCircle2, ShieldAlert, X, Edit2, Power, Save, CreditCard, Lock } from 'lucide-react';

interface AdminPanelProps {
  allUsers: User[];
  setAllUsers: (users: User[]) => void;
  currentUser: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, setAllUsers, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // System Config State
  const [stripeKey, setStripeKey] = useState('');
  const [configMessage, setConfigMessage] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('doneflow_stripe_key');
    if (savedKey) setStripeKey(savedKey);
  }, []);

  // Filter Users
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário permanentemente?')) {
      setAllUsers(allUsers.filter(u => u.id !== userId));
    }
  };

  const toggleAdminStatus = (userId: string) => {
    const updatedUsers = allUsers.map(u => {
        if (u.id === userId) {
            return { ...u, isAdmin: !u.isAdmin };
        }
        return u;
    });
    setAllUsers(updatedUsers);
  };

  const toggleStatus = (userId: string) => {
      const updatedUsers = allUsers.map(u => {
          if (u.id === userId) {
              const newStatus = u.subscriptionStatus === 'active' ? 'inactive' : 'active';
              return { ...u, subscriptionStatus: newStatus as 'active' | 'inactive' | 'trial' };
          }
          return u;
      });
      setAllUsers(updatedUsers);
  }

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    const updatedUsers = allUsers.map(u => 
      u.id === editingUser.id ? editingUser : u
    );
    
    setAllUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSaveStripeKey = () => {
    localStorage.setItem('doneflow_stripe_key', stripeKey.trim());
    setConfigMessage('Chave salva com sucesso!');
    setTimeout(() => setConfigMessage(''), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel Administrativo</h2>
          <p className="text-slate-500">Gerencie usuários, permissões e assinaturas da plataforma.</p>
        </div>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-md">
            <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total de Usuários</p>
              <p className="text-3xl font-bold text-slate-800">{allUsers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Assinaturas Ativas</p>
              <p className="text-3xl font-bold text-green-600">{allUsers.filter(u => u.subscriptionStatus === 'active').length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Planos Agency</p>
              <p className="text-3xl font-bold text-purple-600">{allUsers.filter(u => u.plan === 'Agency').length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Receita Mensal (Est.)</p>
              <p className="text-3xl font-bold text-slate-800">
                R$ {allUsers.reduce((acc, curr) => acc + (curr.plan === 'Agency' ? 497 : curr.plan === 'Pro' ? 149.90 : 49.90), 0).toFixed(2).replace('.', ',')}
              </p>
          </div>
      </div>

      {/* Configuration Section */}
      <div className="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
         <div className="flex items-center gap-3 mb-4">
             <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <CreditCard size={20} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800">Configurações de Pagamento (Stripe)</h3>
                <p className="text-xs text-slate-500">Defina as chaves de API para processamento de cartões.</p>
             </div>
         </div>
         
         <div className="flex items-end gap-4 max-w-3xl">
             <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Chave Pública (Publishable Key)</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={stripeKey}
                        onChange={(e) => setStripeKey(e.target.value)}
                        placeholder="pk_live_..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono text-slate-600"
                    />
                 </div>
             </div>
             <button 
                onClick={handleSaveStripeKey}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
             >
                <Save size={18} /> Salvar Configuração
             </button>
         </div>
         {configMessage && (
             <p className="mt-2 text-sm text-green-600 font-bold flex items-center gap-1">
                 <CheckCircle2 size={14} /> {configMessage}
             </p>
         )}
      </div>

      {/* User List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou email..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0 z-10">
                      <tr>
                          <th className="px-6 py-4 font-bold">Usuário</th>
                          <th className="px-6 py-4 font-bold">Plano</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold">Acesso</th>
                          <th className="px-6 py-4 font-bold text-right">Ações</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(user => (
                          <tr key={user.id || Math.random()} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                                      <div>
                                          <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                          <p className="text-xs text-slate-500">{user.email}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                      user.plan === 'Agency' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                      user.plan === 'Pro' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                      'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                      {user.plan}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  <button 
                                    onClick={() => user.id && toggleStatus(user.id)}
                                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                    title="Clique para alterar status"
                                  >
                                      {user.subscriptionStatus === 'active' ? (
                                          <>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-slate-600 font-medium">Ativo</span>
                                          </>
                                      ) : (
                                          <>
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="text-sm text-slate-600 font-medium">Inativo</span>
                                          </>
                                      )}
                                  </button>
                              </td>
                              <td className="px-6 py-4">
                                  {user.isAdmin ? (
                                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-fit border border-red-100">
                                          <Shield size={12} /> Admin
                                      </span>
                                  ) : (
                                      <span className="text-xs text-slate-500 font-medium">Usuário</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                      <button 
                                        onClick={() => openEditModal(user)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar Usuário"
                                      >
                                          <Edit2 size={16} />
                                      </button>
                                      
                                      <button 
                                        onClick={() => user.id && toggleStatus(user.id)}
                                        className={`p-2 rounded-lg transition-colors ${user.subscriptionStatus === 'active' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                        title={user.subscriptionStatus === 'active' ? "Desativar Conta" : "Ativar Conta"}
                                      >
                                          <Power size={16} />
                                      </button>

                                      <button 
                                        onClick={() => user.id && toggleAdminStatus(user.id)}
                                        className={`p-2 rounded-lg transition-colors ${user.isAdmin ? 'text-red-600 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                        title={user.isAdmin ? "Remover Admin" : "Tornar Admin"}
                                        disabled={user.id === currentUser.id}
                                      >
                                          <Shield size={16} />
                                      </button>
                                      
                                      <button 
                                        onClick={() => user.id && handleDeleteUser(user.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={user.id === currentUser.id}
                                        title="Excluir Usuário"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* EDIT USER MODAL */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Gerenciar Usuário</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex justify-center mb-4">
                 <img src={editingUser.avatar} alt="" className="w-20 h-20 rounded-full border-4 border-slate-100" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                 <input 
                   type="text" 
                   value={editingUser.name}
                   onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                   className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                 <input 
                   type="email" 
                   value={editingUser.email}
                   onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                   className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plano</label>
                    <select 
                      value={editingUser.plan}
                      onChange={(e) => setEditingUser({...editingUser, plan: e.target.value as Plan})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Pro">Pro</option>
                      <option value="Agency">Agency</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select 
                      value={editingUser.subscriptionStatus}
                      onChange={(e) => setEditingUser({...editingUser, subscriptionStatus: e.target.value as 'active' | 'inactive' | 'trial'})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="trial">Trial</option>
                    </select>
                 </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={editingUser.isAdmin}
                      onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                      disabled={editingUser.id === currentUser.id}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    Acesso de Administrador
                  </label>
               </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveUser}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2 shadow-sm"
              >
                <Save size={16} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
