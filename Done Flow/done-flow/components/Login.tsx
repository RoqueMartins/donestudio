
import React, { useState } from 'react';
import { Mail, Lock, Loader2, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { loginEmail, signupEmail, loginGoogle, saveUserProfile } from '../services/firebase';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (method: 'email' | 'facebook' | 'instagram' | 'google', data?: any) => void;
  onSignup: (data: any) => void;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login: React.FC<LoginProps> = () => {
  const [isSignup, setIsSignup] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
        await loginEmail(email, password);
        // App.tsx listener will handle redirect
    } catch (error: any) {
        let msg = "Não foi possível acessar.";
        if (error.code === 'auth/invalid-credential') msg = "Acesso negado. Verifique seu e-mail e senha.";
        if (error.code === 'auth/user-not-found') msg = "Conta não encontrada. Crie uma nova.";
        setErrorMsg(msg);
        setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    
    try {
        const userCredential = await signupEmail(email, password, name);
        const user = userCredential.user;

        const newUser: UserType = {
            id: user.uid,
            name: name,
            agencyName: agencyName || 'Minha Agência',
            email: email,
            role: 'Admin',
            plan: 'Trial',
            subscriptionStatus: 'trial',
            isAdmin: false,
            lastLogin: new Date(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
            timezone: 'America/Sao_Paulo',
            location: 'Brasil'
        };
        
        await saveUserProfile(newUser);
    } catch (error: any) {
        let msg = "Não foi possível criar a conta.";
        if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está cadastrado.";
        if (error.code === 'auth/weak-password') msg = "A senha deve ser mais forte (min 6 caracteres).";
        setErrorMsg(msg);
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      try {
          const result = await loginGoogle();
          if (!result) return;
          
          const user = result.user;
          const newUser: UserType = {
              id: user.uid,
              name: user.displayName || 'Usuário Google',
              email: user.email || '',
              agencyName: 'Minha Agência',
              role: 'Social Media',
              plan: 'Trial',
              subscriptionStatus: 'trial',
              avatar: user.photoURL || '',
              lastLogin: new Date(),
              isAdmin: false
          };
          await saveUserProfile(newUser);
      } catch (error: any) {
          setErrorMsg("Não foi possível conectar com Google.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-500/5 blur-[120px]"></div>
         <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      <div className="glass-panel w-full max-w-[440px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in relative z-10 border border-white/50">
        
        <div className="p-10 pb-6 text-center">
           <div className="flex justify-center mb-6">
            <div className="flex flex-col leading-none">
               <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">
                 done<span className="font-light text-brand-600 ml-0.5">flow</span>
               </span>
            </div>
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-2">
             {isSignup ? 'Comece Grátis' : 'Bem-vindo de volta'}
           </h2>
           <p className="text-sm text-slate-500 font-medium leading-relaxed">
             {isSignup ? 'Crie sua conta em segundos e revolucione sua agência.' : 'Acesse seu painel e gerencie suas mídias.'}
           </p>
        </div>

        <div className="px-10 pb-10 space-y-6">
           {!isSignup && (
             <div className="grid grid-cols-1">
               <button 
                 onClick={handleGoogleLogin}
                 className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all shadow-sm font-bold text-slate-600 text-sm"
                 title="Google"
               >
                 <GoogleIcon /> Entrar com Google
               </button>
             </div>
           )}

           {!isSignup && (
             <div className="flex items-center gap-4">
               <div className="h-px bg-slate-200 flex-1"></div>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ou email</span>
               <div className="h-px bg-slate-200 flex-1"></div>
             </div>
           )}

           {errorMsg && (
               <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                   <AlertCircle size={16} /> {errorMsg}
               </div>
           )}

           <form onSubmit={isSignup ? handleEmailSignup : handleEmailLogin} className="space-y-4">
              
              {isSignup && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                          placeholder="Nome completo"
                        />
                    </div>
                  </div>
                  <div>
                    <div className="relative group">
                        <Building className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input 
                          type="text" 
                          value={agencyName}
                          onChange={(e) => setAgencyName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                          placeholder="Nome da agência (opcional)"
                        />
                    </div>
                  </div>
                </div>
              )}

              <div>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                      placeholder="seu@email.com"
                    />
                 </div>
              </div>
              <div>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                      placeholder="Senha segura"
                      minLength={6}
                    />
                 </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-brand-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10 hover:shadow-brand-500/25 disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                        {isSignup ? 'Criar Conta Grátis' : 'Entrar na Plataforma'}
                        {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </>
                )}
              </button>
           </form>

           <div className="text-center">
             <button 
               onClick={() => {
                 setIsSignup(!isSignup);
                 if(isSignup) {
                    setName('');
                    setAgencyName('');
                 }
                 setErrorMsg('');
               }} 
               className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
             >
               {isSignup ? 'Já tem uma conta?' : 'Não tem uma conta?'} <span className="text-brand-600 font-bold underline decoration-brand-200 underline-offset-2">{isSignup ? 'Fazer Login' : 'Cadastre-se'}</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
