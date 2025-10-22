import React, { createContext, useContext } from 'react';
import { useEstoque } from './useEstoque.jsx';

const EstoqueContext = createContext(null);

export const useEstoqueContext = () => {
    const context = useContext(EstoqueContext);
    if (!context) {
        throw new Error('useEstoqueContext deve ser usado dentro de um EstoqueProvider');
    }
    return context;
};

export const EstoqueProvider = ({ children, currentUser, setCurrentUser }) => {
    const estoqueData = useEstoque(currentUser, setCurrentUser);
    return <EstoqueContext.Provider value={estoqueData}>{children}</EstoqueContext.Provider>;
};