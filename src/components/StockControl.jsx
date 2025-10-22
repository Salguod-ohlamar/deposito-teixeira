import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, PlusCircle, Search, Edit, FileDown, Printer, History, Trash2, ShoppingCart, Settings, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Modal from './Modal.jsx';
import { useTheme } from './ThemeContext.jsx';
import { useEstoqueContext } from './EstoqueContext.jsx';
import DataTable from './DataTable.jsx';
import { categories } from '../HomePage.jsx';

// ===================================================================
// DEFINIÇÃO DAS COLUNAS DA TABELA
// ===================================================================
const fallbackInitialColumns = [
  { id: 'imagem', label: 'Imagem', sortable: false, align: 'left', printable: false },
  { id: 'nome', label: 'Produto', sortable: true, align: 'left' },
  { id: 'categoria', label: 'Categoria', sortable: true, align: 'left' },
  { id: 'marca', label: 'Marca', sortable: true, align: 'left' },
  { id: 'fornecedor', label: 'Fornecedor', sortable: true, align: 'left' },
  { id: 'emEstoque', label: 'Em Estoque', sortable: true, align: 'left' },
  { id: 'qtdaMinima', label: 'Qtda. Mínima', sortable: true, align: 'left' },
  { id: 'tempoDeGarantia', label: 'Garantia (dias)', sortable: true, align: 'left' },
  { id: 'preco', label: 'Preço', sortable: true, align: 'left' },
  { id: 'precoFinal', label: 'Preço Final', sortable: true, align: 'left', printable: false },
  { id: 'acoes', label: 'Ações', sortable: false, align: 'right', printable: false },
];

const servicosFallbackColumns = [
  { id: 'imagem', label: 'Imagem', sortable: false, align: 'left' },
  { id: 'servico', label: 'Serviço', sortable: true, align: 'left' },
  { id: 'fornecedor', label: 'Fornecedor', sortable: true, align: 'left' },
  { id: 'marca', label: 'Marca', sortable: true, align: 'left' },
  { id: 'tipoReparo', label: 'Tipo de Reparo', sortable: true, align: 'left' },
  { id: 'tecnico', label: 'Técnico', sortable: true, align: 'left' },
  { id: 'tempoDeGarantia', label: 'Garantia (dias)', sortable: true, align: 'left' },
  { id: 'preco', label: 'Preço', sortable: true, align: 'left' },
  { id: 'precoFinal', label: 'Preço Final', sortable: true, align: 'left' },
  { id: 'acoes', label: 'Ações', sortable: false, align: 'right' },
];

// ===================================================================
// PÁGINA DE CONTROLE DE ESTOQUE
// ===================================================================
const StockControl = ({ onLogout, currentUser }) => {
  const {
    paginatedEstoque,
    sortConfig,
    handleSort,
    handleExcluirProduto,
    searchTerm,
    setSearchTerm,
    showLowStockOnly,
    setShowLowStockOnly,
    currentPage,
    setCurrentPage,
    totalPages,
    isAddModalOpen,
    handleOpenAddModal,
    handleCloseAddModal,
    newProduct,
    handleInputChange,
    handleAddProduct,
    isEditModalOpen,
    handleOpenEditModal,
    handleCloseEditModal,
    editingProduct,
    handleEditInputChange,
    handleUpdateProduct,
    handleExportCSV,
    lowStockItems,
    paginatedServicos,
    servicoSortConfig,
    handleServicoSort,
    handleExcluirServico,
    servicoSearchTerm,
    setServicoSearchTerm,
    servicoCurrentPage,
    setServicoCurrentPage,
    totalServicoPages,
    isAddServicoModalOpen,
    handleOpenAddServicoModal,
    handleCloseAddServicoModal,
    newServico,
    isEditServicoModalOpen,
    handleOpenEditServicoModal,
    handleCloseEditServicoModal,
    editingServico,
    handleServicoInputChange,
    handleAddServico,
    handleUpdateServico,
    hasAdminAccessPermission,
  } = useEstoqueContext();

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  // ===================================================================
  // STATE & REFS
  // ===================================================================
  // Modal States
  const [isServiceHistoryModalOpen, setIsServiceHistoryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Data States
  const [viewingServiceHistory, setViewingServiceHistory] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);

  // UI, Filter & Config States
  const [columns, setColumns] = useState(() => {
    try {
      const savedColumns = localStorage.getItem('boycell-columns');
      return savedColumns ? JSON.parse(savedColumns) : fallbackInitialColumns;
    } catch (error) {
      console.error("Failed to parse columns from localStorage", error);
      return fallbackInitialColumns;
    }
  });
  const [servicosColumns, setServicosColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('boycell-servicos-columns');
      return saved ? JSON.parse(saved) : servicosFallbackColumns;
    } catch (error) {
      console.error("Failed to parse servicos columns from localStorage", error);
      return servicosFallbackColumns;
    }
  });

  useEffect(() => {
    localStorage.setItem('boycell-columns', JSON.stringify(columns));
  }, [columns]);
  useEffect(() => {
    localStorage.setItem('boycell-servicos-columns', JSON.stringify(servicosColumns));
  }, [servicosColumns]);
  useEffect(() => {
    const afterPrint = () => {
      document.body.classList.remove('print-mode-recibo');
      document.body.classList.remove('print-mode-compra-imediata');
    };
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  // ===================================================================
  // HANDLERS & HELPER FUNCTIONS
  // ===================================================================
  const handleOpenServiceHistoryModal = (service) => {
    setViewingServiceHistory(service);
    setIsServiceHistoryModalOpen(true);
  };

  const handleCloseServiceHistoryModal = () => {
    setIsServiceHistoryModalOpen(false);
    setViewingServiceHistory(null);
  };

  const handleAddNewServico = async (e) => {
    e.preventDefault();
    if (!newServico.servico || !newServico.fornecedor || !newServico.marca || !newServico.tipoReparo || !newServico.tecnico || !newServico.preco || !newServico.precoFinal) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    await handleAddServico(e, currentUser.name);
  };
  const handlePrintCompraImediata = () => {
    document.body.classList.add('print-mode-compra-imediata');
    window.print();
  };
  const handleOpenHistoryModal = (product) => {
    setViewingHistory(product);
    setIsHistoryModalOpen(true);
  };
  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setViewingHistory(null);
  };

  const actionButtonClasses = "w-full inline-flex items-center justify-start gap-3 px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-300 text-sm";

  const renderProductRow = (item, currentColumns) => {
    const isLowStock = item.emEstoque <= item.qtdaMinima;
    return (
      <tr 
        key={item.id}
        className={`border-b border-gray-200 dark:border-gray-800 transition-colors ${isLowStock ? 'bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-950/60' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
      >
        {currentColumns.map(col => {
          switch (col.id) {
            case 'imagem':
              return <td key={col.id} className={`p-2 printable-hidden text-${col.align}`}><img src={item.imagem || 'https://via.placeholder.com/40'} alt={item.nome} className="w-12 h-12 object-cover rounded-md bg-gray-200 dark:bg-gray-700" /></td>;
            case 'nome':
              return <td key={col.id} className={`p-4 font-medium text-${col.align}`}>{item.nome}</td>;
            case 'emEstoque':
              return <td key={col.id} className={`p-4 font-semibold text-${col.align} ${isLowStock ? 'text-red-500 dark:text-red-400' : ''}`}>{item.emEstoque}</td>;
            case 'preco':
              return <td key={col.id} className={`p-4 text-${col.align}`}>{item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>;
            case 'precoFinal':
              return <td key={col.id} className={`p-4 text-${col.align} ${col.printable === false ? 'printable-hidden' : ''}`}>{item.precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>;
            case 'acoes':
              return (
                <td key={col.id} className={`p-4 text-${col.align} printable-hidden`}>
                  <div className="flex items-center justify-end gap-4">
                    {currentUser.permissions?.viewProductHistory && (<button onClick={() => handleOpenHistoryModal(item)} className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors" title="Ver Histórico"><History size={18} /></button>)}
                    {currentUser.permissions?.editProduct && (<button onClick={() => handleOpenEditModal(item)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors" title="Editar Produto"><Edit size={18} /></button>)}
                    {currentUser.permissions?.deleteProduct && (<button onClick={() => handleExcluirProduto(item.id, currentUser.name)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" title="Excluir Produto"><Trash2 size={18} /></button>)}
                  </div>
                </td>
              );
            default:
              return <td key={col.id} className={`p-4 text-${col.align} ${col.printable === false ? 'printable-hidden' : ''}`}>{item[col.id]}</td>;
          }
        })}
      </tr>
    );
  };

  const renderServiceRow = (item, currentColumns) => (
    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
        {currentColumns.map(col => {
            switch (col.id) {
                case 'imagem':
                    return <td key={col.id} className={`p-2 text-${col.align}`}><img src={item.imagem || 'https://via.placeholder.com/40'} alt={item.servico} className="w-12 h-12 object-cover rounded-md bg-gray-200 dark:bg-gray-700" /></td>;
                case 'preco':
                    return <td key={col.id} className={`p-4 text-${col.align}`}>{item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>;
                case 'precoFinal':
                    return <td key={col.id} className={`p-4 text-${col.align}`}>{item.precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>;
                case 'servico':
                    return <td key={col.id} className={`p-4 font-medium text-${col.align}`}>{item.servico}</td>;
                case 'acoes':
                    return (
                        <td key={col.id} className={`p-4 text-${col.align}`}>
                            <div className="flex items-center justify-end gap-4">
                                {currentUser.permissions?.viewServiceHistory && (<button onClick={() => handleOpenServiceHistoryModal(item)} className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors" title="Ver Histórico"><History size={18} /></button>)}
                                {currentUser.permissions?.editService && (<button onClick={() => handleOpenEditServicoModal(item)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors" title="Editar Serviço"><Edit size={18} /></button>)}
                                {currentUser.permissions?.deleteService && (<button onClick={() => handleExcluirServico(item.id, currentUser.name)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" title="Excluir Serviço"><Trash2 size={18} /></button>)}
                            </div>
                        </td>
                    );
                default:
                    return <td key={col.id} className={`p-4 text-${col.align}`}>{item[col.id]}</td>;
            }
        })}
    </tr>
  );

  // ===================================================================
  // RENDER
  // ===================================================================
  return (
    <div className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans leading-relaxed">
      <Toaster position="top-right" toastOptions={{ className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white', style: { background: 'transparent', boxShadow: 'none' } }} />
      <div id="compra-imediata-printable" className="p-8 bg-white text-black hidden">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold">COMPRA IMEDIATA</h1>
          <div className="w-48 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500">
            <p className="text-sm">Espaço para Logo</p>
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black">
            <tr>
              {columns.filter(c => c.printable !== false && c.id !== 'precoFinal').map(col => (
                <th key={col.id} className="p-2 font-bold">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map(item => (
              <tr key={item.id} className="border-b border-gray-200">
                {columns.filter(c => c.printable !== false && c.id !== 'precoFinal').map(col => <td key={col.id} className="p-2">{item[col.id]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <header className="sticky top-0 z-50 bg-red-700 dark:bg-red-800/90 backdrop-blur-sm border-b border-red-800 dark:border-red-900">
          <nav className="container mx-auto flex items-center justify-between p-4">
              <h1 className="text-xl lg:text-2xl font-bold tracking-wider text-white">Olá, {currentUser?.name?.split(' ')[0] || 'Usuário'}!</h1>
              <div className="flex items-center gap-2 md:gap-4">
                  <button onClick={() => navigate('/vendas')} className="inline-flex items-center gap-2 text-white hover:bg-white/20 p-2 rounded-md transition-colors" title="Página de Vendas">
                      <ShoppingCart size={20} />
                      <span className="hidden sm:inline">Página de Vendas</span>
                  </button>
                  <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white hover:bg-white/20 p-2 rounded-md transition-colors" title="Ver Site">
                      <ArrowLeft size={20} />
                      <span className="hidden sm:inline">Ver Site</span>
                  </a>
                  {hasAdminAccessPermission && (
                      <button onClick={() => navigate('/admin')} className="inline-flex items-center gap-2 text-white hover:bg-white/20 p-2 rounded-md transition-colors" title="Painel de Administração">
                          <Settings size={20} />
                          
                          <span className="hidden sm:inline">Administração</span>
                      </button>
                  )}
                  <button onClick={onLogout} className="inline-flex items-center gap-2 text-white hover:bg-white/20 p-2 rounded-md transition-colors" title="Sair">
                      <LogOut size={20} />
                      <span className="hidden sm:inline">Sair</span>
                  </button>
              </div>
          </nav>
      </header>

      <main id="estoque-non-printable-area" className="container mx-auto px-4 py-8 md:py-12">
        {/* Painéis de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Painel de Produtos */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border-t-4 border-red-600">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">Produtos</h3>
                <div className="flex flex-col gap-3">
                    {currentUser.permissions?.addProduct && (
                        <button onClick={handleOpenAddModal} className={actionButtonClasses}>
                            <PlusCircle size={18} /> Adicionar Produto
                        </button>
                    )}
                    {currentUser.permissions?.exportCsv && (
                        <button onClick={handleExportCSV} className={actionButtonClasses}>
                            <FileDown size={18} /> Exportar CSV de Produtos
                        </button>
                    )}
                    <button onClick={handlePrintCompraImediata} className={actionButtonClasses}>
                        <Printer size={18} /> Imprimir Lista de Compra
                    </button>
                </div>
            </div>

            {/* Painel de Serviços */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border-t-4 border-red-600">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">Serviços</h3>
                <div className="flex flex-col gap-3">
                    {currentUser.permissions?.addService && (
                        <button onClick={handleOpenAddServicoModal} className={actionButtonClasses}>
                            <PlusCircle size={18} /> Adicionar Serviço
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Card principal que contém a tabela */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500">Produtos Cadastrados</h2>
          </div>

          {/* Barra de Busca */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={20} className="text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Buscar produto..."
                className="w-full p-3 pl-10 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Mostrar apenas estoque baixo</span>
            </label>
          </div>

          {/* Tabela de produtos */}
          <DataTable
            columns={columns}
            data={paginatedEstoque}
            sortConfig={sortConfig}
            onSort={handleSort}
            renderRow={renderProductRow}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onColumnOrderChange={setColumns}
            noResultsMessage="Nenhum produto encontrado."
          />
        </div>
      </main>

      {/* Seção de Serviços - Removido o <main> extra e ajustado o padding */}
      <div className="container mx-auto px-4 pb-8 md:pb-16">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500">Serviços Cadastrados</h2>
            </div>

            {/* Barra de Busca para Serviços */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={20} className="text-gray-500" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar serviço..."
                        className="w-full p-3 pl-10 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={servicoSearchTerm}
                        onChange={(e) => setServicoSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de Serviços */}
            <DataTable
              columns={servicosColumns}
              data={paginatedServicos}
              sortConfig={servicoSortConfig}
              onSort={handleServicoSort}
              renderRow={renderServiceRow}
              currentPage={servicoCurrentPage}
              totalPages={totalServicoPages}
              onPageChange={setServicoCurrentPage}
              onColumnOrderChange={setServicosColumns}
              noResultsMessage="Nenhum serviço encontrado."
            />
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}
      {/* Modal para Histórico do Produto */}
      <Modal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal}>
        {viewingHistory && (
          <>
            <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-500 mb-2">Histórico de Alterações</h2>
            <p className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-6">{viewingHistory.nome}</p>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
              {viewingHistory.historico && viewingHistory.historico.length > 0 ? (
                [...viewingHistory.historico].reverse().map((entry, index) => ( 
                  <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-red-500">
                    <div className="flex justify-between items-center mb-1"> 
                      <p className="text-md font-bold text-red-600 dark:text-red-400">{entry.acao}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.data).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{entry.detalhes.replaceAll('; ', '\n')}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhum histórico encontrado para este produto.</p>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Modal para Adicionar Novo Produto */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal}>
        <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-500 mb-6">Adicionar Novo Produto</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4" onSubmit={(e) => handleAddProduct(e, currentUser.name)}>
            <div className="md:col-span-3">
                <label htmlFor="add-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
                <input id="add-nome" name="nome" type="text" value={newProduct.nome} onChange={handleInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
                <label htmlFor="add-categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select
                    id="add-categoria"
                    name="categoria"
                    value={newProduct.categoria}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (<option key={cat.name} value={cat.name}>{cat.name}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="add-marca" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                <input id="add-marca" name="marca" type="text" value={newProduct.marca} onChange={handleInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
                <label htmlFor="add-fornecedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
                <input id="add-fornecedor" name="fornecedor" type="text" value={newProduct.fornecedor} onChange={handleInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
                <label htmlFor="add-emEstoque" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Em Estoque</label>
                <input id="add-emEstoque" name="emEstoque" type="number" value={newProduct.emEstoque} onChange={handleInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
                <label htmlFor="add-qtdaMinima" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qtda. Mínima</label>
                <input id="add-qtdaMinima" name="qtdaMinima" type="number" value={newProduct.qtdaMinima} onChange={handleInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
                <label htmlFor="add-tempoDeGarantia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Garantia (dias)</label>
                <input id="add-tempoDeGarantia" name="tempoDeGarantia" type="number" value={newProduct.tempoDeGarantia} onChange={handleInputChange} placeholder="Ex: 30" className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="md:col-span-4">
                <label htmlFor="add-imagem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagem</label>
                <input id="add-imagem" name="imagem" type="file" accept="image/*" onChange={handleInputChange} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
                {newProduct.imagem && <img src={newProduct.imagem} alt="Pré-visualização" className="mt-4 w-24 h-24 object-cover rounded-lg shadow-md" />}
            </div>
            <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <label htmlFor="add-destaque" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input id="add-destaque" name="destaque" type="checkbox" checked={newProduct.destaque} onChange={handleInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
                    Mostrar produto na página inicial
                </label>
            </div>
            <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <label htmlFor="add-is_offer" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input id="add-is_offer" name="is_offer" type="checkbox" checked={newProduct.is_offer} onChange={handleInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
                    Marcar como Oferta
                </label>
            </div>
            <hr className="md:col-span-4 border-gray-300 dark:border-gray-700 my-2" />
            <div>
                <label htmlFor="add-preco" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço de Custo</label>
                <input id="add-preco" name="preco" type="number" step="0.01" value={newProduct.preco} onChange={handleInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 50.00" />
            </div>
            <div>
                <label htmlFor="add-markup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Markup (%)</label>
                <input id="add-markup" name="markup" type="number" step="0.01" placeholder="Ex: 25" value={newProduct.markup} onChange={handleInputChange} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
                <label htmlFor="add-precoFinal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço Final (Venda)</label>
                <input id="add-precoFinal" name="precoFinal" type="number" step="0.01" value={newProduct.precoFinal} onChange={handleInputChange} required disabled={!!newProduct.markup} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed" />
            </div>
            <button type="submit" className="w-full md:col-span-4 mt-4 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300">
                Salvar Produto
            </button>
        </form>
      </Modal>

      {/* Modal para Editar Produto */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
        <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-500 mb-6">Editar Produto</h2>
        {editingProduct && (
            <form className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4" onSubmit={(e) => handleUpdateProduct(e, currentUser.name)}>
                <div className="md:col-span-3">
                    <label htmlFor="edit-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
                    <input id="edit-nome" name="nome" type="text" value={editingProduct.nome} onChange={handleEditInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="edit-categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                    <select
                        id="edit-categoria"
                        name="categoria"
                        value={editingProduct.categoria}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(cat => (<option key={cat.name} value={cat.name}>{cat.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="edit-marca" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                    <input id="edit-marca" name="marca" type="text" value={editingProduct.marca} onChange={handleEditInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="edit-fornecedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
                    <input id="edit-fornecedor" name="fornecedor" type="text" value={editingProduct.fornecedor} onChange={handleEditInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="edit-emEstoque" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Em Estoque</label>
                    <input id="edit-emEstoque" name="emEstoque" type="number" value={editingProduct.emEstoque} onChange={handleEditInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="edit-qtdaMinima" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qtda. Mínima</label>
                    <input id="edit-qtdaMinima" name="qtdaMinima" type="number" value={editingProduct.qtdaMinima} onChange={handleEditInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="edit-tempoDeGarantia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Garantia (dias)</label>
                    <input id="edit-tempoDeGarantia" name="tempoDeGarantia" type="number" value={editingProduct.tempoDeGarantia} onChange={handleEditInputChange} placeholder="Ex: 30" className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="edit-imagem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagem</label>
                    <input id="edit-imagem" name="imagem" type="file" accept="image/*" onChange={handleEditInputChange} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
                    {editingProduct.imagem && <img src={editingProduct.imagem} alt="Pré-visualização" className="mt-4 w-24 h-24 object-cover rounded-lg shadow-md" />}
                </div>
                <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                    <label htmlFor="edit-destaque" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input id="edit-destaque" name="destaque" type="checkbox" checked={editingProduct.destaque} onChange={handleEditInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
                        Mostrar produto na página inicial
                    </label>
                </div>
                 <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                    <label htmlFor="edit-is_offer" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input id="edit-is_offer" name="is_offer" type="checkbox" checked={editingProduct.is_offer} onChange={handleEditInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
                        Marcar como Oferta
                    </label>
                </div>
                <hr className="md:col-span-4 border-gray-300 dark:border-gray-700 my-2" />
                <div>
                    <label htmlFor="edit-preco" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço de Custo</label>
                    <input id="edit-preco" name="preco" type="number" step="0.01" value={editingProduct.preco} onChange={handleEditInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 50.00" />
                </div>
                <div>
                    <label htmlFor="edit-markup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Markup (%)</label>
                    <input id="edit-markup" name="markup" type="number" step="0.01" placeholder="Ex: 25" value={editingProduct.markup} onChange={handleEditInputChange} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                    <label htmlFor="edit-precoFinal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço Final (Venda)</label>
                    <input id="edit-precoFinal" name="precoFinal" type="number" step="0.01" value={editingProduct.precoFinal} onChange={handleEditInputChange} required disabled={!!editingProduct.markup} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed" />
                </div>
                <button type="submit" className="w-full md:col-span-4 mt-4 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300">
                    Salvar Alterações
                </button>
            </form>
        )}
      </Modal>

      {/* Modal para Adicionar Novo Serviço */}
      <Modal isOpen={isAddServicoModalOpen} onClose={handleCloseAddServicoModal}>
        <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-500 mb-6">Adicionar Novo Serviço</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4" onSubmit={handleAddNewServico}>
          <div className="md:col-span-3">
            <label htmlFor="servico-add-servico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Serviço</label>
            <input id="servico-add-servico" name="servico" type="text" value={newServico.servico} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label htmlFor="servico-add-fornecedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor (Peças)</label>
            <input id="servico-add-fornecedor" name="fornecedor" type="text" value={newServico.fornecedor} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label htmlFor="servico-add-marca" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca do Aparelho</label>
            <input id="servico-add-marca" name="marca" type="text" value={newServico.marca} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label htmlFor="servico-add-tipoReparo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Reparo</label>
            <input id="servico-add-tipoReparo" name="tipoReparo" type="text" value={newServico.tipoReparo} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label htmlFor="servico-add-tecnico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Técnico Responsável</label>
            <input id="servico-add-tecnico" name="tecnico" type="text" value={newServico.tecnico} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label htmlFor="servico-add-garantia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Garantia (dias)</label>
            <input id="servico-add-garantia" name="tempoDeGarantia" type="number" value={newServico.tempoDeGarantia} onChange={handleServicoInputChange} placeholder="Ex: 90" className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="md:col-span-4">
            <label htmlFor="servico-add-imagem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagem</label>
            <input id="servico-add-imagem" name="imagem" type="file" accept="image/*" onChange={handleServicoInputChange} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
            {newServico.imagem && <img src={newServico.imagem} alt="Pré-visualização" className="mt-4 w-24 h-24 object-cover rounded-lg shadow-md" />}
          </div>
           <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
            <label htmlFor="servico-destaque" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              <input id="servico-destaque" name="destaque" type="checkbox" checked={newServico.destaque} onChange={handleServicoInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
              Mostrar serviço na página inicial
            </label>
           </div>
           <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
             <label htmlFor="servico-is_offer" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
               <input id="servico-is_offer" name="is_offer" type="checkbox" checked={newServico.is_offer} onChange={handleServicoInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
               Marcar como Oferta
             </label>
          </div>
          <hr className="md:col-span-4 border-gray-300 dark:border-gray-700 my-2" />
          <div>
            <label htmlFor="servico-add-preco" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço de Custo</label>
            <input id="servico-add-preco" name="preco" type="number" step="0.01" value={newServico.preco} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 300.00" />
          </div>
          <div>
            <label htmlFor="servico-add-markup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Markup (%)</label>
            <input id="servico-add-markup" name="markup" type="number" step="0.01" placeholder="Ex: 100" value={newServico.markup} onChange={handleServicoInputChange} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label htmlFor="servico-add-precoFinal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço Final (Cobrado)</label>
            <input id="servico-add-precoFinal" name="precoFinal" type="number" step="0.01" value={newServico.precoFinal} onChange={handleServicoInputChange} required disabled={!!newServico.markup} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed" />
          </div>
          <button type="submit" className="w-full md:col-span-4 mt-4 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300">
            Salvar Serviço
          </button>
        </form>
      </Modal>

      {/* Modal para Editar Serviço */}
      <Modal isOpen={isEditServicoModalOpen} onClose={handleCloseEditServicoModal}>
        <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-500 mb-6">Editar Serviço</h2>
        {editingServico && (
          <form className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4" onSubmit={(e) => handleUpdateServico(e, currentUser.name)}>
            <div className="md:col-span-3">
              <label htmlFor="servico-edit-servico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Serviço</label>
              <input id="servico-edit-servico" name="servico" type="text" value={editingServico.servico} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label htmlFor="servico-edit-fornecedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor (Peças)</label>
              <input id="servico-edit-fornecedor" name="fornecedor" type="text" value={editingServico.fornecedor} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label htmlFor="servico-edit-marca" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca do Aparelho</label>
              <input id="servico-edit-marca" name="marca" type="text" value={editingServico.marca} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label htmlFor="servico-edit-tipoReparo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Reparo</label>
              <input id="servico-edit-tipoReparo" name="tipoReparo" type="text" value={editingServico.tipoReparo} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label htmlFor="servico-edit-tecnico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Técnico Responsável</label>
              <input id="servico-edit-tecnico" name="tecnico" type="text" value={editingServico.tecnico} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label htmlFor="servico-edit-garantia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Garantia (dias)</label>
              <input id="servico-edit-garantia" name="tempoDeGarantia" type="number" value={editingServico.tempoDeGarantia} onChange={handleServicoInputChange} placeholder="Ex: 90" className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="md:col-span-4">
              <label htmlFor="servico-edit-imagem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagem</label>
              <input id="servico-edit-imagem" name="imagem" type="file" accept="image/*" onChange={handleServicoInputChange} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
              {editingServico.imagem && <img src={editingServico.imagem} alt="Pré-visualização" className="mt-4 w-24 h-24 object-cover rounded-lg shadow-md" />}
            </div>
             <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
              <label htmlFor="servico-edit-destaque" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                <input id="servico-edit-destaque" name="destaque" type="checkbox" checked={editingServico.destaque} onChange={handleServicoInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
                Mostrar serviço na página inicial
              </label>
             </div>
             <div className="md:col-span-2 flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
               <label htmlFor="servico-edit-is_offer" className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                 <input id="servico-edit-is_offer" name="is_offer" type="checkbox" checked={editingServico.is_offer} onChange={handleServicoInputChange} className="form-checkbox h-5 w-5 text-red-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-red-500" />
                 Marcar como Oferta
               </label>
            </div>
            <hr className="md:col-span-4 border-gray-300 dark:border-gray-700 my-2" />
            <div>
              <label htmlFor="servico-edit-preco" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço de Custo</label>
              <input id="servico-edit-preco" name="preco" type="number" step="0.01" value={editingServico.preco} onChange={handleServicoInputChange} required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 300.00" />
            </div>
            <div>
              <label htmlFor="servico-edit-markup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Markup (%)</label>
              <input id="servico-edit-markup" name="markup" type="number" step="0.01" placeholder="Ex: 100" value={editingServico.markup} onChange={handleServicoInputChange} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="servico-edit-precoFinal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço Final (Cobrado)</label>
              <input id="servico-edit-precoFinal" name="precoFinal" type="number" step="0.01" value={editingServico.precoFinal} onChange={handleServicoInputChange} required disabled={!!editingServico.markup} className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed" />
            </div>
            <button type="submit" className="w-full md:col-span-4 mt-4 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300">
              Salvar Alterações
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StockControl;
