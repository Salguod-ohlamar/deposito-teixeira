import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Componente para a página de login e recuperação de senha.
 * Gerencia a visualização entre o formulário de login e o de recuperação.
 * @param {object} props - As propriedades do componente.
 * @param {Function} props.onLogin - Função a ser chamada após um login bem-sucedido. Recebe os dados do usuário e o token.
 * @param {Function} props.handlePasswordRecovery - Função para lidar com a solicitação de recuperação de senha.
 */
const LoginPage = ({ onLogin, handlePasswordRecovery }) => {
    const [modalView, setModalView] = useState('login'); // 'login' ou 'recover'
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [recoverEmail, setRecoverEmail] = useState('');
    const [recoverName, setRecoverName] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || '';

    /**
     * Manipula a submissão do formulário de login.
     * Envia as credenciais para a API e chama a função onLogin em caso de sucesso.
     * @param {React.FormEvent} e - O evento do formulário.
     */
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao fazer login.');

            onLogin(data); // Pass the whole data object { user, token }

        } catch (error) {
            toast.error(error.message || 'Credenciais inválidas.');
        }
    };

    /**
     * Manipula a submissão do formulário de recuperação de senha.
     * @param {React.FormEvent} e - O evento do formulário.
     */
    const handleRecoverSubmit = async (e) => {
        e.preventDefault();
        if (!recoverEmail || !recoverName) {
            toast.error('Por favor, preencha e-mail e nome.');
            return;
        }
        const success = await handlePasswordRecovery(recoverEmail, recoverName);
        if (success) {
            setModalView('login');
        }
    };

    if (modalView === 'login') {
        return (
            <>
                <h2 className="text-2xl font-bold text-center text-red-700 mb-6">Acessar Conta</h2>
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <div>
                        <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email-login" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input id="password-login" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <button type="submit" className="w-full mt-4 px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition-colors duration-300">Entrar</button>
                </form>
                <div className="text-center mt-4">
                    <button onClick={() => setModalView('recover')} className="text-sm text-gray-500 hover:text-gray-700 hover:underline">Esqueceu a senha?</button>
                </div>
            </>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-center text-red-700 mb-6">Recuperar Senha</h2>
            <form className="space-y-4" onSubmit={handleRecoverSubmit}>
                <div>
                    <label htmlFor="email-recover" className="block text-sm font-medium text-gray-700">Email Cadastrado</label>
                    <input id="email-recover" type="email" value={recoverEmail} onChange={e => setRecoverEmail(e.target.value)} required className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="name-recover" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input id="name-recover" type="text" value={recoverName} onChange={e => setRecoverName(e.target.value)} required className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <button type="submit" className="w-full mt-4 px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition-colors duration-300">Recuperar</button>
            </form>
            <div className="text-center mt-4">
                <button onClick={() => setModalView('login')} className="text-sm text-gray-500 hover:text-gray-700 hover:underline">Voltar para o login</button>
            </div>
        </>
    );
};

export default LoginPage;