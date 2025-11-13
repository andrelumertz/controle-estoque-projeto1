// script.js
import {
    getProdutos, addProduto, updateProduto, deleteProduto, getProduto,
    getClientes, getCliente, addCliente, updateCliente, deleteCliente,
    getFornecedores, getFornecedor, addFornecedor, updateFornecedor, deleteFornecedor,
    getUsuarios, getUsuario, addUsuario, updateUsuario, deleteUsuario,
    getPedidos, addPedido,
    getNotasFiscais, getNotaFiscal, addNotaFiscalManual, updateNotaFiscal, deleteNotaFiscal, addNotaFiscalXml, // Funções de NF
    getVisaoGeralEstoque
} from './services/api.js';

// --- Variável Global de Role ---
let userRole = 'user';

/**
 * (FUNÇÃO CORRIGIDA) Esconde todos os elementos de admin.
 * Esta função agora é chamada DEPOIS que a página carrega.
 */
function applyUserRoleLimits() {
    // Se a role não for 'admin', esconde tudo
    if (userRole !== 'admin') {
        const adminElements = document.querySelectorAll('[data-role="admin"]');
        adminElements.forEach(el => {
            el.classList.add('hidden');
        });

        const adminHeaders = document.querySelectorAll('[data-role="admin-header"]');
        adminHeaders.forEach(th => {
            th.classList.add('hidden');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GUARDA DE AUTENTICAÇÃO E ROLE ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return; // Para a execução do script
    }

    // Pega a role salva no login E CONVERTE PARA MINÚSCULAS (mais seguro)
    userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';


    // --- 2. DEFINIÇÃO DE ELEMENTOS (DOM) ---
    // Mapeia todas as IDs do HTML para variáveis JavaScript

    // Elementos Globais
    const menuButton = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const menuIcon = document.getElementById('menu-icon');
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const headerTitle = document.getElementById('header-title');

    // Navegação (Telas)
    const navInicioBtn = document.getElementById('nav-inicio-btn');
    const navProdutosBtn = document.getElementById('nav-produtos-btn');
    const navPedidosBtn = document.getElementById('nav-pedidos-btn');
    const navNotasFiscaisBtn = document.getElementById('nav-notas-fiscais-btn'); // NOVO
    const navClientesBtn = document.getElementById('nav-clientes-btn');
    const navFornecedoresBtn = document.getElementById('nav-fornecedores-btn');
    const navUsuariosBtn = document.getElementById('nav-usuarios-btn');
    const inicioContent = document.getElementById('inicio-content');
    const produtosContent = document.getElementById('produtos-content');
    const pedidosContent = document.getElementById('pedidos-content');
    const notasFiscaisContent = document.getElementById('notas-fiscais-content'); // NOVO
    const clientesContent = document.getElementById('clientes-content');
    const fornecedoresContent = document.getElementById('fornecedores-content');
    const usuariosContent = document.getElementById('usuarios-content');

    // Tela de PRODUTOS
    const productsTableBody = document.getElementById('products-table-body');
    const searchProdutoInput = document.getElementById('search-produto-input');
    const totalItensSpan = document.getElementById('total-itens');
    const valorTotalSpan = document.getElementById('valor-total');
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

    // Tela de NOTAS FISCAIS (NOVO)
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
    const nfAddItemBtn = document.getElementById('nf-add-item-btn');
    const nfItemsListBody = document.getElementById('nf-items-list-body');
    const nfValorTotalSpan = document.getElementById('nf-valor-total');
    let nfItems = []; // Array temporário

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


    // --- 4. APLICA LIMITES DE ROLE ---
    applyUserRoleLimits();


    // --- 5. EVENT LISTENERS GLOBAIS (Sidebar, Logout) ---
    menuButton?.addEventListener('click', () => {
        sidebar?.classList.toggle('-translate-x-full');
        mainContent?.classList.toggle('md:ml-64');
        menuIcon?.classList.toggle('fa-bars');
        menuIcon?.classList.toggle('fa-times');
    });

    const handleLogout = () => {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        }
    };
    logoutBtn?.addEventListener('click', handleLogout);
    headerLogoutBtn?.addEventListener('click', handleLogout);


    // --- 6. LÓGICA DE NAVEGAÇÃO ENTRE TELAS ---
    const navButtons = [navInicioBtn, navProdutosBtn, navPedidosBtn, navClientesBtn, navFornecedoresBtn, navUsuariosBtn, navNotasFiscaisBtn];
    const contentScreens = [inicioContent, produtosContent, pedidosContent, clientesContent, fornecedoresContent, usuariosContent, notasFiscaisContent];

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

    navInicioBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(inicioContent, 'Início');
        setAtivo(navInicioBtn);
    });
    navProdutosBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(produtosContent, 'Lista de Produtos');
        setAtivo(navProdutosBtn);
    });
    navPedidosBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(pedidosContent, 'Lista de Pedidos');
        setAtivo(navPedidosBtn);
    });
    navNotasFiscaisBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(notasFiscaisContent, 'Lista de Notas Fiscais');
        setAtivo(navNotasFiscaisBtn);
    });
    navClientesBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(clientesContent, 'Lista de Clientes');
        setAtivo(navClientesBtn);
    });
    navFornecedoresBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(fornecedoresContent, 'Lista de Fornecedores');
        setAtivo(navFornecedoresBtn);
    });
    navUsuariosBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(usuariosContent, 'Lista de Usuários');
        setAtivo(navUsuariosBtn);
    });
    // --- Fim da Lógica de Navegação ---


    // --- 7. FUNÇÕES DE DADOS (Carregar e Renderizar Tabelas) ---

   // --- PRODUTOS ---
    function renderizarTabelaProdutos(produtos) {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = '';
        if (produtos.length === 0) {
            const msg = searchProdutoInput.value ? "Nenhum produto encontrado." : "Nenhum produto cadastrado.";
            // (MUDANÇA) Colspan de 7 para 6
            productsTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            const precoFormatado = typeof produto.precoVenda === 'number' ? produto.precoVenda.toFixed(2).replace('.', ',') : 'N/A';
            
            // (MUDANÇA) Lógica do statusHtml REMOVIDA daqui
            
            const acoesHtml = userRole === 'admin' ? `
                <button data-id="${produto.id}" data-nome="${produto.nome}" class="text-purple-400 hover:text-purple-300 mr-3 edit-btn" title="Editar">
                    <i class="fa fa-pencil-alt"></i>
                </button>
                <button data-id="${produto.id}" data-nome="${produto.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            ` : 'Visualização';
            
            tr.innerHTML = `
                <td class="p-3 hidden sm:table-cell">${produto.nome || 'N/A'}</td>
                <td class="p-3 sm:hidden">${produto.nome || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${produto.quantidade ?? 'N/A'}</td>
                <td class="p-3 sm:hidden">${produto.quantidade ?? 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">R$ ${precoFormatado}</td>
                <td class="p-3" ${userRole !== 'admin' ? 'hidden' : ''}>${acoesHtml}</td>
            `;
            productsTableBody.appendChild(tr);
        });
    }
    async function carregarProdutosTabela() {
        if (!productsTableBody) return;
        // (MUDANÇA) Colspan de 7 para 6
        productsTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const produtos = await getProdutos();
            todosOsProdutos = produtos;
            renderizarTabelaProdutos(todosOsProdutos);
            // Popula dropdowns
            pedidoItemProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>';
            nfItemProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>';
            todosOsProdutos.forEach(p => {
                const optionHtml = `<option value="${p.id}">${p.nome}</option>`;
                pedidoItemProdutoSelect.innerHTML += optionHtml;
                nfItemProdutoSelect.innerHTML += optionHtml;
            });
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            // (MUDANÇA) Colspan de 7 para 6
            productsTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-red-500">Falha ao carregar produtos.</td></tr>`;
        }
    }

    // --- CLIENTES ---
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
            const acoesHtml = userRole === 'admin' ? `
                <button data-id="${cliente.id}" data-nome="${cliente.nome}" class="text-purple-400 hover:text-purple-300 mr-3 edit-btn" title="Editar">
                    <i class="fa fa-pencil-alt"></i>
                </button>
                <button data-id="${cliente.id}" data-nome="${cliente.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            ` : 'Visualização';
            tr.innerHTML = `
                <td class="p-3">${cliente.nome || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${cliente.cnpj || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${cliente.email || 'N/A'}</td>
                <td class="p-3" ${userRole !== 'admin' ? 'hidden' : ''}>${acoesHtml}</td>
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
            pedidoClienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
            todosOsClientes.forEach(c => {
                pedidoClienteSelect.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });
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

    // --- FORNECEDORES ---
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
            const acoesHtml = userRole === 'admin' ? `
                <button data-id="${f.id}" data-nome="${f.nome}" class="text-purple-400 hover:text-purple-300 mr-3 edit-btn" title="Editar">
                    <i class="fa fa-pencil-alt"></i>
                </button>
                <button data-id="${f.id}" data-nome="${f.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            ` : 'Visualização';
            tr.innerHTML = `
                <td class="p-3">${f.nome || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${f.cnpj || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${f.telefone || 'N/A'}</td>
                <td class="p-3" ${userRole !== 'admin' ? 'hidden' : ''}>${acoesHtml}</td>
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
            nfFornecedorSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
            todosOsFornecedores.forEach(f => {
                nfFornecedorSelect.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
            });
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

    // --- USUÁRIOS ---
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
            const roleApi = (usuario.tipo || 'user').toLowerCase();
            const displayRole = roleApi === 'admin'
                ? 'User Administrador'
                : 'User Padrão';
            const statusHtml = usuario.status === true
                ? '<span class="bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Ativo</span>'
                : '<span class="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Inativo</span>';
            const acoesHtml = userRole === 'admin' ? `
                <button data-id="${usuario.id}" data-nome="${usuario.nome}" class="text-purple-400 hover:text-purple-300 mr-3 edit-btn" title="Editar">
                    <i class="fa fa-pencil-alt"></i>
                </button>
                <button data-id="${usuario.id}" data-nome="${usuario.nome}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
                    <i class="fa fa-trash-alt"></i>
                </button>
            ` : 'Visualização';
            tr.innerHTML = `
                <td class="p-3">${usuario.nome || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${usuario.email || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${displayRole}</td>
                <td class="p-3">${statusHtml}</td>
                <td class="p-3" ${userRole !== 'admin' ? 'hidden' : ''}>${acoesHtml}</td>
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

    // --- PEDIDOS ---
    function renderizarTabelaPedidos(pedidos) {
        if (!pedidosTableBody) return;
        pedidosTableBody.innerHTML = '';
        if (pedidos.length === 0) {
            const msg = searchPedidoInput.value ? "Nenhum pedido encontrado." : "Nenhum pedido cadastrado.";
            // Colspan atualizado para 5 colunas
            pedidosTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';

            // Formata a Data
            let dataFormatada = 'N/A';
            if (pedido.dataPedido) {
                try {
                    dataFormatada = new Date(pedido.dataPedido).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                } catch (e) { console.error("Data do pedido inválida:", pedido.dataPedido); }
            }

            // Formata o Status (com badge)
            const statusLower = (pedido.status || '').toLowerCase();
            let statusHtml = '';
            if (statusLower === 'concluído') {
                statusHtml = '<span class="bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Concluído</span>';
            } else if (statusLower === 'pendente') {
                statusHtml = '<span class="bg-yellow-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Pendente</span>';
            } else if (statusLower === 'cancelado') {
                statusHtml = '<span class="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Cancelado</span>';
            } else {
                statusHtml = `<span class="bg-gray-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">${pedido.status || 'N/A'}</span>`;
            }

            // Formata o Valor Total
            const valorFormatado = typeof pedido.valorTotal === 'number'
                ? `R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}`
                : 'N/A';

            // Monta o HTML da linha da tabela com os novos dados
            tr.innerHTML = `
                <td class="p-3 font-medium text-white">${pedido.id}</td>
                <td class="p-3 hidden sm:table-cell">${pedido.nomeCliente || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${dataFormatada}</td>
                <td class="p-3">${statusHtml}</td>
                <td class="p-3 font-medium text-white">${valorFormatado}</td>
            `;
            pedidosTableBody.appendChild(tr);
        });
    }

    async function carregarPedidosTabela() {
        if (!pedidosTableBody) return;
        // Colspan atualizado para 5 colunas
        pedidosTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const pedidos = await getPedidos();
            todosOsPedidos = pedidos;
            renderizarTabelaPedidos(todosOsPedidos);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            // Colspan atualizado para 5 colunas
            pedidosTableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Falha ao carregar pedidos.</td></tr>`;
        }
    }

    searchPedidoInput?.addEventListener('input', () => {
        const searchTerm = searchPedidoInput.value.toLowerCase();
        // Atualiza a busca para os novos campos
        const filtrados = todosOsPedidos.filter(p =>
            (p.nomeCliente || '').toLowerCase().includes(searchTerm) ||
            (p.status || '').toLowerCase().includes(searchTerm)
        );
        renderizarTabelaPedidos(filtrados);
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
            let dataFormatada = 'N/A';
            if (nota.dataEmissao) {
                try {
                    dataFormatada = new Date(nota.dataEmissao).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                } catch (e) { }
            }
            const valorFormatado = typeof nota.valorTotal === 'number'
                ? `R$ ${nota.valorTotal.toFixed(2).replace('.', ',')}`
                : 'N/A';
            const acoesHtml = `
                <button data-id="${nota.id}" class="text-blue-400 hover:text-blue-300 mr-3 edit-btn" title="Exibir/Editar">
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

    // --- VISÃO GERAL ---
    async function buscarVisaoGeralEstoque() {
        if (!totalItensSpan || !valorTotalSpan) return;
        totalItensSpan.textContent = 'Carregando...';
        valorTotalSpan.textContent = 'Carregando...';
        try {
            const data = await getVisaoGeralEstoque();
            totalItensSpan.textContent = data.totalItensUnicos ?? 0;
            const valorFormatado = typeof data.valorTotalEstoque === 'number'
                ? `R$ ${data.valorTotalEstoque.toFixed(2).replace('.', ',')}`
                : 'R$ 0,00';
            valorTotalSpan.textContent = valorFormatado;
        } catch (error) {
            console.error("Erro ao buscar visão geral:", error);
            totalItensSpan.textContent = 'Erro';
            valorTotalSpan.textContent = 'Erro';
        }
    }


    // --- 8. LÓGICA DOS MODAIS ---

    // --- Modal de PRODUTO (Adicionar/Editar) ---
    function abrirModalProduto(produto = null) {
        itemParaEditar = produto;
        productForm.reset();
        if (produto) {
            productModalTitle.textContent = 'Editar Produto';
            productIdInput.value = produto.id;
            productNomeInput.value = produto.nome;
            productQuantidadeInput.value = produto.quantidade;
            productPrecoInput.value = produto.preco;
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
            preco: parseFloat(productPrecoInput.value),
            tipo: productTipoInput.value,
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
            await buscarVisaoGeralEstoque();
        } catch (error) {
            alert(`Falha ao salvar produto: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar';
        }
    });

    // --- Modal de CLIENTE (Adicionar/Editar) ---
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
            fornecedorCnpjInput.value = fornecedor.cnpj;
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
            cnpj: fornecedorCnpjInput.value,
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

    // --- Modal de USUÁRIO (Adicionar/Editar) ---
    function abrirModalUsuario(usuario = null) {
        itemParaEditar = usuario;
        usuarioForm.reset();
        usuarioSenhaInput.placeholder = "Deixe em branco para não alterar";

        if (usuario) {
            usuarioModalTitle.textContent = 'Editar Usuário';
            usuarioIdInput.value = usuario.id;
            usuarioNomeInput.value = usuario.nome;
            usuarioEmailInput.value = usuario.email;
            usuarioRoleInput.value = (usuario.tipo || 'user').toLowerCase();
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
        const usuario = {
            nome: usuarioNomeInput.value,
            email: usuarioEmailInput.value,
            senha: usuarioSenhaInput.value,
            tipo: usuarioRoleInput.value,
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
    function abrirModalPedido() {
        // CHECAGEM DE SEGURANÇA:
        // Se 'pedidoModal' ou 'pedidoForm' forem nulos, avisa no console e para a função.
        if (!pedidoModal || !pedidoForm) {
            console.error("Erro Fatal: O HTML do Modal de Pedido (pedido-modal ou pedido-form) não foi encontrado.");
            alert("Erro: O modal de pedido não pode ser aberto. Verifique o HTML.");
            return; // Impede a função de continuar e quebrar
        }

        pedidoForm.reset();
        pedidoItems = []; // Limpa a lista de itens
        renderizarItensPedido(); // Limpa a tabela
        pedidoModal.classList.remove('hidden');
        pedidoModal.classList.add('flex');
    }
    function fecharModalPedido() {
        // Adiciona uma checagem aqui também por segurança
        if (pedidoModal) {
            pedidoModal.classList.add('hidden');
            pedidoModal.classList.remove('flex');
        }
    }
    
    // CHECAGEM DE SEGURANÇA:
    // Só adiciona os "ouvintes" de clique se os botões realmente existirem.
    if(openPedidoModalBtn) {
        openPedidoModalBtn.addEventListener('click', abrirModalPedido);
    }
    if(closePedidoModalBtn) {
        closePedidoModalBtn.addEventListener('click', fecharModalPedido);
    }
    if(cancelPedidoBtn) {
        cancelPedidoBtn.addEventListener('click', fecharModalPedido);
    }

 function renderizarItensPedido() {
        pedidoItemsListBody.innerHTML = '';
        let valorTotalPedido = 0; // Variável para o cálculo

        if (pedidoItems.length === 0) {
            pedidoItemsListBody.innerHTML = '<tr><td class="p-3 text-center text-gray-500" colspan="5">Nenhum item adicionado.</td></tr>'; // Colspan 5
            pedidoValorTotalSpan.textContent = 'R$ 0,00'; // Reseta o total
            return;
        }
        
        pedidoItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700';
            
            // Busca o produto e seu preço
            const produto = todosOsProdutos.find(p => p.id === item.produtoId);
            const produtoNome = produto?.nome || 'Produto Desconhecido';
            const precoVenda = produto?.precoVenda || 0; // Usa precoVenda
            const subtotal = item.quantidade * precoVenda;
            valorTotalPedido += subtotal; // Soma ao total do pedido
            
            tr.innerHTML = `
                <td class="p-3">${produtoNome}</td>
                <td class="p-3">${item.quantidade}</td>
                <td class="p-3">R$ ${precoVenda.toFixed(2).replace('.', ',')}</td>
                <td class="p-3">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                <td class="p-3">
                    <button type="button" data-index="${index}" class="text-red-500 hover:text-red-400 pedido-remove-item-btn">
                        <i class="fa fa-trash-alt"></i>
                    </button>
                </td>
            `;
            pedidoItemsListBody.appendChild(tr);
        });

        // Atualiza o span do Valor Total no final
        pedidoValorTotalSpan.textContent = `R$ ${valorTotalPedido.toFixed(2).replace('.', ',')}`;
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
            itens: pedidoItems
        };
        try {
            await addPedido(pedido);
            alert('Pedido gerado com sucesso!');
            fecharModalPedido();
            await carregarProdutosTabela();
            await buscarVisaoGeralEstoque();
        } catch (error) {
            alert(`Falha ao gerar pedido: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Gerar Pedido';
        }
    });

    // --- Modal de NOTA FISCAL (Lançar/Editar) ---
    function abrirModalNotaFiscal(nota = null) {
        itemParaEditar = nota;
        nfManualForm.reset();
        nfXmlForm.reset();
        nfItems = [];

        if (nota) {
            nfModalTitle.textContent = `Visualizar/Editar Nota Nº ${nota.numeroNota}`;
            nfModalTabs.classList.add('hidden'); // Esconde as abas (Manual/XML)
            mostrarAbaNF('manual'); // Força a aba manual
            nfIdInput.value = nota.id;
            nfNumeroInput.value = nota.numeroNota;
            nfFornecedorSelect.value = nota.fornecedorId;
            if (nota.dataEmissao) {
                nfDataInput.value = nota.dataEmissao.split('T')[0];
            }
            nfItems = nota.items || [];
            nfNumeroInput.disabled = true;
            nfFornecedorSelect.disabled = true;
            nfDataInput.disabled = true;
        } else {
            nfModalTitle.textContent = 'Lançar Nota Fiscal de Entrada';
            nfModalTabs.classList.remove('hidden'); // Mostra as abas
            mostrarAbaNF('manual');
            nfNumeroInput.disabled = false;
            nfFornecedorSelect.disabled = false;
            nfDataInput.disabled = false;
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

    // Lógica da Aba MANUAL
    function renderizarItensNF() {
        if (!nfItemsListBody) return;
        nfItemsListBody.innerHTML = '';
        if (nfItems.length === 0) {
            nfItemsListBody.innerHTML = '<tr><td class="p-3 text-center text-gray-500" colspan="5">Nenhum item adicionado.</td></tr>';
            nfValorTotalSpan.textContent = 'R$ 0,00';
            return;
        }
        let valorTotalNota = 0;
        nfItems.forEach((item, index) => {
            const totalItem = (item.quantidade || 0) * (item.custoUnitario || 0);
            valorTotalNota += totalItem;
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700';
            const produtoNome = todosOsProdutos.find(p => p.id === item.produtoId)?.nome || item.produtoNome || 'Produto Desconhecido';
            tr.innerHTML = `
                <td class="p-3">${produtoNome}</td>
                <td class="p-3">${item.quantidade}</td>
                <td class="p-3">R$ ${item.custoUnitario.toFixed(2).replace('.', ',')}</td>
                <td class="p-3">R$ ${totalItem.toFixed(2).replace('.', ',')}</td>
                <td class="p-3">
                    <button type="button" data-index="${index}" class="text-red-500 hover:text-red-400 nf-remove-item-btn">
                        <i class="fa fa-trash-alt"></i>
                    </button>
                </td>
            `;
            nfItemsListBody.appendChild(tr);
        });
        nfValorTotalSpan.textContent = `R$ ${valorTotalNota.toFixed(2).replace('.', ',')}`;
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
            custoUnitario: custoUnitario
        });
        renderizarItensNF();
        produtoSelect.value = '';
        qtdInput.value = '';
        custoInput.value = '';
    });
    nfItemsListBody?.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.nf-remove-item-btn');
        if (removeBtn) {
            const indexToRemove = parseInt(removeBtn.dataset.index);
            nfItems.splice(indexToRemove, 1);
            renderizarItensNF();
        }
    });
    nfManualForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = nfManualForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';
        const notaFiscal = {
            fornecedorId: parseInt(nfFornecedorSelect.value),
            numeroNota: nfNumeroInput.value,
            dataEmissao: nfDataInput.value,
            items: nfItems,
            valorTotal: parseFloat(nfValorTotalSpan.textContent.replace('R$ ', '').replace('.', '').replace(',', '.'))
        };
        if (!notaFiscal.fornecedorId || !notaFiscal.numeroNota || !notaFiscal.dataEmissao || nfItems.length === 0) {
            alert('Por favor, preencha os dados da nota e adicione pelo menos um item.');
            btn.disabled = false; btn.textContent = 'Salvar Nota Fiscal';
            return;
        }
        try {
            if (itemParaEditar) {
                await updateNotaFiscal(itemParaEditar.id, { ...notaFiscal, id: itemParaEditar.id });
                alert('Nota Fiscal atualizada com sucesso!');
            } else {
                await addNotaFiscalManual(notaFiscal);
                alert('Nota Fiscal de Entrada lançada com sucesso!');
            }
            fecharModalNotaFiscal();
            await carregarProdutosTabela();
            await buscarVisaoGeralEstoque();
            await carregarNotasFiscaisTabela();
        } catch (error) {
            alert(`Falha ao salvar nota: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Salvar Nota Fiscal';
        }
    });
    nfXmlForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = nfXmlForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Importando...';
        const fileInput = document.getElementById('nf-xml-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Por favor, selecione um arquivo XML.');
            btn.disabled = false; btn.textContent = 'Importar XML';
            return;
        }
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        try {
            await addNotaFiscalXml(formData);
            alert('Nota Fiscal XML importada com sucesso!');
            fecharModalNotaFiscal();
            await carregarProdutosTabela();
            await buscarVisaoGeralEstoque();
            await carregarNotasFiscaisTabela();
        } catch (error) {
            alert(`Falha ao importar XML: ${error.message}`);
        } finally {
            btn.disabled = false; btn.textContent = 'Importar XML';
        }
    });


    // --- 9. LÓGICA DE AÇÃO (Editar/Excluir Genérico) ---

    productsTableBody?.addEventListener('click', (e) => handleTableClick(e, 'produto'));
    clientesTableBody?.addEventListener('click', (e) => handleTableClick(e, 'cliente'));
    fornecedoresTableBody?.addEventListener('click', (e) => handleTableClick(e, 'fornecedor'));
    usuariosTableBody?.addEventListener('click', (e) => handleTableClick(e, 'usuario'));
    notasFiscaisTableBody?.addEventListener('click', (e) => handleTableClick(e, 'nota-fiscal'));

    async function handleTableClick(e, tipo) {
        if (userRole !== 'admin') return;

        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const id = editBtn.dataset.id;
            if (!id) return;
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
                id: deleteBtn.dataset.id,
                tipo: tipo,
                nome: deleteBtn.dataset.nome || 'este item'
            };
            abrirModalExclusao();
        }
    }

    // --- Modal de EXCLUSÃO (Genérico) ---
    function abrirModalExclusao() {
        deleteConfirmMessage.textContent = `Você tem certeza que deseja excluir "${itemParaExcluir.nome}"? Esta ação não pode ser desfeita.`;
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

        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Excluindo...';

        try {
            if (itemParaExcluir.tipo === 'produto') {
                await deleteProduto(itemParaExcluir.id);
                await carregarProdutosTabela();
                await buscarVisaoGeralEstoque();
            } else if (itemParaExcluir.tipo === 'cliente') {
                await deleteCliente(itemParaExcluir.id);
                await carregarClientesTabela();
            } else if (itemParaExcluir.tipo === 'fornecedor') {
                await deleteFornecedor(itemParaExcluir.id);
                await carregarFornecedoresTabela();
            } else if (itemParaExcluir.tipo === 'usuario') {
                await deleteUsuario(itemParaExcluir.id);
                await carregarUsuariosTabela();
            } else if (itemParaExcluir.tipo === 'nota-fiscal') {
                await deleteNotaFiscal(itemParaExcluir.id);
                await carregarNotasFiscaisTabela();
            }
            alert('Item excluído com sucesso!');
            fecharModalExclusao();
        } catch (error) {
            alert(`Falha ao excluir item: ${error.message}`);
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Excluir';
        }
    });


    // --- 10. INICIALIZAÇÃO ---
    mostrarTela(inicioContent, 'Início');
    setAtivo(navInicioBtn);

    // Carrega todos os dados necessários em segundo plano
    carregarProdutosTabela();
    carregarPedidosTabela();
    if (userRole === 'admin') {
        carregarClientesTabela();
        carregarFornecedoresTabela();
        carregarUsuariosTabela();
        carregarNotasFiscaisTabela();
    }
    buscarVisaoGeralEstoque();
});