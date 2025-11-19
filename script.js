// script.js (Completo, com Gráficos e Sem Roles)

/**
 * @fileoverview Módulo principal da Dashboard de Controle de Estoque.
 * Este arquivo gerencia a navegação, o carregamento de dados via API,
 * a renderização das tabelas e gráficos, e a lógica de modais (CRUD).
 */

import {
    getProdutos, addProduto, updateProduto, deleteProduto, getProduto,
    getClientes, getCliente, addCliente, updateCliente, deleteCliente,
    getFornecedores, getFornecedor, addFornecedor, updateFornecedor, deleteFornecedor,
    getUsuarios, getUsuario, addUsuario, updateUsuario, deleteUsuario,
    getPedidos, addPedido, getPedido, updatePedidoStatus,
    getNotasFiscais, getNotaFiscal, addNotaFiscalManual, updateNotaFiscal, deleteNotaFiscal, addNotaFiscalXml,

    // Funções de Relatório (Novas e Corrigidas)
    getVisaoGeralEstoque,
    getVendasPorMes,
    getTop5Produtos,
    getTop5Clientes,
    getItensParados
} from './services/api.js';


// --- Variáveis Globais de Gráficos ---
let vendasChartInstance = null;
let topItensChartInstance = null;
let topClientesChartInstance = null;

// --- Função Helper para formatar Moeda ---
/**
 * Formata um valor numérico para o padrão monetário brasileiro (BRL).
 * Se o valor não for um número, retorna 'R$ 0,00'.
 *
 * @param {number} valor - O valor numérico a ser formatado.
 * @returns {string} O valor formatado como moeda (ex: R$ 1.000,00).
 */
function formatarMoeda(valor) {
    if (typeof valor !== 'number') {
        valor = 0;
    }
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata uma string de data para o padrão 'dd/mm/yyyy'.
 * @param {string} dataString - A string de data (ex: '2025-11-19T03:00:00Z').
 * @returns {string} A data formatada ou 'N/A'/'Data Inválida'.
 */
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        return new Date(dataString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return 'Data Inválida';
    }
}
// --- Função applyUserRoleLimits REMOVIDA ---

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GUARDA DE AUTENTICAÇÃO ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    // --- Pega a role... REMOVIDO ---


    // --- 2. DEFINIÇÃO DE ELEMENTOS (DOM) ---
    // Elementos Globais
    const menuButton = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const menuIcon = document.getElementById('menu-icon');
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const headerTitle = document.getElementById('header-title');

    // Header (Simplificado)
    document.getElementById('user-name-display').textContent = "Usuário";
    document.getElementById('user-role-display').textContent = "Online";

    // Navegação (Telas)
    const navInicioBtn = document.getElementById('nav-inicio-btn');
    const navRelatoriosBtn = document.getElementById('nav-relatorios-btn'); // NOVO
    const navProdutosBtn = document.getElementById('nav-produtos-btn');
    const navPedidosBtn = document.getElementById('nav-pedidos-btn');
    const navNotasFiscaisBtn = document.getElementById('nav-notas-fiscais-btn');
    const navClientesBtn = document.getElementById('nav-clientes-btn');
    const navFornecedoresBtn = document.getElementById('nav-fornecedores-btn');
    const navUsuariosBtn = document.getElementById('nav-usuarios-btn');
    const inicioContent = document.getElementById('inicio-content');
    const relatoriosContent = document.getElementById('relatorios-content'); // NOVO
    const produtosContent = document.getElementById('produtos-content');
    const pedidosContent = document.getElementById('pedidos-content');
    const notasFiscaisContent = document.getElementById('notas-fiscais-content');
    const clientesContent = document.getElementById('clientes-content');
    const fornecedoresContent = document.getElementById('fornecedores-content');
    const usuariosContent = document.getElementById('usuarios-content');

    // Tela de PRODUTOS
    const productsTableBody = document.getElementById('products-table-body');
    const searchProdutoInput = document.getElementById('search-produto-input');
    // (CORRIGIDO) IDs da Visão Geral
    const totalItensSpan = document.getElementById('total-itens');
    const valorTotalVendaSpan = document.getElementById('valor-total-venda');
    const valorTotalCustoSpan = document.getElementById('valor-total-custo');
    const addProductHeaderBtn = document.getElementById('add-product-header-btn');

    // Tela de CLIENTES
    const clientesTableBody = document.getElementById('clientes-table-body');
    const searchClienteInput = document.getElementById('search-cliente-input');
    const addClienteHeaderBtn = document.getElementById('add-cliente-header-btn');

    // Tela de FORNECEDORES
    const fornecedoresTableBody = document.getElementById('fornecedores-table-body');
    const searchFornecedorInput = document.getElementById('search-fornecedor-input');
    const addFornecedorHeaderBtn = document.getElementById('add-fornecedor-header-btn');

    // Tela de USUÁRIOS
    const usuariosTableBody = document.getElementById('usuarios-table-body');
    const searchUsuarioInput = document.getElementById('search-usuario-input');
    const addUsuarioHeaderBtn = document.getElementById('add-usuario-header-btn');

    // Tela de PEDIDOS
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const searchPedidoInput = document.getElementById('search-pedido-input');

    // Tela de NOTAS FISCAIS
    const notasFiscaisTableBody = document.getElementById('notas-fiscais-table-body');
    const searchNotaInput = document.getElementById('search-nota-input');

    // Modal de PRODUTO
    const productModal = document.getElementById('product-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal-btn');
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    const productForm = document.getElementById('product-form');
    const productModalTitle = document.getElementById('product-modal-title');
    const productIdInput = document.getElementById('product-id');
    const productNomeInput = document.getElementById('product-nome');
    const productQuantidadeInput = document.getElementById('product-quantidade');
    const productPrecoInput = document.getElementById('product-preco');
    const productCustoInput = document.getElementById('product-custo');
    const productTipoInput = document.getElementById('product-tipo');

    // Modal de CLIENTE
    const clienteModal = document.getElementById('cliente-modal');
    const closeClienteModalBtn = document.getElementById('close-cliente-modal-btn');
    const cancelClienteBtn = document.getElementById('cancel-cliente-btn');
    const clienteForm = document.getElementById('cliente-form');
    const clienteModalTitle = document.getElementById('cliente-modal-title');
    const clienteIdInput = document.getElementById('cliente-id');
    const clienteNomeInput = document.getElementById('cliente-nome');
    const clienteCnpjInput = document.getElementById('cliente-cnpj');
    const clienteEmailInput = document.getElementById('cliente-email');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');

    // Modal de FORNECEDOR
    const fornecedorModal = document.getElementById('fornecedor-modal');
    const closeFornecedorModalBtn = document.getElementById('close-fornecedor-modal-btn');
    const cancelFornecedorBtn = document.getElementById('cancel-fornecedor-btn');
    const fornecedorForm = document.getElementById('fornecedor-form');
    const fornecedorModalTitle = document.getElementById('fornecedor-modal-title');
    const fornecedorIdInput = document.getElementById('fornecedor-id');
    const fornecedorNomeInput = document.getElementById('fornecedor-nome');
    const fornecedorCnpjInput = document.getElementById('fornecedor-cnpj');
    const fornecedorEmailInput = document.getElementById('fornecedor-email');
    const fornecedorTelefoneInput = document.getElementById('fornecedor-telefone');
    const fornecedorEnderecoInput = document.getElementById('fornecedor-endereco');

    // Modal de USUÁRIO
    const usuarioModal = document.getElementById('usuario-modal');
    const closeUsuarioModalBtn = document.getElementById('close-usuario-modal-btn');
    const cancelUsuarioBtn = document.getElementById('cancel-usuario-btn');
    const usuarioForm = document.getElementById('usuario-form');
    const usuarioModalTitle = document.getElementById('usuario-modal-title');
    const usuarioIdInput = document.getElementById('usuario-id');
    const usuarioNomeInput = document.getElementById('usuario-nome');
    const usuarioEmailInput = document.getElementById('usuario-email');
    const usuarioSenhaInput = document.getElementById('usuario-senha');
    const usuarioRoleInput = document.getElementById('usuario-role');

    // Modal de PEDIDO
    const pedidoModal = document.getElementById('pedido-modal');
    const openPedidoModalBtn = document.getElementById('open-pedido-modal-btn');
    const closePedidoModalBtn = document.getElementById('close-pedido-modal-btn');
    const cancelPedidoBtn = document.getElementById('cancel-pedido-btn');
    const pedidoForm = document.getElementById('pedido-form');
    const pedidoClienteSelect = document.getElementById('pedido-cliente-select');
    const pedidoItemProdutoSelect = document.getElementById('pedido-item-produto-select');
    const pedidoItemQtdInput = document.getElementById('pedido-item-qtd-input');
    const pedidoAddItemBtn = document.getElementById('pedido-add-item-btn');
    const pedidoItemsListBody = document.getElementById('pedido-items-list-body');
    const pedidoValorTotalSpan = document.getElementById('pedido-valor-total');

    // Modal de NOTA FISCAL
    const notaFiscalModal = document.getElementById('nota-fiscal-modal');
    const openNotaFiscalModalBtn = document.getElementById('open-nota-fiscal-modal-btn');
    const closeNotaFiscalModalBtn = document.getElementById('close-nota-fiscal-modal-btn');
    const cancelNotaFiscalBtn = document.getElementById('cancel-nota-fiscal-btn');
    const cancelNotaFiscalXmlBtn = document.getElementById('cancel-nota-fiscal-xml-btn');
    const nfModalTitle = document.getElementById('nf-modal-title');
    const nfIdInput = document.getElementById('nf-id');
    const nfModalTabs = document.getElementById('nf-modal-tabs');
    const nfTabManualBtn = document.getElementById('nf-tab-manual-btn');
    const nfTabXmlBtn = document.getElementById('nf-tab-xml-btn');
    const nfTabManualContent = document.getElementById('nf-tab-manual-content');
    const nfTabXmlContent = document.getElementById('nf-tab-xml-content');
    const nfManualForm = document.getElementById('nf-manual-form');
    const nfXmlForm = document.getElementById('nf-xml-form');
    const nfFornecedorSelect = document.getElementById('nf-fornecedor');
    const nfNumeroInput = document.getElementById('nf-numero');
    const nfDataInput = document.getElementById('nf-data');
    const nfItemProdutoSelect = document.getElementById('nf-item-produto');
    const nfAddItemBox = document.getElementById('nf-add-item-box');
    const nfAddItemBtn = document.getElementById('nf-add-item-btn');
    const nfItemsListBody = document.getElementById('nf-items-list-body');
    const nfValorTotalSpan = document.getElementById('nf-valor-total-label');
    let nfItems = [];

    // Modal de Exclusão (GENÉRICO)
    const deleteModal = document.getElementById('delete-confirm-modal');
    const deleteConfirmMessage = document.getElementById('delete-confirm-message');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');


    // --- 3. ESTADO DA APLICAÇÃO ---
    let itemParaExcluir = { id: null, tipo: null, nome: null };
    let itemParaEditar = null;
    let todosOsProdutos = [];
    let todosOsClientes = [];
    let todosOsFornecedores = [];
    let todosOsUsuarios = [];
    let todosOsPedidos = [];
    let todasAsNotasFiscais = [];
    let pedidoItems = [];


    // --- 4. applyUserRoleLimits() REMOVIDA ---

    // --- 5. EVENT LISTENERS GLOBAIS (Sidebar, Logout) ---
    // ... (Lógica de toggle da sidebar e logout) ...
    menuButton?.addEventListener('click', () => {
        sidebar?.classList.toggle('-translate-x-full');
        mainContent?.classList.toggle('md:ml-64');
        menuIcon?.classList.toggle('fa-bars');
        menuIcon?.classList.toggle('fa-times');
    });

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    };
    logoutBtn?.addEventListener('click', handleLogout);
    headerLogoutBtn?.addEventListener('click', handleLogout);


    // --- 6. LÓGICA DE NAVEGAÇÃO ENTRE TELAS (CORRIGIDA) ---
    // ... (Funções setAtivo e mostrarTela, e listeners de navegação) ...
    const navButtons = [navInicioBtn, navRelatoriosBtn, navProdutosBtn, navPedidosBtn, navClientesBtn, navFornecedoresBtn, navUsuariosBtn, navNotasFiscaisBtn];
    const contentScreens = [inicioContent, relatoriosContent, produtosContent, pedidosContent, clientesContent, fornecedoresContent, usuariosContent, notasFiscaisContent];

    function setAtivo(botaoAtivo) {
        navButtons.forEach(btn => {
            btn?.querySelector('a').classList.remove('bg-purple-600', 'text-white');
        });
        botaoAtivo?.querySelector('a').classList.add('bg-purple-600', 'text-white');
    }

    function mostrarTela(telaParaMostrar, tituloHeader) {
        contentScreens.forEach(tela => tela?.classList.add('hidden'));
        telaParaMostrar?.classList.remove('hidden');
        headerTitle.textContent = tituloHeader;
    }

    const telaMap = {
        'nav-inicio-btn': { tela: inicioContent, titulo: 'Início' },
        'nav-relatorios-btn': { tela: relatoriosContent, titulo: 'Relatórios' },
        'nav-produtos-btn': { tela: produtosContent, titulo: 'Produtos' },
        'nav-clientes-btn': { tela: clientesContent, titulo: 'Clientes' },
        'nav-fornecedores-btn': { tela: fornecedoresContent, titulo: 'Fornecedores' },
        'nav-usuarios-btn': { tela: usuariosContent, titulo: 'Usuários' },
        'nav-pedidos-btn': { tela: pedidosContent, titulo: 'Listar Pedidos' },
        'nav-notas-fiscais-btn': { tela: notasFiscaisContent, titulo: 'Listar Notas Fiscais' }
    };

    navButtons.forEach(btn => {
        if (!btn) return;
        // Ignora os botões que abrem modais (que não estão neste array)
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const mapping = telaMap[btn.id];
            if (mapping) {
                mostrarTela(mapping.tela, mapping.titulo);
                setAtivo(btn);

                // (NOVO) Carrega os dados do gráfico SE for a tela de relatórios
                if (btn.id === 'nav-relatorios-btn') {
                    carregarRelatorios();
                }
            }
        });
    });
    // --- Fim da Lógica de Navegação ---


    // --- 7. (NOVO) LÓGICA DE RELATÓRIOS E GRÁFICOS ---

    /**
     * Função principal que busca dados de relatórios e renderiza os gráficos.
     * Chama as funções da API em paralelo.
     * @returns {Promise<void>}
     */
    async function carregarRelatorios() {
        try {
            // Busca os dados em paralelo
            const [vendasData, topProdutosData, topClientesData] = await Promise.all([
                getVendasPorMes(),
                getTop5Produtos(),
                getTop5Clientes(),
                getItensParados()
            ]);

            // Renderiza os gráficos com os dados
            renderizarChartVendas(vendasData);
            renderizarChartTopItens(topProdutosData);
            renderizarChartTopClientes(topClientesData);

        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
            alert("Não foi possível carregar os relatórios.");
        }
    }

    /**
     * Renderiza o gráfico de Vendas por Mês (Gráfico de Linha)
     */
    // ... (Definição de cores e funções renderizarChartVendas, renderizarChartTopItens, renderizarChartTopClientes, renderizarTabelaItensParados) ...
    const corTextoGrafico = '#9CA3AF'; // Cinza claro (para texto/ticks)
    const corGridGrafico = '#374151';   // Cinza escuro (para linhas de grade)
    const corBordaPizza = '#1e1e2d';    // Cor de fundo (para borda da pizza)



    /**
     * Gráfico de Linha (Vendas) - Versão LARANJA/VERMELHO
     */
    function renderizarChartVendas(data) {
        const ctx = document.getElementById('vendasChart').getContext('2d');
        const labels = data.map(d => `${String(d.mes).padStart(2, '0')}/${d.ano}`);
        const valores = data.map(d => d.valorTotalVendido);

        if (vendasChartInstance) {
            vendasChartInstance.destroy();
        }

        vendasChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor Total Vendido (R$)',
                    data: valores,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)', // Laranja transparente
                    borderColor: 'rgba(249, 115, 22, 1)',     // Laranja opaco
                    borderWidth: 2,
                    tension: 0.1,
                    fill: false // 'fill: false' está CORRETO para remover o fundo
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatarMoeda(value),
                            color: corTextoGrafico // <-- CORRIGIDO
                        },
                        grid: {
                            color: corGridGrafico // <-- CORRIGIDO
                        }
                    },
                    x: {
                        ticks: {
                            color: corTextoGrafico // <-- CORRIGIDO
                        },
                        grid: {
                            color: corGridGrafico // <-- CORRIGIDO
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: corTextoGrafico // <-- CORRIGIDO
                        }
                    }
                }
            }
        });
    }

    /**
     * Gráfico de Barras (Top Itens) - Versão LARANJA/VERMELHO
     */
    function renderizarChartTopItens(data) {
        const ctx = document.getElementById('topItensChart').getContext('2d');
        const labels = data.map(d => d.nomeProduto);
        const valores = data.map(d => d.totalVendido);

        if (topItensChartInstance) {
            topItensChartInstance.destroy();
        }

        topItensChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: valores,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',   // Vermelho 1
                        'rgba(249, 115, 22, 0.8)', // Laranja 1
                        'rgba(245, 158, 11, 0.8)', // Âmbar 1
                        'rgba(234, 179, 8, 0.8)',   // Amarelo
                        'rgba(220, 38, 38, 0.8)'   // Vermelho 2
                    ],
                    borderColor: corGridGrafico, // <-- CORRIGIDO
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: corTextoGrafico // <-- CORRIGIDO
                        },
                        grid: {
                            color: corGridGrafico // <-- CORRIGIDO
                        }
                    },
                    y: {
                        ticks: {
                            color: corTextoGrafico // <-- CORRIGIDO
                        },
                        grid: {
                            color: corGridGrafico // <-- CORRIGIDO
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Gráfico de Pizza (Top Clientes) - Versão LARANJA/VERMELHO
     */
    function renderizarChartTopClientes(data) {
        const ctx = document.getElementById('topClientesChart').getContext('2d');
        const labels = data.map(d => d.nomeCliente);
        const valores = data.map(d => d.valorTotalComprado);

        if (topClientesChartInstance) {
            topClientesChartInstance.destroy();
        }

        topClientesChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor Total (R$)',
                    data: valores,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',   // Vermelho 1
                        'rgba(249, 115, 22, 0.8)', // Laranja 1
                        'rgba(245, 158, 11, 0.8)', // Âmbar 1
                        'rgba(234, 179, 8, 0.8)',   // Amarelo
                        'rgba(220, 38, 38, 0.8)'   // Vermelho 2
                    ],
                    borderColor: corBordaPizza, // <-- CORRIGIDO
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: corTextoGrafico // <-- CORRIGIDO
                        }
                    }
                }
            }
        });
    }
    /**
     * Renderiza a tabela de Itens Parados
     */
    function renderizarTabelaItensParados(data) {
        const tbody = document.getElementById('itens-parados-tbody');

        if (!tbody) {
            console.error("Elemento 'itens-parados-tbody' não encontrado!");
            return;
        }

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-green-500">✅ Não há itens parados no momento!</td></tr>';
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#161625]';

            // Calcula dias parados
            let diasParado = 'Nunca vendido';
            let corDias = 'text-red-500';

            if (item.dataUltimaVenda) {
                const dataVenda = new Date(item.dataUltimaVenda);
                const hoje = new Date();
                const diffTime = Math.abs(hoje - dataVenda);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                diasParado = `${diffDays} dias`;

                if (diffDays >= 30) {
                    corDias = 'text-red-600 font-bold';
                } else if (diffDays >= 20) {
                    corDias = 'text-orange-500';
                } else {
                    corDias = 'text-yellow-500';
                }
            }

            const ultimaVenda = item.dataUltimaVenda
                ? formatarData(item.dataUltimaVenda)
                : '<span class="text-red-500">Nunca</span>';

            tr.innerHTML = `
            <td class="p-3 text-white">${item.nome}</td>
            <td class="p-3 text-center font-bold text-white">${item.quantidade}</td>
            <td class="p-3 text-center">${ultimaVenda}</td>
            <td class="p-3 text-center ${corDias} font-bold">${diasParado}</td>
        `;

            tbody.appendChild(tr);
        });
    }

    // --- 8. FUNÇÕES DE DADOS (Carregar e Renderizar Tabelas) ---

    // --- PEDIDOS ---
    /**
     * Renderiza o corpo da tabela de pedidos com base nos dados fornecidos.
     * @param {Array<Object>} pedidos - Array de objetos Pedido.
     * @returns {void}
     */
    function renderizarTabelaPedidos(pedidos) {
        if (!pedidosTableBody) return;
        pedidosTableBody.innerHTML = '';
        if (pedidos.length === 0) {
            const msg = searchPedidoInput.value ? "Nenhum pedido encontrado." : "Nenhum pedido cadastrado.";
            pedidosTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">${msg}</td></tr>`; // Colspan 6
            return;
        }
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            // (NOVO) Adiciona classe e data-id para clique
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d] pedido-row-clickable';
            tr.dataset.id = pedido.id;

            const dataFormatada = formatarData(pedido.dataPedido);
            const statusLower = (pedido.status || '').toLowerCase();
            let statusHtml = '';

            // Lógica dos Badges de Status
            if (statusLower === 'concluído') {
                statusHtml = '<span class="bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Concluído</span>';
            } else if (statusLower === 'pendente') {
                statusHtml = '<span class="bg-yellow-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Pendente</span>';
            } else if (statusLower === 'cancelado') {
                statusHtml = '<span class="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Cancelado</span>';
            } else {
                statusHtml = `<span class="bg-gray-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">${pedido.status || 'N/A'}</span>`;
            }

            // (NOVO) Coluna Ações
            tr.innerHTML = `
                <td class="p-3 font-medium text-white">${pedido.id}</td>
                <td class="p-3 hidden sm:table-cell">${pedido.nomeCliente || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${dataFormatada}</td>
                <td class="p-3">${statusHtml}</td>
                <td class="p-3 font-medium text-white">${formatarMoeda(pedido.valorTotal)}</td>
                <td class="p-3 0046FF">
                    <i class="fa fa-eye"></i>
                </td>
            `;
            pedidosTableBody.appendChild(tr);
        });
    }
    /**
     * Busca pedidos na API (opcionalmente filtrando por status) e atualiza a tabela.
     * Salva o resultado em `todosOsPedidos`.
     * @param {string} [status=null] - Status do pedido para filtragem.
     * @returns {Promise<void>}
     */
    // (ATUALIZADO) Aceita status
    async function carregarPedidosTabela(status = null) {
        if (!pedidosTableBody) return;
        pedidosTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">Carregando...</td></tr>`; // Colspan 6
        try {
            const pedidos = await getPedidos(status); // Passa o status
            todosOsPedidos = pedidos;
            renderizarTabelaPedidos(todosOsPedidos);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            pedidosTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-red-500">Falha ao carregar pedidos.</td></tr>`;
        }
    }

    searchPedidoInput?.addEventListener('input', () => {
        const searchTerm = searchPedidoInput.value.toLowerCase();
        const filtrados = todosOsPedidos.filter(p =>
            (p.nomeCliente || '').toLowerCase().includes(searchTerm) ||
            (p.status || '').toLowerCase().includes(searchTerm)
        );
        renderizarTabelaPedidos(filtrados);
    });

    // --- CLIENTES (CORRIGIDO) ---
    function renderizarTabelaClientes(clientes) {
        if (!clientesTableBody) return;
        clientesTableBody.innerHTML = '';
        if (clientes.length === 0) {
            const msg = searchClienteInput.value ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado.";
            clientesTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            const acoesHtml = `
                <button data-id="${cliente.id}" data-nome="${cliente.nome}" class="text-blue-500 hover:text-blue-400 mr-2 edit-btn" title="Editar">
                    <i class="fa fa-edit"></i>
                </button>
                <button data-id="${cliente.id}" data-nome="${cliente.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Inativar">
                    <i class="fa fa-trash-alt"></i>
                </button>
            `;
            tr.innerHTML = `
                <td class="p-3">${cliente.nome || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${cliente.cnpj || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${cliente.email || 'N/A'}</td>
                <td class="p-3">${acoesHtml}</td>
            `;
            clientesTableBody.appendChild(tr);
        });
    }
    async function carregarClientesTabela() {
        if (!clientesTableBody) return;
        clientesTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const clientes = await getClientes();
            todosOsClientes = clientes;
            renderizarTabelaClientes(todosOsClientes);

            const optionHtml = clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
            pedidoClienteSelect.innerHTML = '<option value="">Selecione um cliente</option>' + optionHtml;
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            clientesTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Falha ao carregar clientes.</td></tr>`;
        }
    }
    searchClienteInput?.addEventListener('input', () => {
        const searchTerm = searchClienteInput.value.toLowerCase();
        const filtrados = todosOsClientes.filter(c =>
            c.nome.toLowerCase().includes(searchTerm) ||
            (c.cnpj && c.cnpj.toLowerCase().includes(searchTerm))
        );
        renderizarTabelaClientes(filtrados);
    });

    // --- FORNECEDORES (CORRIGIDO) ---
    function renderizarTabelaFornecedores(fornecedores) {
        if (!fornecedoresTableBody) return;
        fornecedoresTableBody.innerHTML = '';
        if (fornecedores.length === 0) {
            const msg = searchFornecedorInput.value ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado.";
            fornecedoresTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        fornecedores.forEach(f => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            const acoesHtml = `
                <button data-id="${f.id}" data-nome="${f.nome}" class="text-blue-500 hover:text-blue-400 mr-2 edit-btn" title="Editar">
                    <i class="fa fa-edit"></i>
                </button>
                <button data-id="${f.id}" data-nome="${f.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            `;
            tr.innerHTML = `
                <td class="p-3">${f.nome || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${f.cnpj || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${f.telefone || 'N/A'}</td>
                <td class="p-3">${acoesHtml}</td>
            `;
            fornecedoresTableBody.appendChild(tr);
        });
    }
    async function carregarFornecedoresTabela() {
        if (!fornecedoresTableBody) return;
        fornecedoresTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const fornecedores = await getFornecedores();
            todosOsFornecedores = fornecedores;
            renderizarTabelaFornecedores(todosOsFornecedores);

            const optionHtml = fornecedores.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
            nfFornecedorSelect.innerHTML = '<option value="">Selecione um fornecedor</option>' + optionHtml;
        } catch (error) {
            console.error("Erro ao carregar fornecedores:", error);
            fornecedoresTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Falha ao carregar fornecedores.</td></tr>`;
        }
    }
    searchFornecedorInput?.addEventListener('input', () => {
        const searchTerm = searchFornecedorInput.value.toLowerCase();
        const filtrados = todosOsFornecedores.filter(f =>
            f.nome.toLowerCase().includes(searchTerm) ||
            (f.cnpj && f.cnpj.toLowerCase().includes(searchTerm))
        );
        renderizarTabelaFornecedores(filtrados);
    });

    // --- USUÁRIOS (CORRIGIDO) ---
    function renderizarTabelaUsuarios(usuarios) {
        if (!usuariosTableBody) return;
        usuariosTableBody.innerHTML = '';
        if (usuarios.length === 0) {
            const msg = searchUsuarioInput.value ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado.";
            usuariosTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            const roleApi = (usuario.tipo || 'Funcionario').toLowerCase();
            const displayRole = roleApi === 'admin'
                ? 'Administrador'
                : 'Funcionario';
            const statusHtml = usuario.status === true
                ? '<span class="bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Ativo</span>'
                : '<span class="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Inativo</span>';
            const acoesHtml = `
                <button data-id="${usuario.id}" data-nome="${usuario.nome}" class="text-blue-500 hover:text-blue-400 mr-2 edit-btn" title="Editar">
                    <i class="fa fa-edit"></i>
                </button>
                <button data-id="${usuario.id}" data-nome="${usuario.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Inativar">
                    <i class="fa fa-trash-alt"></i>
                </button>
            `;
            tr.innerHTML = `
                <td class="p-3">${usuario.nome || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${usuario.email || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${displayRole}</td>
                <td class="p-3">${statusHtml}</td>
                <td class="p-3">${acoesHtml}</td>
            `;
            usuariosTableBody.appendChild(tr);
        });
    }
    async function carregarUsuariosTabela() {
        if (!usuariosTableBody) return;
        usuariosTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const usuarios = await getUsuarios();
            todosOsUsuarios = usuarios;
            renderizarTabelaUsuarios(todosOsUsuarios);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usuariosTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Falha ao carregar usuários.</td></tr>`;
        }
    }
    searchUsuarioInput?.addEventListener('input', () => {
        const searchTerm = searchUsuarioInput.value.toLowerCase();
        const filtrados = todosOsUsuarios.filter(u =>
            u.nome.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm)
        );
        renderizarTabelaUsuarios(filtrados);
    });

    // --- PEDIDOS (CORRIGIDO) ---

    // --- PRODUTOS (CORRIGIDO) ---
    function renderizarTabelaProdutos(produtos) {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = '';
        if (produtos.length === 0) {
            const msg = searchProdutoInput.value ? "Nenhum produto encontrado." : "Nenhum produto cadastrado.";
            // Corrigido para 5 colunas
            productsTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';

            const statusClass = produto.status === 'Em Estoque' ? 'text-green-500' : 'text-red-500';
            const statusHtml = `<span class="font-bold ${statusClass}">${produto.status}</span>`;

            // Ações (Sem verificação de role)
            const acoesHtml = `
                <button data-id="${produto.id}" data-nome="${produto.nome}" class="text-blue-500 hover:text-blue-400 mr-2 edit-btn" title="Editar">
                    <i class="fa fa-edit"></i>
                </button>
                <button data-id="${produto.id}" data-nome="${produto.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            `;

            // Layout da tabela (Corrigido para 5 colunas + Ações)
            tr.innerHTML = `
                <td class="p-3 hidden sm:table-cell">${produto.nome || 'N/A'}</td>
                <td class="p-3 sm:hidden">${produto.nome || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${produto.quantidade ?? 'N/A'}</td>
                <td class="p-3 sm:hidden">${produto.quantidade ?? 'N/A'}</td>
                <td class="p-3">${statusHtml}</td> 
                <td class="p-3 hidden md:table-cell">${formatarMoeda(produto.precoVenda)}</td>
                <td class="p-3">${acoesHtml}</td>
            `;
            productsTableBody.appendChild(tr);
        });
    }

    async function carregarProdutosTabela() {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const produtos = await getProdutos();
            todosOsProdutos = produtos;
            renderizarTabelaProdutos(todosOsProdutos);

            // Popula dropdowns
            const optionHtml = produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
            pedidoItemProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>' + optionHtml;
            nfItemProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>' + optionHtml;
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            productsTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Falha ao carregar produtos.</td></tr>`;
        }
    }

    searchProdutoInput?.addEventListener('input', () => {
        const searchTerm = searchProdutoInput.value.toLowerCase();
        const filtrados = todosOsProdutos.filter(p =>
            p.nome.toLowerCase().includes(searchTerm)
        );
        renderizarTabelaProdutos(filtrados);
    });

    // --- NOTAS FISCAIS ---
    function renderizarTabelaNotasFiscais(notas) {
        if (!notasFiscaisTableBody) return;
        notasFiscaisTableBody.innerHTML = '';
        if (notas.length === 0) {
            const msg = searchNotaInput.value ? "Nenhuma nota fiscal encontrada." : "Nenhuma nota fiscal cadastrada.";
            notasFiscaisTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        notas.forEach(nota => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            const dataFormatada = formatarData(nota.dataEmissao);
            const valorFormatado = formatarMoeda(nota.valorTotal);

            // Botão de editar (olho) e deletar
            const acoesHtml = `
                <button data-id="${nota.id}" class="text-blue-400 hover:text-blue-300 mr-3 edit-btn" title="Exibir Detalhes">
                    <i class="fa fa-eye"></i>
                </button>
                <button data-id="${nota.id}" data-nome="Nota ${nota.numeroNota}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            `;
            tr.innerHTML = `
                <td class="p-3">${nota.numeroNota || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${nota.fornecedor?.nome || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${dataFormatada}</td>
                <td class="p-3 hidden sm:table-cell">${valorFormatado}</td>
                <td class="p-3">${acoesHtml}</td>
            `;
            notasFiscaisTableBody.appendChild(tr);
        });
    }

    async function carregarNotasFiscaisTabela() {
        if (!notasFiscaisTableBody) return;
        notasFiscaisTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            // (Aviso: A função getNotasFiscais() no api.js ainda retorna []
            // até implementarmos o GET /api/NotaFiscalCompra no backend)
            const notas = await getNotasFiscais();
            todasAsNotasFiscais = notas;
            renderizarTabelaNotasFiscais(todasAsNotasFiscais);
        } catch (error) {
            console.error("Erro ao carregar notas fiscais:", error);
            notasFiscaisTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Falha ao carregar notas fiscais.</td></tr>`;
        }
    }

    searchNotaInput?.addEventListener('input', () => {
        const searchTerm = searchNotaInput.value.toLowerCase();
        const filtrados = todasAsNotasFiscais.filter(n =>
            (n.numeroNota || '').toLowerCase().includes(searchTerm) ||
            (n.fornecedor?.nome || '').toLowerCase().includes(searchTerm)
        );
        renderizarTabelaNotasFiscais(filtrados);
    });

    // --- VISÃO GERAL (CARDS) (CORRIGIDO) ---
    /**
     * Busca os dados de visão geral do estoque e atualiza os cards no dashboard.
     * @returns {Promise<void>}
     */
    async function carregarVisaoGeralEstoque() {
        if (!totalItensSpan || !valorTotalVendaSpan || !valorTotalCustoSpan) return;
        totalItensSpan.textContent = '...';
        valorTotalVendaSpan.textContent = '...';
        valorTotalCustoSpan.textContent = '...';
        try {
            const data = await getVisaoGeralEstoque();
            // Nossos IDs no HTML: total-itens, valor-total-venda, valor-total-custo
            // Nossa API retorna: totalItensUnicos, valorTotalEstoqueVenda, valorTotalEstoqueCusto
            totalItensSpan.textContent = data.totalItensUnicos;
            valorTotalVendaSpan.textContent = formatarMoeda(data.valorTotalEstoqueVenda);
            valorTotalCustoSpan.textContent = formatarMoeda(data.valorTotalEstoqueCusto);
        } catch (error) {
            console.error("Erro ao buscar visão geral:", error);
            totalItensSpan.textContent = 'Erro';
            valorTotalVendaSpan.textContent = 'Erro';
            valorTotalCustoSpan.textContent = 'Erro';
        }
    }


    // --- 8. LÓGICA DOS MODAIS ---

    // --- Modal de PRODUTO (Adicionar/Editar) (CORRIGIDO) ---
    /**
     * Abre o modal de Produto, preenchendo os campos se for para edição.
     * @param {Object} [produto=null] - O objeto Produto a ser editado.
     * @returns {void}
     */
    function abrirModalProduto(produto = null) {
        itemParaEditar = produto;
        productForm.reset();
        if (produto) {
            productModalTitle.textContent = 'Editar Produto';
            productIdInput.value = produto.id;
            productNomeInput.value = produto.nome;
            productQuantidadeInput.value = produto.quantidade;
            productPrecoInput.value = produto.precoVenda;
            productCustoInput.value = produto.precoCusto; // <-- ADICIONADO
            productTipoInput.value = produto.tipo;
        } else {
            productModalTitle.textContent = 'Adicionar Novo Produto';
        }
        productModal.classList.remove('hidden');
        productModal.classList.add('flex');
    }
    function fecharModalProduto() {
        productModal.classList.add('hidden');
        productModal.classList.remove('flex');
        itemParaEditar = null;
    }
    addProductHeaderBtn?.addEventListener('click', () => abrirModalProduto());
    closeProductModalBtn?.addEventListener('click', fecharModalProduto);
    cancelProductBtn?.addEventListener('click', fecharModalProduto);

    productForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = productForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';

        const produto = {
            nome: productNomeInput.value,
            quantidade: parseInt(productQuantidadeInput.value),
            precoVenda: parseFloat(productPrecoInput.value),
            precoCusto: parseFloat(productCustoInput.value) || 0,
            tipo: productTipoInput.value
        };
        try {
            if (itemParaEditar) {
                await updateProduto(itemParaEditar.id, { ...produto, id: itemParaEditar.id });
                alert('Produto atualizado com sucesso!');
            } else {
                await addProduto(produto);
                alert('Produto adicionado com sucesso!');
            }
            fecharModalProduto();
            await carregarProdutosTabela();
            await carregarVisaoGeralEstoque();
        } catch (error) {
            alert(`Falha ao salvar produto: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar';
        }
    });

    // --- Modal de CLIENTE (Adicionar/Editar) (CORRIGIDO) ---
    function abrirModalCliente(cliente = null) {
        itemParaEditar = cliente;
        clienteForm.reset();
        if (cliente) {
            clienteModalTitle.textContent = 'Editar Cliente';
            clienteIdInput.value = cliente.id;
            clienteNomeInput.value = cliente.nome;
            clienteCnpjInput.value = cliente.cnpj;
            clienteEmailInput.value = cliente.email;
            clienteEnderecoInput.value = cliente.endereco;
        } else {
            clienteModalTitle.textContent = 'Cadastrar Novo Cliente';
        }
        clienteModal.classList.remove('hidden');
        clienteModal.classList.add('flex');
    }
    function fecharModalCliente() {
        clienteModal.classList.add('hidden');
        clienteModal.classList.remove('flex');
        itemParaEditar = null;
    }
    addClienteHeaderBtn?.addEventListener('click', () => abrirModalCliente());
    closeClienteModalBtn?.addEventListener('click', fecharModalCliente);
    cancelClienteBtn?.addEventListener('click', fecharModalCliente);

    clienteForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = clienteForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';
        const cliente = {
            nome: clienteNomeInput.value,
            cnpj: clienteCnpjInput.value,
            email: clienteEmailInput.value,
            endereco: clienteEnderecoInput.value,
            // Envia o status para a API (para o PUT preservar o status)
            status: itemParaEditar ? itemParaEditar.status : true
        };
        try {
            if (itemParaEditar) {
                await updateCliente(itemParaEditar.id, { ...cliente, id: itemParaEditar.id });
                alert('Cliente atualizado com sucesso!');
            } else {
                await addCliente(cliente);
                alert('Cliente cadastrado com sucesso!');
            }
            fecharModalCliente();
            await carregarClientesTabela();
        } catch (error) {
            alert(`Falha ao salvar cliente: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar Cliente';
        }
    });

    // --- Modal de FORNECEDOR (Adicionar/Editar) ---
    function abrirModalFornecedor(fornecedor = null) {
        itemParaEditar = fornecedor;
        fornecedorForm.reset();
        if (fornecedor) {
            fornecedorModalTitle.textContent = 'Editar Fornecedor';
            fornecedorIdInput.value = fornecedor.id;
            fornecedorNomeInput.value = fornecedor.nome;
            fornecedorCnpjInput.value = fornecedor.cnpj; // API usa 'cnpj'
            fornecedorEmailInput.value = fornecedor.email;
            fornecedorTelefoneInput.value = fornecedor.telefone;
            fornecedorEnderecoInput.value = fornecedor.endereco;
        } else {
            fornecedorModalTitle.textContent = 'Cadastrar Novo Fornecedor';
        }
        fornecedorModal.classList.remove('hidden');
        fornecedorModal.classList.add('flex');
    }
    function fecharModalFornecedor() {
        fornecedorModal.classList.add('hidden');
        fornecedorModal.classList.remove('flex');
        itemParaEditar = null;
    }
    addFornecedorHeaderBtn?.addEventListener('click', () => abrirModalFornecedor());
    closeFornecedorModalBtn?.addEventListener('click', fecharModalFornecedor);
    cancelFornecedorBtn?.addEventListener('click', fecharModalFornecedor);

    fornecedorForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = fornecedorForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';
        const fornecedor = {
            nome: fornecedorNomeInput.value,
            cnpj: fornecedorCnpjInput.value, // API usa 'cnpj'
            email: fornecedorEmailInput.value,
            telefone: fornecedorTelefoneInput.value,
            endereco: fornecedorEnderecoInput.value,
        };
        try {
            if (itemParaEditar) {
                await updateFornecedor(itemParaEditar.id, { ...fornecedor, id: itemParaEditar.id });
                alert('Fornecedor atualizado com sucesso!');
            } else {
                await addFornecedor(fornecedor);
                alert('Fornecedor cadastrado com sucesso!');
            }
            fecharModalFornecedor();
            await carregarFornecedoresTabela();
        } catch (error) {
            alert(`Falha ao salvar fornecedor: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar Fornecedor';
        }
    });

    // --- Modal de USUÁRIO (Adicionar/Editar) (CORRIGIDO) ---
    function abrirModalUsuario(usuario = null) {
        itemParaEditar = usuario;
        usuarioForm.reset();
        usuarioSenhaInput.placeholder = "Deixe em branco para não alterar";

        if (usuario) {
            usuarioModalTitle.textContent = 'Editar Usuário';
            usuarioIdInput.value = usuario.id;
            usuarioNomeInput.value = usuario.nome;
            usuarioEmailInput.value = usuario.email;
            usuarioRoleInput.value = (usuario.tipo || 'Funcionario').toLowerCase() === 'admin' ? 'admin' : 'user';
        } else {
            usuarioModalTitle.textContent = 'Cadastrar Novo Usuário';
            usuarioSenhaInput.placeholder = "Senha é obrigatória";
        }
        usuarioModal.classList.remove('hidden');
        usuarioModal.classList.add('flex');
    }
    function fecharModalUsuario() {
        usuarioModal.classList.add('hidden');
        usuarioModal.classList.remove('flex');
        itemParaEditar = null;
    }
    addUsuarioHeaderBtn?.addEventListener('click', () => abrirModalUsuario());
    closeUsuarioModalBtn?.addEventListener('click', fecharModalUsuario);
    cancelUsuarioBtn?.addEventListener('click', fecharModalUsuario);

    usuarioForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = usuarioForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';

        // Mapeia o 'value' do select (admin/user) para o 'tipo' da API (Admin/Funcionario)
        const tipoApi = usuarioRoleInput.value === 'admin' ? 'Admin' : 'Funcionario';

        const usuario = {
            nome: usuarioNomeInput.value,
            email: usuarioEmailInput.value,
            senha: usuarioSenhaInput.value,
            tipo: tipoApi, // Envia 'Admin' ou 'Funcionario'
            status: itemParaEditar ? itemParaEditar.status : true
        };

        if (itemParaEditar && !usuario.senha) {
            delete usuario.senha;
        }

        try {
            if (itemParaEditar) {
                await updateUsuario(itemParaEditar.id, { ...usuario, id: itemParaEditar.id });
                alert('Usuário atualizado com sucesso!');
            } else {
                await addUsuario(usuario);
                alert('Usuário cadastrado com sucesso!');
            }
            fecharModalUsuario();
            await carregarUsuariosTabela();
        } catch (error) {
            alert(`Falha ao salvar usuário: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar Usuário';
        }
    });

    // --- Modal de PEDIDO (Gerar) ---
    /**
     * Abre o modal de geração de novo pedido, limpando o estado `pedidoItems`.
     * @returns {void}
     */-
    function abrirModalPedido() {
        if (!pedidoModal || !pedidoForm) {
            console.error("Erro Fatal: O HTML do Modal de Pedido não foi encontrado.");
            return;
        }
        pedidoForm.reset();
        pedidoItems = [];
        renderizarItensPedido();
        pedidoModal.classList.remove('hidden');
        pedidoModal.classList.add('flex');
    }
    function fecharModalPedido() {
        if (pedidoModal) {
            pedidoModal.classList.add('hidden');
            pedidoModal.classList.remove('flex');
        }
    }
    openPedidoModalBtn?.addEventListener('click', abrirModalPedido);
    closePedidoModalBtn?.addEventListener('click', fecharModalPedido);
    cancelPedidoBtn?.addEventListener('click', fecharModalPedido);

    /**
     * Renderiza os itens atuais do pedido no corpo da tabela do modal e calcula o valor total.
     * @returns {void}
     */
    function renderizarItensPedido() {
        pedidoItemsListBody.innerHTML = '';
        let valorTotalPedido = 0;

        if (pedidoItems.length === 0) {
            pedidoItemsListBody.innerHTML = '<tr><td class="p-3 text-center text-gray-500" colspan="5">Nenhum item adicionado.</td></tr>';
            pedidoValorTotalSpan.textContent = 'R$ 0,00';
            return;
        }

        pedidoItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700';

            const produto = todosOsProdutos.find(p => p.id === item.produtoId);
            const produtoNome = produto?.nome || 'Produto Desconhecido';
            const precoVenda = produto?.precoVenda || 0;
            const subtotal = item.quantidade * precoVenda;
            valorTotalPedido += subtotal;

            tr.innerHTML = `
                <td class="p-3">${produtoNome}</td>
                <td class="p-3">${item.quantidade}</td>
                <td class="p-3">${formatarMoeda(precoVenda)}</td>
                <td class="p-3">${formatarMoeda(subtotal)}</td>
                <td class="p-3">
                    <button type="button" data-index="${index}" class="text-red-500 hover:text-red-400 pedido-remove-item-btn">
                        <i class="fa fa-trash-alt"></i>
                    </button>
                </td>
            `;
            pedidoItemsListBody.appendChild(tr);
        });
        pedidoValorTotalSpan.textContent = formatarMoeda(valorTotalPedido);
    }
    pedidoAddItemBtn?.addEventListener('click', () => {
        const produtoId = parseInt(pedidoItemProdutoSelect.value);
        const quantidade = parseInt(pedidoItemQtdInput.value);
        if (!produtoId || !(quantidade > 0)) {
            alert('Selecione um produto e uma quantidade válida.');
            return;
        }
        const produtoSelecionado = todosOsProdutos.find(p => p.id === produtoId);
        if (produtoSelecionado && produtoSelecionado.quantidade < quantidade) {
            alert(`Estoque insuficiente para "${produtoSelecionado.nome}".\nDisponível: ${produtoSelecionado.quantidade}`);
            return;
        }
        const itemExistente = pedidoItems.find(item => item.produtoId === produtoId);
        if (itemExistente) {
            alert(`"${produtoSelecionado.nome}" já foi adicionado. Remova-o se quiser alterar a quantidade.`);
            return;
        }
        pedidoItems.push({
            produtoId: produtoId,
            quantidade: quantidade
        });
        renderizarItensPedido();
        pedidoItemProdutoSelect.value = '';
        pedidoItemQtdInput.value = '';
    });
    pedidoItemsListBody?.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.pedido-remove-item-btn');
        if (removeBtn) {
            const indexToRemove = parseInt(removeBtn.dataset.index);
            pedidoItems.splice(indexToRemove, 1);
            renderizarItensPedido();
        }
    });
    pedidoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = pedidoForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Gerando...';
        const clienteIdStr = pedidoClienteSelect.value;
        if (!clienteIdStr || pedidoItems.length === 0) {
            alert("Selecione um cliente e adicione pelo menos um produto ao pedido.");
            btn.disabled = false; btn.textContent = 'Gerar Pedido';
            return;
        }
        const pedido = {
            clienteId: parseInt(clienteIdStr),
            itens: pedidoItems // API espera 'itens'
        };
        try {
            await addPedido(pedido);
            alert('Pedido gerado com sucesso!');
            fecharModalPedido();
            await carregarProdutosTabela();
            await carregarVisaoGeralEstoque();
            await carregarPedidosTabela();
        } catch (error) {
            // (CORRIGIDO) Mostra o erro da API (ex: "Estoque insuficiente")
            alert(`Falha ao gerar pedido: ${error.response?.data || error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Gerar Pedido';
        }
    });

    // --- Modal de NOTA FISCAL (Lançar/Editar/XML) ---
    /**
     * Abre o modal de Nota Fiscal (para lançamento manual, importação XML ou visualização).
     * @param {Object} [nota=null] - O objeto Nota Fiscal para visualização.
     * @returns {void}
     */
    function abrirModalNotaFiscal(nota = null) {
        itemParaEditar = nota;
        nfManualForm.reset();
        nfXmlForm.reset();
        nfItems = [];

        if (nota) {
            nfModalTitle.textContent = `Visualizar Nota Nº ${nota.numeroNota}`;
            nfModalTabs.classList.add('hidden');
            mostrarAbaNF('manual');
            nfIdInput.value = nota.id;
            nfNumeroInput.value = nota.numeroNota;
            nfFornecedorSelect.value = nota.fornecedorId;
            if (nota.dataEmissao) {
                nfDataInput.value = nota.dataEmissao.split('T')[0];
            }

            nfItems = nota.itens.map(item => ({
                produtoId: item.produtoId,
                produtoNome: item.produto?.nome || 'Produto Carregado',
                quantidade: item.quantidade,
                precoCustoUnitario: item.precoCustoUnitario
            }));

            nfNumeroInput.disabled = true;
            nfFornecedorSelect.disabled = true;
            nfDataInput.disabled = true;
            nfAddItemBox.classList.add('hidden');
            nfManualForm.querySelector('button[type="submit"]').classList.add('hidden'); // Esconde o botão salvar

        } else {
            nfModalTitle.textContent = 'Lançar Nota Fiscal de Entrada';
            nfModalTabs.classList.remove('hidden');
            mostrarAbaNF('manual');
            nfNumeroInput.disabled = false;
            nfFornecedorSelect.disabled = false;
            nfDataInput.disabled = false;
            nfAddItemBox.classList.remove('hidden');
            nfManualForm.querySelector('button[type="submit"]').classList.remove('hidden'); // Mostra o botão salvar
        }
        renderizarItensNF();
        notaFiscalModal.classList.remove('hidden');
        notaFiscalModal.classList.add('flex');
    }
    function fecharModalNotaFiscal() {
        notaFiscalModal.classList.add('hidden');
        notaFiscalModal.classList.remove('flex');
        itemParaEditar = null;
    }
    function mostrarAbaNF(aba) {
        if (aba === 'manual') {
            nfTabManualBtn.classList.add('active');
            nfTabXmlBtn.classList.remove('active');
            nfTabManualContent.classList.add('active');
            nfTabXmlContent.classList.remove('active');
        } else {
            nfTabManualBtn.classList.remove('active');
            nfTabXmlBtn.classList.add('active');
            nfTabManualContent.classList.remove('active');
            nfTabXmlContent.classList.add('active');
        }
    }
    openNotaFiscalModalBtn?.addEventListener('click', () => abrirModalNotaFiscal(null));
    closeNotaFiscalModalBtn?.addEventListener('click', fecharModalNotaFiscal);
    cancelNotaFiscalBtn?.addEventListener('click', fecharModalNotaFiscal);
    cancelNotaFiscalXmlBtn?.addEventListener('click', fecharModalNotaFiscal);
    nfTabManualBtn?.addEventListener('click', () => mostrarAbaNF('manual'));
    nfTabXmlBtn?.addEventListener('click', () => mostrarAbaNF('xml'));

    /**
     * Renderiza os itens da Nota Fiscal no corpo da tabela do modal e calcula o valor total.
     * @returns {void}
     */
    function renderizarItensNF() {
        if (!nfItemsListBody) return;
        nfItemsListBody.innerHTML = '';
        let valorTotalNota = 0;

        if (nfItems.length === 0) {
            nfItemsListBody.innerHTML = '<tr><td class="p-3 text-center text-gray-500" colspan="5">Nenhum item adicionado.</td></tr>';
            nfValorTotalSpan.textContent = 'R$ 0,00';
            return;
        }

        nfItems.forEach((item, index) => {
            const custoUnitario = item.precoCustoUnitario || 0;
            const totalItem = (item.quantidade || 0) * custoUnitario;
            valorTotalNota += totalItem;

            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700';
            const produtoNome = todosOsProdutos.find(p => p.id === item.produtoId)?.nome || item.produtoNome || 'Produto Desconhecido';

            const acoesItemHtml = itemParaEditar ? '' : `
                <button type="button" data-index="${index}" class="text-red-500 hover:text-red-400 nf-remove-item-btn">
                    <i class="fa fa-trash-alt"></i>
                </button>
            `;

            tr.innerHTML = `
                <td class="p-3">${produtoNome}</td>
                <td class="p-3">${item.quantidade}</td>
                <td class="p-3">${formatarMoeda(custoUnitario)}</td>
                <td class="p-3">${formatarMoeda(totalItem)}</td>
                <td class="p-3">${acoesItemHtml}</td>
            `;
            nfItemsListBody.appendChild(tr);
        });
        nfValorTotalSpan.textContent = formatarMoeda(valorTotalNota);
    }
    nfAddItemBtn?.addEventListener('click', () => {
        const produtoSelect = document.getElementById('nf-item-produto');
        const qtdInput = document.getElementById('nf-item-qtd');
        const custoInput = document.getElementById('nf-item-custo');

        const produtoId = parseInt(produtoSelect.value);
        const quantidade = parseInt(qtdInput.value);
        const custoUnitario = parseFloat(custoInput.value);

        if (!produtoId || !(quantidade > 0) || !(custoUnitario >= 0)) {
            alert('Por favor, preencha Produto, Quantidade e Custo Unitário com valores válidos.');
            return;
        }
        const produtoNome = produtoSelect.options[produtoSelect.selectedIndex].text;

        nfItems.push({
            produtoId: produtoId,
            produtoNome: produtoNome,
            quantidade: quantidade,
            precoCustoUnitario: custoUnitario // Nome da propriedade da API
        });
        renderizarItensNF();

        produtoSelect.value = '';
        qtdInput.value = '';
        custoInput.value = '';
    });
    nfItemsListBody?.addEventListener('click', (e) => {
        if (itemParaEditar) return;

        const removeBtn = e.target.closest('.nf-remove-item-btn');
        if (removeBtn) {
            const indexToRemove = parseInt(removeBtn.dataset.index);
            nfItems.splice(indexToRemove, 1);
            renderizarItensNF();
        }
    });
    nfManualForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (itemParaEditar) {
            fecharModalNotaFiscal();
            return;
        }

        const btn = nfManualForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';

        const notaFiscal = {
            fornecedorId: parseInt(nfFornecedorSelect.value),
            numeroNota: nfNumeroInput.value,
            dataEmissao: nfDataInput.value,
            itens: nfItems.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoCustoUnitario: item.precoCustoUnitario
            }))
        };

        if (!notaFiscal.fornecedorId || !notaFiscal.numeroNota || !notaFiscal.dataEmissao || notaFiscal.itens.length === 0) {
            alert('Por favor, preencha os dados da nota e adicione pelo menos um item.');
            btn.disabled = false; btn.textContent = 'Salvar Nota Fiscal';
            return;
        }

        try {
            await addNotaFiscalManual(notaFiscal);
            alert('Nota Fiscal de Entrada lançada com sucesso!');
            fecharModalNotaFiscal();
            await carregarProdutosTabela();
            await carregarVisaoGeralEstoque();
            await carregarNotasFiscaisTabela();
        } catch (error) {
            alert(`Falha ao salvar nota: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar Nota Fiscal';
        }
    });
    nfXmlForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('nf-xml-file');
        const file = fileInput?.files[0];

        if (!file) {
            alert('Por favor, selecione um arquivo XML.');
            return;
        }

        // Valida se é realmente um arquivo XML
        if (!file.name.toLowerCase().endsWith('.xml')) {
            alert('Por favor, selecione um arquivo XML válido.');
            return;
        }

        const btn = nfXmlForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Importando XML...';

        try {
            // Cria o FormData para enviar o arquivo
            const formData = new FormData();
            formData.append('arquivo', file); // Nome deve ser 'arquivo' (igual ao parâmetro do backend)

            // Envia para a API
            const resultado = await addNotaFiscalXml(formData);

            // Monta mensagem de sucesso detalhada
            let mensagemSucesso = `✅ ${resultado.mensagem}\n\n`;
            mensagemSucesso += `📄 Número da Nota: ${resultado.numeroNota}\n`;
            mensagemSucesso += `🏢 Fornecedor: ${resultado.fornecedor}\n`;
            mensagemSucesso += `💰 Valor Total: ${formatarMoeda(resultado.valorTotal)}\n`;
            mensagemSucesso += `📦 Total de Itens: ${resultado.totalItens}`;

            alert(mensagemSucesso);

            fecharModalNotaFiscal();

            // Recarrega os dados
            await carregarProdutosTabela();
            await carregarVisaoGeralEstoque();
            await carregarNotasFiscaisTabela();

        } catch (error) {
            console.error('Erro ao importar XML:', error);

            // Exibe mensagem de erro mais detalhada
            let mensagemErro = '❌ Falha ao importar XML:\n\n';

            if (error.response?.data) {
                // Se o backend retornou uma mensagem específica
                if (typeof error.response.data === 'string') {
                    mensagemErro += error.response.data;
                } else if (error.response.data.message) {
                    mensagemErro += error.response.data.message;
                } else {
                    mensagemErro += JSON.stringify(error.response.data);
                }
            } else {
                mensagemErro += error.message || 'Erro desconhecido ao importar XML';
            }

            alert(mensagemErro);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
            fileInput.value = ''; // Limpa o input de arquivo
        }
    });
    // Preview do arquivo XML selecionado
    const nfXmlFileInput = document.getElementById('nf-xml-file');

    nfXmlFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const label = nfXmlFileInput.closest('.mb-4')?.querySelector('label');

        if (file) {
            const tamanhoKB = (file.size / 1024).toFixed(2);
            const info = document.createElement('p');
            info.className = 'text-xs text-green-400 mt-2';
            info.id = 'nf-xml-file-info';
            info.innerHTML = `✅ ${file.name} (${tamanhoKB} KB)`;

            // Remove info anterior se existir
            const infoAnterior = document.getElementById('nf-xml-file-info');
            if (infoAnterior) {
                infoAnterior.remove();
            }

            // Adiciona a nova info
            nfXmlFileInput.parentElement.appendChild(info);
        }
    });



    // --- 9. LÓGICA DE AÇÃO (Editar/Excluir Genérico) ---

    /**
     * Função genérica que trata o clique em botões de ação (Editar/Deletar)
     * nas tabelas, buscando o item na API e abrindo o modal correspondente.
     * @param {Event} e - O evento de clique.
     * @param {string} tipo - O tipo do item ('produto', 'cliente', etc.).
     * @param {string} [idOverride=null] - ID opcional, usado para cliques em linha (como em Pedidos).
     * @returns {Promise<void>}
     */
    productsTableBody?.addEventListener('click', (e) => handleTableClick(e, 'produto'));
    clientesTableBody?.addEventListener('click', (e) => handleTableClick(e, 'cliente'));
    fornecedoresTableBody?.addEventListener('click', (e) => handleTableClick(e, 'fornecedor'));
    usuariosTableBody?.addEventListener('click', (e) => handleTableClick(e, 'usuario'));
    notasFiscaisTableBody?.addEventListener('click', (e) => handleTableClick(e, 'nota-fiscal'));
    // (NOVO) Listener para clique na linha do pedido
    pedidosTableBody?.addEventListener('click', (e) => {
        const row = e.target.closest('.pedido-row-clickable');
        if (row) {
            const id = row.dataset.id;
            handleTableClick(e, 'pedido', id);
        }
    });


    async function handleTableClick(e, tipo, idOverride = null) {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        // (ATUALIZADO) Pega o ID da linha (clique) ou do botão
        const id = idOverride || editBtn?.dataset.id || deleteBtn?.dataset.id;

        if (!id) return;

        // (NOVO) Lógica para abrir modal de detalhe do pedido
        if (tipo === 'pedido' && !editBtn && !deleteBtn) {
            try {
                const pedido = await getPedido(id);
                abrirModalDetalhePedido(pedido);
            } catch (error) {
                alert(`Não foi possível carregar os detalhes do pedido: ${error.message}`);
            }
            return;
        }

        if (editBtn) {
            try {
                if (tipo === 'produto') {
                    const produto = await getProduto(id);
                    abrirModalProduto(produto);
                } else if (tipo === 'cliente') {
                    const cliente = await getCliente(id);
                    abrirModalCliente(cliente);
                } else if (tipo === 'fornecedor') {
                    const fornecedor = await getFornecedor(id);
                    abrirModalFornecedor(fornecedor);
                } else if (tipo === 'usuario') {
                    const usuario = await getUsuario(id);
                    abrirModalUsuario(usuario);
                } else if (tipo === 'nota-fiscal') {
                    const nota = await getNotaFiscal(id);
                    abrirModalNotaFiscal(nota);
                }
            } catch (error) {
                alert(`Não foi possível carregar o item para edição: ${error.message}`);
            }
        }

        if (deleteBtn) {
            itemParaExcluir = {
                id: id,
                tipo: tipo,
                nome: deleteBtn.dataset.nome || 'este item'
            };
            abrirModalExclusao();
        }
    }

    // --- Modal de EXCLUSÃO (Genérico - Soft Delete) ---
    /**
     * Abre o modal de confirmação de exclusão/inativação, ajustando a mensagem
     * e o botão de acordo com o tipo do item (`itemParaExcluir.tipo`).
     * @returns {void}
     */
    function abrirModalExclusao() {
        // (CORRIGIDO) Muda a mensagem para soft delete
        if (itemParaExcluir.tipo === 'cliente' || itemParaExcluir.tipo === 'usuario') {
            deleteConfirmMessage.textContent = `Você tem certeza que deseja INATIVAR "${itemParaExcluir.nome}"? O histórico será mantido.`;
            confirmDeleteBtn.textContent = 'Inativar';
            confirmDeleteBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
            confirmDeleteBtn.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
        } else {
            deleteConfirmMessage.textContent = `Você tem certeza que deseja EXCLUIR "${itemParaExcluir.nome}"? Esta ação não pode ser desfeita.`;
            confirmDeleteBtn.textContent = 'Excluir';
            confirmDeleteBtn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
            confirmDeleteBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        }
        deleteModal.classList.remove('hidden');
        deleteModal.classList.add('flex');
    }
    function fecharModalExclusao() {
        deleteModal.classList.add('hidden');
        deleteModal.classList.remove('flex');
        itemParaExcluir = { id: null, tipo: null, nome: null };
    }
    cancelDeleteBtn?.addEventListener('click', fecharModalExclusao);

    confirmDeleteBtn?.addEventListener('click', async () => {
        if (!itemParaExcluir.id || !itemParaExcluir.tipo) return;

        const originalText = confirmDeleteBtn.textContent;
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Processando...';

        try {
            let alertMessage = 'Item processado com sucesso!';

            if (itemParaExcluir.tipo === 'produto') {
                await deleteProduto(itemParaExcluir.id);
                await carregarProdutosTabela();
                await carregarVisaoGeralEstoque();
                alertMessage = 'Produto excluído com sucesso!';
            } else if (itemParaExcluir.tipo === 'cliente') {
                await deleteCliente(itemParaExcluir.id); // Soft delete
                await carregarClientesTabela();
                alertMessage = 'Cliente inativado com sucesso!';
            } else if (itemParaExcluir.tipo === 'fornecedor') {
                await deleteFornecedor(itemParaExcluir.id);
                await carregarFornecedoresTabela();
                alertMessage = 'Fornecedor excluído com sucesso!';
            } else if (itemParaExcluir.tipo === 'usuario') {
                await deleteUsuario(itemParaExcluir.id); // Soft delete
                await carregarUsuariosTabela();
                alertMessage = 'Usuário inativado com sucesso!';
            } else if (itemParaExcluir.tipo === 'nota-fiscal') {
                await deleteNotaFiscal(itemParaExcluir.id);
                await carregarNotasFiscaisTabela();
                alertMessage = 'Nota Fiscal excluída com sucesso!';
            }
            alert(alertMessage);
            fecharModalExclusao();
        } catch (error) {
            alert(`Falha ao processar: ${error.response?.data || error.message}`);
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = originalText;
        }
    });
    const pedidoDetalheModal = document.getElementById('pedido-detalhe-modal');
    const closePedidoDetalheBtn = document.getElementById('close-pedido-detalhe-modal-btn');
    const pedidoDetalheIdInput = document.getElementById('pedido-detalhe-id');
    const pedidoDetalheCliente = document.getElementById('pedido-detalhe-cliente');
    const pedidoDetalheData = document.getElementById('pedido-detalhe-data');
    const pedidoDetalheValor = document.getElementById('pedido-detalhe-valor');
    const pedidoDetalheItensTbody = document.getElementById('pedido-detalhe-itens-tbody');
    const pedidoDetalheStatusSelect = document.getElementById('pedido-detalhe-status-select');
    const pedidoDetalheSalvarStatusBtn = document.getElementById('pedido-detalhe-salvar-status-btn');

    // --- Modal de DETALHE DO PEDIDO ---
    /**
     * Abre o modal de detalhes do pedido, preenchendo as informações e listando os itens.
     * Permite a alteração de status.
     * @param {Object} pedido - O objeto Pedido completo retornado pela API.
     * @returns {void}
     */
    function abrirModalDetalhePedido(pedido) {
        if (!pedidoDetalheModal) {
            console.error("Modal de detalhe do pedido não encontrado!");
            return;
        }

        // Preenche os dados básicos
        pedidoDetalheIdInput.value = pedido.id;
        pedidoDetalheCliente.textContent = pedido.cliente?.nome || pedido.nomeCliente || 'N/A';
        pedidoDetalheData.textContent = formatarData(pedido.dataPedido);
        pedidoDetalheStatusSelect.value = pedido.status || 'Pendente';

        // Renderiza os itens
        pedidoDetalheItensTbody.innerHTML = '';

        const itens = pedido.pedidoItens || [];

        if (itens && itens.length > 0) {
            let valorTotalCalculado = 0;

            itens.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-gray-700';

                // Pega o nome do produto
                const nomeProduto = item.produto?.nome || item.nomeProduto || 'Produto Desconhecido';

                // CORRIGIDO: Pega o preço do produto
                const precoUnit = item.precoUnitario || item.produto?.precoVenda || 0;
                const quantidade = item.quantidade || 0;
                const subtotal = quantidade * precoUnit;

                valorTotalCalculado += subtotal;

                tr.innerHTML = `
                <td class="p-3">${nomeProduto}</td>
                <td class="p-3">${quantidade}</td>
                <td class="p-3">${formatarMoeda(precoUnit)}</td>
                <td class="p-3">${formatarMoeda(subtotal)}</td>
            `;
                pedidoDetalheItensTbody.appendChild(tr);
            });

            // Atualiza o valor total calculado
            pedidoDetalheValor.textContent = formatarMoeda(valorTotalCalculado);

        } else {
            pedidoDetalheItensTbody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-gray-500">Nenhum item encontrado.</td></tr>';
            pedidoDetalheValor.textContent = formatarMoeda(0);
        }

        // Abre o modal
        pedidoDetalheModal.classList.remove('hidden');
        pedidoDetalheModal.classList.add('flex');
    }
    function fecharModalDetalhePedido() {
        if (pedidoDetalheModal) {
            pedidoDetalheModal.classList.add('hidden');
            pedidoDetalheModal.classList.remove('flex');
        }
    }

    closePedidoDetalheBtn?.addEventListener('click', fecharModalDetalhePedido);

    // Salvar Status do Pedido
    pedidoDetalheSalvarStatusBtn?.addEventListener('click', async () => {
        const pedidoId = pedidoDetalheIdInput.value;
        const novoStatus = pedidoDetalheStatusSelect.value;

        if (!pedidoId || !novoStatus) {
            alert('Erro ao obter dados do pedido.');
            return;
        }

        const btn = pedidoDetalheSalvarStatusBtn;
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        try {
            await updatePedidoStatus(pedidoId, novoStatus);
            alert('Status do pedido atualizado com sucesso!');
            fecharModalDetalhePedido();
            await carregarPedidosTabela(); // Recarrega a tabela
        } catch (error) {
            alert(`Falha ao atualizar status: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });


    // --- (NOVO) FILTROS DE STATUS DOS PEDIDOS ---

    const pedidosFilterButtons = document.getElementById('pedidos-filter-buttons');

    pedidosFilterButtons?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.pedido-filtro-btn');
        if (!btn) return;

        // Remove a classe 'active' de todos os botões
        const allFilterBtns = pedidosFilterButtons.querySelectorAll('.pedido-filtro-btn');
        allFilterBtns.forEach(b => b.classList.remove('active'));

        // Adiciona 'active' ao botão clicado
        btn.classList.add('active');

        // Pega o status do botão
        const status = btn.dataset.status;

        // Carrega os pedidos com o filtro (null = todos)
        if (status === 'todos') {
            await carregarPedidosTabela(null);
        } else {
            await carregarPedidosTabela(status);
        }
    });

    // --- 10. INICIALIZAÇÃO (CORRIGIDO) ---
    /**
     * Bloco de inicialização da aplicação, executado ao carregar o DOM.
     * Define a tela inicial e carrega todos os dados iniciais da API.
     * @returns {void}
     */
    // ... (Código de inicialização e carregamento inicial) ...
    mostrarTela(inicioContent, 'Início');
    setAtivo(navInicioBtn);

    // Carrega todos os dados necessários em segundo plano
    // (A verificação de 'userRole' foi REMOVIDA)
    carregarVisaoGeralEstoque();
    carregarProdutosTabela();
    carregarPedidosTabela();
    carregarClientesTabela();
    carregarFornecedoresTabela();
    carregarUsuariosTabela();
    carregarNotasFiscaisTabela();
});