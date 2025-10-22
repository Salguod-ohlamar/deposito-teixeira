import { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

import { parsePrice } from './formatters.js';

const generateReceiptCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BC-${year}${month}${day}-${randomPart}`;
};

const initialEstoque = [
    { id: 1, nome: 'Capa Protetora Neon', categoria: 'Capas', marca: 'GShield', fornecedor: 'Fornecedor A', emEstoque: 50, qtdaMinima: 10, preco: 79.90, precoFinal: 99.90, markup: '25.03', imagem: 'https://i.zst.com.br/thumbs/12/2a/39/1588494596.jpg', historico: [], destaque: true, tempoDeGarantia: 30 },
    { id: 2, nome: 'Fone de Ouvido Cyber', categoria: 'Áudio', marca: 'JBL', fornecedor: 'Fornecedor B', emEstoque: 4, qtdaMinima: 5, preco: 199.90, precoFinal: 249.90, markup: '25.08', imagem: 'https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-master-catalog/default/dwb4c84af5/1_JBL_T510BT_Product%20Image_Hero_Black.png?sw=537&sfrm=png', historico: [], destaque: true, tempoDeGarantia: 90 },
    { id: 3, nome: 'Película Stealth', categoria: 'Películas', marca: 'HPrime', fornecedor: 'Fornecedor A', emEstoque: 120, qtdaMinima: 20, preco: 59.90, precoFinal: 75.00, markup: '25.21', imagem: 'https://images.tcdn.com.br/img/img_prod/606550/pelicula_hprime_premium_curves_pro_cobre_100_da_tela_para_samsung_galaxy_s22_ultra_sm_s908_6_8_11705_1_a2657e1b305d39a387f620869a3792d4.jpg', historico: [], destaque: true, tempoDeGarantia: 7 },
    { id: 4, nome: 'Carregador Turbo Tech', categoria: 'Carregadores', marca: 'Anker', fornecedor: 'Fornecedor C', emEstoque: 75, qtdaMinima: 15, preco: 129.90, precoFinal: 159.90, markup: '23.27', imagem: 'https://d1i2p25t269xed.cloudfront.net/product/images/1694630018-41-1.jpg', historico: [], destaque: false, tempoDeGarantia: 90 },
];

const initialServicos = [
    { id: 1, servico: 'Troca de Tela iPhone 12', fornecedor: 'Fornecedor Peças A', marca: 'Apple', tipoReparo: 'Tela', tecnico: 'João Silva', preco: 300.00, precoFinal: 650.00, imagem: 'https://images.unsplash.com/photo-1603893352355-b2405a498bab?auto=format&fit=crop&w=200', markup: '116.67', destaque: true, historico: [], tempoDeGarantia: 90 },
    { id: 2, servico: 'Troca de Bateria Galaxy S21', fornecedor: 'Fornecedor Peças B', marca: 'Samsung', tipoReparo: 'Bateria', tecnico: 'Maria Souza', preco: 150.00, precoFinal: 350.00, imagem: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?auto=format&fit=crop&w=200', markup: '133.33', destaque: true, historico: [], tempoDeGarantia: 90 },
];

export const PERMISSION_GROUPS = {
    products: {
        title: 'Produtos',
        permissions: {
            addProduct: { label: 'Adicionar Produto', roles: ['root', 'admin', 'user'] },
            editProduct: { label: 'Editar Produto', roles: ['root', 'admin', 'user'] },
            deleteProduct: { label: 'Excluir Produto', roles: ['root', 'admin'] },
            exportCsv: { label: 'Exportar CSV de Produtos', roles: ['root', 'admin', 'user'] },
            viewProductHistory: { label: 'Visualizar Histórico do Produto', roles: ['root', 'admin'] },
        }
    },
    services: {
        title: 'Serviços',
        permissions: {
            addService: { label: 'Adicionar Serviço', roles: ['root', 'admin', 'user'] },
            editService: { label: 'Editar Serviço', roles: ['root', 'admin', 'user'] },
            deleteService: { label: 'Excluir Serviço', roles: ['root', 'admin'] },
            viewServiceHistory: { label: 'Visualizar Histórico do Serviço', roles: ['root', 'admin'] },
        }
    },
    siteContent: {
        title: 'Conteúdo do Site',
        permissions: {
            manageBanners: { label: 'Gerenciar Banners', roles: ['root', 'admin', 'user'] },
        }
    },
    admin: {
        title: 'Administração',
        permissions: {
            viewDashboardCharts: { label: 'Ver Análise Gráfica', roles: ['root', 'admin'] },
            viewSalesHistory: { label: 'Ver Histórico de Vendas', roles: ['root', 'admin'] },
            viewUserSalesReport: { label: 'Ver Relatório por Vendedor', roles: ['root', 'admin'] },
            viewDreReport: { label: 'Ver DRE Simplificado', roles: ['root', 'admin'] },
            viewActivityLog: { label: 'Ver Log de Atividades', roles: ['root', 'admin'] },
            manageClients: { label: 'Gerenciar Clientes', roles: ['root', 'admin', 'user'] },
        }
    },
    root: {
        title: 'Super Admin (Root)',
        permissions: {
            manageUsers: { label: 'Gerenciar Usuários', roles: ['root', 'admin'] },
            resetUserPassword: { label: 'Resetar Senha', roles: ['root'] },
            manageBackup: { label: 'Gerenciar Backup/Restore', roles: ['root'] },
            manageTheme: { label: 'Alterar Tema do Site', roles: ['root'] },
        }
    }
};

export const getDefaultPermissions = (role) => {
    const permissions = {};
    Object.values(PERMISSION_GROUPS).forEach(group => {
        for (const key in group.permissions) {
            if (role === 'root') {
                permissions[key] = true;
            } else {
                permissions[key] = group.permissions[key].roles.includes(role);
            }
        }
    });
    return permissions;
};

const itemsPerPage = 5; // Itens por página

export const useEstoque = (currentUser, setCurrentUser) => {
    // ===================================================================
    // PRODUCTS STATE
    // ===================================================================
    const [estoque, setEstoque] = useState([]); // Inicia como um array vazio
    const [loadingEstoque, setLoadingEstoque] = useState(true); // Estado de carregamento

    const API_URL = import.meta.env.VITE_API_URL || '';

    // Helper to handle 401 responses and force logout
    const handleUnauthorized = () => {
        toast.error('Sessão expirada ou não autorizada. Por favor, faça login novamente.');
        setCurrentUser(null); // Clear current user state
        localStorage.removeItem('boycell-token'); // Clear token
        // The ProtectedRoute in App.jsx will handle the redirection to login.
    };

    // Generic function for authenticated API requests
    const makeAuthRequest = async (url, options = {}) => {
        const token = localStorage.getItem('boycell-token');
        if (!token) {
            handleUnauthorized();
            throw new Error('No authentication token found.'); // Prevent API call
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized access: Token invalid or expired.');
        }
        return response; // Return the response for further processing (e.g., .json())
    };

    // Efeito para buscar os produtos da API quando o componente montar
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingEstoque(true);
                const response = await makeAuthRequest(`${API_URL}/api/products`, { method: 'GET' });
                if (!response.ok) {
                    throw new Error('Falha ao buscar produtos do servidor');
                }
                const data = await response.json();
                // Garante que os campos numéricos sejam do tipo correto
                const parsedData = data.map(p => ({
                    ...p,
                    preco: parseFloat(String(p.preco).replace(',', '.')) || 0,
                    precoFinal: parseFloat(String(p.precoFinal).replace(',', '.')) || 0,
                    emEstoque: parseInt(p.emEstoque, 10) || 0,
                    qtdaMinima: parseInt(p.qtdaMinima, 10) || 0,
                }));
                setEstoque(parsedData);
            } catch (error) {
                console.error("Erro ao buscar produtos da API:", error);
                console.log('Info: Não foi possível carregar os produtos. Isso pode ocorrer se não houver produtos cadastrados ou por um erro de conexão.');
            } finally {
                setLoadingEstoque(false);
            }
        };
        if (currentUser) { // Only fetch if a user is logged in
            fetchProducts();
        }
    }, [currentUser]); // Depend on currentUser

    // State for stock value history
    const [stockValueHistory, setStockValueHistory] = useState(() => {
        try {
            const savedHistory = localStorage.getItem('boycell-stockValueHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error("Erro ao carregar o histórico de valor do localStorage:", error);
            return [];
        }
    });

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ nome: '', categoria: '', marca: '', fornecedor: '', emEstoque: '', qtdaMinima: '', preco: '', markup: '', precoFinal: '', imagem: '', destaque: true, is_offer: false, tempoDeGarantia: '' });

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    // ===================================================================
    // SERVICES STATE
    // ===================================================================
    const [servicos, setServicos] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(true);

    useEffect(() => {
        const fetchServicos = async () => {
            try {
                setLoadingServicos(true);
                const response = await makeAuthRequest(`${API_URL}/api/services`, { method: 'GET' });
                if (!response.ok) throw new Error('Falha ao buscar serviços do servidor');
                const data = await response.json();
                // Garante que os campos numéricos sejam do tipo correto
                const parsedData = data.map(s => ({
                    ...s,
                    preco: parseFloat(String(s.preco).replace(',', '.')) || 0,
                    precoFinal: parseFloat(String(s.precoFinal).replace(',', '.')) || 0,
                }));
                setServicos(parsedData);
            } catch (error) {
                if (error.message === 'Unauthorized access: Token invalid or expired.') return; // Already handled by makeAuthRequest
                console.error("Erro ao buscar serviços da API:", error);
                console.log('Info: Não foi possível carregar os serviços. Isso pode ocorrer se não houver serviços cadastrados ou por um erro de conexão.');
            } finally {
                setLoadingServicos(false);
            }
        };
        if (currentUser) {
            fetchServicos();
        }
    }, [currentUser]);

    const [isAddServicoModalOpen, setIsAddServicoModalOpen] = useState(false);
    const [isEditServicoModalOpen, setIsEditServicoModalOpen] = useState(false);
    const [editingServico, setEditingServico] = useState(null);
    const [newServico, setNewServico] = useState({ servico: '', fornecedor: '', marca: '', tipoReparo: '', tecnico: '', preco: '', precoFinal: '', imagem: '', markup: '', destaque: true, is_offer: false, tempoDeGarantia: '' });

    const [servicoSearchTerm, setServicoSearchTerm] = useState('');
    const [servicoSortConfig, setServicoSortConfig] = useState({ key: 'servico', direction: 'ascending' });
    const [servicoCurrentPage, setServicoCurrentPage] = useState(1);

    // ===================================================================
    // SALES HISTORY STATE
    // ===================================================================
    const [salesHistory, setSalesHistory] = useState([]);

    useEffect(() => {
        const fetchSalesHistory = async () => {
            try {
                const response = await makeAuthRequest(`${API_URL}/api/sales`, {
                    method: 'GET',
                    // Headers are added by makeAuthRequest
                });
                if (!response.ok) throw new Error('Falha ao buscar histórico de vendas.');
                const data = await response.json();
                setSalesHistory(data);
            } catch (error) {
                console.error("Erro ao buscar histórico de vendas da API:", error);
                toast.error('Não foi possível carregar o histórico de vendas.');
                if (error.message === 'Unauthorized access: Token invalid or expired.') return; // Already handled by makeAuthRequest
                setSalesHistory([]); // Limpa em caso de erro
            }
        };
        if (currentUser) { // Só busca se o usuário estiver logado
            fetchSalesHistory();
        } else {
            setSalesHistory([]); // Limpa o histórico no logout
        }
    }, [currentUser]); // Re-executa quando o usuário muda

    // ===================================================================
    // ACTIVITY LOG STATE
    // ===================================================================
    const [activityLog, setActivityLog] = useState(() => {
        try {
            const saved = localStorage.getItem('boycell-activityLog');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error) {
            console.error("Erro ao carregar o log de atividades:", error);
        }
        return [];
    });

    // ===================================================================
    // CUSTOMERS STATE
    // ===================================================================
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await makeAuthRequest(`${API_URL}/api/clients`, {
                    method: 'GET',
                    // Headers are added by makeAuthRequest
                });
                if (!response.ok) throw new Error('Falha ao buscar clientes.');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Falha ao buscar clientes.');
                }
                const data = await response.json();
                setClientes(data);
            } catch (error) {
                if (error.message === 'Unauthorized access: Token invalid or expired.') return; // Already handled by makeAuthRequest
                console.error("Erro ao buscar clientes da API:", error);
                console.log('Info: Não foi possível carregar os clientes. Isso pode ocorrer se não houver clientes cadastrados ou por um erro de conexão.');
                setClientes([]); // Limpa em caso de erro
            }
        };
        if (currentUser) { // Só busca se o usuário estiver logado
            fetchClients();
        } else {
            setClientes([]); // Limpa clientes no logout
        }
    }, [currentUser]); // Re-executa quando o usuário muda

    // ===================================================================
    // USERS STATE
    // ===================================================================
    const [users, setUsers] = useState([]); // Start with empty array

    // Effect to fetch users from API
    useEffect(() => {
        const fetchUsers = async (token) => {
            try {
                const response = await makeAuthRequest(`${API_URL}/api/users`, { method: 'GET' });
                if (!response.ok) throw new Error('Falha ao buscar usuários.');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Erro ao buscar usuários da API:", error);
                toast.error('Não foi possível carregar os usuários.');
                if (error.message === 'Unauthorized access: Token invalid or expired.') return; // Already handled by makeAuthRequest
            }
        };

        const token = localStorage.getItem('boycell-token');
        if (currentUser && token) {
            // Vendedores não precisam e não podem buscar a lista de todos os usuários.
            // Apenas usuários com permissão de gerenciar outros usuários devem buscar a lista.
            if (currentUser.permissions?.manageUsers) {
                fetchUsers(token);
            }
        }

    }, [currentUser]);

    // ===================================================================
    // BANNERS STATE
    // ===================================================================
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'root')) {
                try {
                    const response = await makeAuthRequest(`${API_URL}/api/banners/all`, { method: 'GET' });
                    if (!response.ok) throw new Error('Falha ao buscar banners.');
                    const data = await response.json();
                    setBanners(data);
                } catch (error) {
                    console.error("Erro ao buscar banners para o admin:", error);
                    toast.error('Não foi possível carregar os banners.');
                }
            }
        };
        fetchBanners();
    }, [currentUser]);

    // ===================================================================
    // EFFECTS
    // ===================================================================
    // Effect to update stock value history
    useEffect(() => {
        const newTotalValue = estoque.reduce((acc, item) => {
            const custo = parseFloat(String(item.preco).replace(',', '.')) || 0;
            return acc + (custo * (item.emEstoque || 0));
        }, 0);

        setStockValueHistory(prevHistory => {
            const lastEntry = prevHistory[prevHistory.length - 1];
            if (!lastEntry || lastEntry.value !== newTotalValue) {
                const newEntry = { date: new Date().toISOString(), value: newTotalValue };
                return [...prevHistory, newEntry].slice(-60); // Keep last 60 entries
            }
            return prevHistory;
        });
    }, [estoque]);

    // Effect to save stock value history to localStorage
    useEffect(() => {
        if (stockValueHistory.length > 0) {
            localStorage.setItem('boycell-stockValueHistory', JSON.stringify(stockValueHistory));
        }
    }, [stockValueHistory]);

    // Efeito para salvar o log de atividades
    useEffect(() => {
        try {
            localStorage.setItem('boycell-activityLog', JSON.stringify(activityLog));
        } catch (error) {
            console.error("Erro ao salvar o log de atividades:", error);
        }
    }, [activityLog]);

    // Helper function to log admin actions
    const logAdminActivity = (adminName, action, details) => {
        const newLogEntry = {
            id: Date.now(),
            timestamp: new Date(),
            admin: adminName || 'Sistema',
            action: action,
            details: details,
        };
        setActivityLog(prevLog => [newLogEntry, ...prevLog].slice(0, 500)); // Keep last 500 entries
    };

    // ===================================================================
    // PRODUCT HANDLERS
    // ===================================================================
    // Modal handlers
    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setNewProduct({ nome: '', categoria: '', marca: '', fornecedor: '', emEstoque: '', qtdaMinima: '', preco: '', markup: '', precoFinal: '', imagem: '', destaque: true, is_offer: false, tempoDeGarantia: '' });
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct({ ...product, markup: product.markup || '', imagem: product.imagem || '', historico: product.historico || [], categoria: product.categoria || '', destaque: product.destaque ?? false, is_offer: product.is_offer ?? false, tempoDeGarantia: product.tempoDeGarantia || '' });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    // Generic form input handler for both new and editing items
    const handleItemChange = (e, stateSetter) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file' && files && files[0]) {
            const file = files[0];
            const compressAndSetImage = async () => {
                const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
                try {
                    const compressedFile = await imageCompression(file, options);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        stateSetter(prevState => ({ ...prevState, imagem: reader.result }));
                    };
                    reader.readAsDataURL(compressedFile);
                } catch (error) {
                    console.error('Erro ao comprimir imagem:', error);
                    toast.error('Falha ao processar a imagem. Tente uma imagem menor ou de outro formato.');
                }
            };
            compressAndSetImage();
            return;
        }

        stateSetter(prevState => {
            const isCheckbox = type === 'checkbox';
            const updatedValue = isCheckbox ? checked : value;
            
            const newState = { ...prevState, [name]: updatedValue };
            
            if (name === 'precoFinal') {
                newState.markup = '';
            }

            if (['preco', 'markup'].includes(name)) {
                const preco = parseFloat(newState.preco);
                const markup = parseFloat(newState.markup);

                if (!isNaN(preco) && !isNaN(markup) && markup >= 0) {
                    let precoFinal = preco * (1 + markup / 100);
                    newState.precoFinal = Math.round(precoFinal * 100) / 100;
                }
            }
            return newState;
        });
    };