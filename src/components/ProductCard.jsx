import React from 'react';

const ProductCard = ({ product, onComprarClick }) => (
  <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group">
    <div className="relative overflow-hidden rounded-t-lg">
      <img 
        src={product.image || 'https://via.placeholder.com/300'} 
        alt={product.name} 
        className="w-full h-56 object-cover aspect-square group-hover:scale-105 transition-transform duration-300" 
      />
    </div>
    <div className="p-4 flex-grow flex flex-col">
      <h3 className="text-md font-semibold mb-2 flex-grow text-gray-800 dark:text-white">{product.name}</h3>
      {product.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{product.description}</p>
      )}
      <div className="mt-auto pt-4">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        <button onClick={() => onComprarClick(product)} className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
          Consultar
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;