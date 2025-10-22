//HomePge.jsx

import React, { useState, useEffect } from 'react';
import { User, Menu, X, Phone, MapPin, MessageCircle } from 'lucide-react';

import Button from './components/Button.jsx';
import ProductCard from './components/ProductCard.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import BannerCarousel from './components/BannerCarousel.jsx';
import Modal from './components/Modal.jsx'; 
import LocationMap from './LocationMap.jsx';

// Importando os logotipos da pasta 'src/image/'
import tigreLogo from './image/tigre.png';
import amancoLogo from './image/amanco.png';
import elginLogo from './image/elgin.png';
import oroluxLogo from './image/orolux.png';
import votoranLogo from './image/votorantim.png';
import caueLogo from './image/caue.png';


//Import do logo das categorias
import tintas from './image/pintura.jpg';
import ferramentas from './image/ferramentas.jpg';
import eletrica from './image/eletrica.jpg';
import hidraulica from './image/hidraulicai.jpg';
// --- Componentes de UI específicos para a nova Home ---

/**
 * Barra superior com informações de contato e localização.
 */
const TopBar = () => (
    <div className="bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
        <div className="container mx-auto flex justify-center md:justify-between items-center px-4 py-1">
            <div className="flex items-center space-x-4">
                <a href="tel:551100000000" className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"><Phone size={14} className="mr-1" /> (11) 0000-0000</a>
                <a href="https://wa.me/5511941341795" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"><MessageCircle size={14} className="mr-1" /> WhatsApp</a>
            </div>
            <div className="hidden md:flex items-center">
                <a href="#localizacao" className="flex items-center hover:text-gray-900 dark:hover:text-white"><MapPin size={14} className="mr-1" /> Nossas Lojas</a>
            </div>
        </div>
    </div>
);

export const categories = [
    { name: 'Pisos e Revestimentos', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80' },
    { name: 'Banheiros e Cozinhas', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80' },
    { name: 'Tintas e Acessórios', img: tintas },
    { name: 'Elétrica e Iluminação', img: eletrica },
    { name: 'Hidráulica', img: hidraulica },
    { name: 'Ferramentas', img: ferramentas },
];

/**
 * Grade de categorias de produtos com imagens e links.
 */
const  CategoryGrid = ({ onCategoryClick }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
                <button 
                    key={cat.name} 
                    onClick={() => onCategoryClick(cat.name)}
                    className="group block text-center p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
                >
                    <div className="overflow-hidden rounded-lg">
                        <img src={cat.img} alt={cat.name} className="w-full h-48 object-cover transition-transform duration-300" />
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{cat.name}</h3>
                </button>
            ))}
        </div>
    );
};

/**
 * Seção que exibe os logotipos das marcas parceiras.
 */
const BrandsSection = () => {
    const brands = [
        tigreLogo,
        amancoLogo,        
        oroluxLogo,       
        caueLogo,
    ];

    return (
        <div className="bg-gray-100 dark:bg-gray-900 py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">As melhores marcas</h2>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    {brands.map((logo, index) => (
                        <img key={index} src={logo} alt={`Marca ${index + 1}`} className="h-10 md:h-12 object-contain grayscale opacity-70 transition-opacity" />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Fim dos Componentes de UI ---

/**
 * Componente principal da página inicial.
 * Gerencia o estado da página, busca dados de produtos e banners, e renderiza as seções.
 * @param {object} props - Propriedades do componente.
 * @param {Function} props.onLoginClick - Função a ser chamada quando o botão de login é clicado.
 */
const HomePage = ({ onLoginClick }) => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [offerProducts, setOfferProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [viewingCategory, setViewingCategory] = useState(null);
    const [productsForModal, setProductsForModal] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || '';

    /**
     * Efeito para carregar os dados iniciais da página (banners e produtos) da API.
     */
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch banners
                const bannersResponse = await fetch(`${API_URL}/api/banners`);
                if (bannersResponse.ok) setBanners(await bannersResponse.json());

                // Fetch products
                const productsResponse = await fetch(`${API_URL}/api/products`);
                if (!productsResponse.ok) throw new Error('Falha ao buscar produtos.');
                const products = await productsResponse.json();

                const servicesResponse = await fetch(`${API_URL}/api/services`);
                if (!servicesResponse.ok) throw new Error('Falha ao buscar serviços.');
                const services = await servicesResponse.json();

                setAllProducts(products);

                const allItems = [...products.map(p => ({...p, type: 'produto'})), ...services.map(s => ({...s, type: 'serviço'}))];
                const offers = allItems.filter(item => item.is_offer);
                setOfferProducts(offers);
                
            } catch (error) {
                console.error("Erro ao carregar dados da página inicial:", error);
                setFeaturedProducts([]);
                setBanners([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    /**
     * Manipulador para o clique no botão "Comprar", que abre o WhatsApp com uma mensagem pré-definida.
     * @param {object} item - O produto ou serviço a ser comprado.
     */
    const handleComprarClick = (item) => {
        const phoneNumber = "5511941341795"; // Substitua pelo seu número
        const itemName = item.name || item.servico;
        const itemPrice = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const message = `Olá, Teixeira! Tenho interesse no produto "${itemName}" (cód: ${item.id}) no valor de ${itemPrice}. Ele está disponível?`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleCategoryClick = (categoryName) => {
        const productsInCategory = allProducts.filter(p => p.categoria === categoryName);
        setProductsForModal(productsInCategory);
        setViewingCategory(categoryName);
        setIsCategoryModalOpen(true);
    };
    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
    };
    
    return (
        <div className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans leading-relaxed">
            <header className="sticky top-0 z-50 bg-red-700 dark:bg-red-800/90 backdrop-blur-sm border-b border-red-800 dark:border-red-900">
                {/* <TopBar /> */}
                <div className="container mx-auto flex items-center justify-between p-4 gap-4">
                    <div className="text-xl lg:text-2xl font-bold tracking-wider text-white whitespace-nowrap"><a href="/">Teixeira Depósito de Materiais</a></div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <Button variant="ghost" size="icon" onClick={onLoginClick} aria-label="Acessar conta" className="hidden md:flex text-white hover:bg-white/20">
                            <User size={24} className="text-white" />
                        </Button>
                        <div className="lg:hidden">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menu"><Menu size={24} /></Button>
                        </div>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-gray-950/95 lg:hidden animate-fade-in">
                    <div className="container mx-auto p-4">
                        <div className="flex justify-between items-center">
                            <div className="text-xl font-bold tracking-wider text-gray-900 dark:text-white">Teixeira Depósito de Materiais</div>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu"><X size={24} /></Button>
                        </div>
                        <nav className="mt-16 flex flex-col items-center space-y-8">
                            <Button variant="secondary" size="lg" onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}><User size={20} className="mr-2" />Acessar Conta</Button>
                        </nav>
                    </div>
                </div>
            )}

            <main>
                <section id="inicio">
                    <BannerCarousel banners={banners} />
                </section>

                <section id="categorias" className="py-24">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Navegue por Categorias</h2>
                        <CategoryGrid onCategoryClick={handleCategoryClick} />
                    </div>
                </section>

                <section id="ofertas" className="pt-24 bg-gray-100 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Nossas Ofertas</h2>
                        {loading ? (
                            <p className="text-center">Carregando ofertas...</p>
                        ) : offerProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {offerProducts.map(item => (
                                    <ProductCard 
                                        key={`${item.type}-${item.id}`} 
                                        product={{
                                            ...item,
                                            name: item.nome || item.servico,
                                            price: item.precoFinal
                                        }} 
                                        onComprarClick={handleComprarClick} />
                                ))}
                            </div>
                        ) : (<p className="text-center text-gray-500">Nenhuma oferta especial no momento. Volte em breve!</p>)}
                    </div>
                </section>

                <BrandsSection />

                <section id="localizacao" className="py-24">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Nossa localização</h2>
                        <div className="text-center">
                            <p className="mb-4">Venha nos visitar! Estamos prontos para te atender.</p>
                            <p className="font-semibold">R. Pinha do Brejo, 243 - Jardim Maia, São Paulo - SP, 08180-320</p>

                            <div className="mt-8 w-full h-96"><LocationMap /></div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-200 dark:bg-gray-900 mt-16 py-10 text-gray-600 dark:text-gray-400">
                <div className="container mx-auto px-4 text-center md:text-left md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <div className="text-2xl font-bold tracking-wider text-gray-800 dark:text-white">Teixeira Depósito de Materiais</div>
                        <p className="mt-2 text-sm">Tudo para sua obra, do básico ao acabamento.</p>
                    </div>
                    <div className="mb-6 md:mb-0">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Institucional</h4>
                        <a href="#" className="block text-sm hover:text-gray-900 dark:hover:text-white transition-colors">Sobre Nós</a>
                        <a href="#localizacao" className="block text-sm hover:text-gray-900 dark:hover:text-white transition-colors mt-1">Nossas Lojas</a>
                    </div>
                    <div className="mb-6 md:mb-0">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Atendimento</h4>
                        <p className="text-sm">Seg. a Sáb. das 8h às 18h</p>
                        <p className="text-sm">(11) 0000-0000</p>
                    </div>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-800 mt-8 pt-6 text-center text-sm">
                    <p>© {new Date().getFullYear()} Teixeira Materiais para Construção. Todos os direitos reservados.</p>
                    <p className="mt-2">
                        <button onClick={() => setIsLgpdModalOpen(true)} className="underline hover:text-gray-900 dark:hover:text-white transition-colors">Política de Privacidade</button>
                    </p>
                </div>
            </footer>

            <WhatsAppButton phoneNumber="5511941341795" message="Olá! Gostaria de mais informações sobre seus produtos." />

            <Modal isOpen={isCategoryModalOpen} onClose={handleCloseCategoryModal} size="2xl">
                <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-500 mb-6">{viewingCategory}</h2>
                <div className="max-h-[70vh] overflow-y-auto pr-4">
                    {productsForModal.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productsForModal.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={{
                                        ...product,
                                        name: product.nome,
                                        price: product.precoFinal,
                                        description: `Marca: ${product.marca}`
                                    }} 
                                    onComprarClick={handleComprarClick} 
                                />
                            ))}
                        </div>
                    ) : (<p className="text-center text-gray-500 py-16">Nenhum produto encontrado nesta categoria.</p>)}
                </div>
            </Modal>

            <Modal isOpen={isLgpdModalOpen} onClose={() => setIsLgpdModalOpen(false)} size="lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Política de Privacidade e Proteção de Dados (LGPD)</h2>
                <div className="text-gray-700 dark:text-gray-300 space-y-4 max-h-[70vh] overflow-y-auto pr-4 text-sm">
                    <p>A <strong>Teixeira Materiais para Construção</strong>, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), está comprometida em proteger a sua privacidade e garantir a segurança dos seus dados pessoais. Esta política explica como coletamos, usamos, compartilhamos e protegemos suas informações.</p>
                    
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white pt-2">1. Coleta de Dados</h3>
                    <p>Coletamos dados pessoais que você nos fornece diretamente ao se cadastrar em nosso sistema, realizar uma compra ou solicitar um serviço. Os dados coletados podem incluir: nome completo, CPF/CNPJ, endereço de e-mail, número de telefone e histórico de compras/serviços.</p>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white pt-2">2. Uso dos Dados</h3>
                    <p>Utilizamos seus dados para:</p>
                    <ul className="list-disc list-inside pl-4">
                        <li>Processar suas compras e ordens de serviço.</li>
                        <li>Gerenciar seu cadastro e histórico para facilitar futuras interações.</li>
                        <li>Emitir notas fiscais e comprovantes de venda.</li>
                        <li>Comunicar sobre informações de produtos, quando solicitado.</li>
                        <li>Cumprir obrigações legais e regulatórias.</li>
                    </ul>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white pt-2">3. Compartilhamento de Dados</h3>
                    <p>A Teixeira Materiais para Construção não compartilha seus dados pessoais com terceiros para fins de marketing. O compartilhamento pode ocorrer apenas com autoridades governamentais para cumprimento de obrigações legais ou em caso de requisição judicial.</p>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white pt-2">4. Seus Direitos</h3>
                    <p>Como titular dos dados, você tem o direito de:</p>
                    <ul className="list-disc list-inside pl-4">
                        <li>Confirmar a existência de tratamento dos seus dados.</li>
                        <li>Acessar seus dados.</li>
                        <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                        <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
                        <li>Solicitar a portabilidade dos seus dados a outro fornecedor de serviço ou produto.</li>
                        <li>Revogar o consentimento, quando aplicável.</li>
                    </ul>
                    <p>Para exercer seus direitos, entre em contato conosco através dos nossos canais de atendimento.</p>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white pt-2">5. Segurança dos Dados</h3>
                    <p>Adotamos medidas técnicas e administrativas para proteger seus dados pessoais de acessos não autorizados e de situações de destruição, perda, alteração, comunicação ou difusão.</p>

                    <p className="pt-4">Ao utilizar nossos serviços, você concorda com os termos desta Política de Privacidade.</p>
                </div>
            </Modal>
        </div>
    );
};

export default HomePage;