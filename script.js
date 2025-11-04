// script.js
import {
    getProdutos, addProduto, updateProduto, deleteProduto, getProduto,
    getClientes, getCliente, addCliente, updateCliente, deleteCliente,
    getUsuarios, getUsuario, addUsuario, updateUsuario, deleteUsuario,
    getPedidos, // Importa a função
    addPedido,
    getVisaoGeralEstoque
} from './services/api.js';

// --- Variável Global de Role ---
let userRole = 'user'; // Começa como 'user' por padrão

/**
 * (FUNÇÃO CORRIGIDA) Esconde os elementos de admin.
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
    
    // 2. DEFINE TODOS OS ELEMENTOS
    // --- Elementos Globais ---
    const menuButton = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const menuIcon = document.getElementById('menu-icon');
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const headerTitle = document.getElementById('header-title');

    // --- Elementos de NAVEGAÇÃO ---
    const navInicioBtn = document.getElementById('nav-inicio-btn');
    const navProdutosBtn = document.getElementById('nav-produtos-btn');
    const navPedidosBtn = document.getElementById('nav-pedidos-btn'); 
    const navClientesBtn = document.getElementById('nav-clientes-btn');
    const navUsuariosBtn = document.getElementById('nav-usuarios-btn');
    const inicioContent = document.getElementById('inicio-content');
    const produtosContent = document.getElementById('produtos-content');
    const pedidosContent = document.getElementById('pedidos-content'); 
    const clientesContent = document.getElementById('clientes-content');
    const usuariosContent = document.getElementById('usuarios-content');

    // --- Elementos da Tela de PRODUTOS ---
    const productsTableBody = document.getElementById('products-table-body');
    const searchProdutoInput = document.getElementById('search-produto-input');
    const totalItensSpan = document.getElementById('total-itens');
    const valorTotalSpan = document.getElementById('valor-total');
    const addProductHeaderBtn = document.getElementById('add-product-header-btn'); 

    // --- Elementos da Tela de CLIENTES ---
    const clientesTableBody = document.getElementById('clientes-table-body');
    const searchClienteInput = document.getElementById('search-cliente-input');
    const addClienteHeaderBtn = document.getElementById('add-cliente-header-btn'); 

    // --- Elementos da Tela de USUÁRIOS ---
    const usuariosTableBody = document.getElementById('usuarios-table-body');
    const searchUsuarioInput = document.getElementById('search-usuario-input');
    const addUsuarioHeaderBtn = document.getElementById('add-usuario-header-btn'); 

    // --- Elementos da Tela de PEDIDOS ---
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const searchPedidoInput = document.getElementById('search-pedido-input');

    // --- Elementos do Modal de PRODUTO ---
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

    // --- Elementos do Modal de CLIENTE ---
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

    // --- Elementos do Modal de USUÁRIO ---
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

    // --- Elementos do Modal de PEDIDO ---
    const pedidoModal = document.getElementById('pedido-modal');
    const openPedidoModalBtn = document.getElementById('open-pedido-modal-btn');
    const closePedidoModalBtn = document.getElementById('close-pedido-modal-btn');
    const cancelPedidoBtn = document.getElementById('cancel-pedido-btn');
    const pedidoForm = document.getElementById('pedido-form');
    const pedidoProdutoSelect = document.getElementById('pedido-produto');
    const pedidoClienteSelect = document.getElementById('pedido-cliente');
    const pedidoQuantidadeInput = document.getElementById('pedido-quantidade');

    // --- Elementos do Modal de Exclusão (GENÉRICO) ---
    const deleteModal = document.getElementById('delete-confirm-modal');
    const deleteConfirmMessage = document.getElementById('delete-confirm-message');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // --- Estado da Aplicação ---
    let itemParaExcluir = { id: null, tipo: null, nome: null }; 
    let itemParaEditar = null; 
    let todosOsProdutos = [];
    let todosOsClientes = [];
    let todosOsUsuarios = [];
    let todosOsPedidos = [];

    // --- 3. APLICA LIMITES DE ROLE ---
    // (Agora que os elementos existem, podemos escondê-los)
    applyUserRoleLimits();
    
    // --- 4. ADICIONA EVENT LISTENERS ---

    // --- Lógica de Sidebar e Logout ---
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


    // ==================================================================
    // == LÓGICA DE NAVEGAÇÃO
    // ==================================================================
    const navButtons = [navInicioBtn, navProdutosBtn, navPedidosBtn, navClientesBtn, navUsuariosBtn];
    const contentScreens = [inicioContent, produtosContent, pedidosContent, clientesContent, usuariosContent];

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
    navClientesBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(clientesContent, 'Lista de Clientes');
        setAtivo(navClientesBtn);
    });
    navUsuariosBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTela(usuariosContent, 'Lista de Usuários');
        setAtivo(navUsuariosBtn);
    });

    // --- Fim da Lógica de Navegação ---


    // --- FUNÇÕES PRINCIPAIS (Carregamento de Dados) ---

    // --- PRODUTOS ---
    function renderizarTabelaProdutos(produtos) {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = '';
        if (produtos.length === 0) {
            const msg = searchProdutoInput.value ? "Nenhum produto encontrado." : "Nenhum produto cadastrado.";
            productsTableBody.innerHTML = `<tr><td colspan="7" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            const precoFormatado = typeof produto.preco === 'number' ? produto.preco.toFixed(2).replace('.', ',') : 'N/A';
            
            const statusHtml = (produto.quantidade ?? 0) > 0
                ? '<span class="bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Disponível</span>'
                : '<span class="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Indisponível</span>';
            
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
                <td class="p-3">${statusHtml}</td>
                <td class="p-3 hidden md:table-cell">R$ ${precoFormatado}</td>
                <td class="p-3" ${userRole !== 'admin' ? 'hidden' : ''}>${acoesHtml}</td>
            `;
            productsTableBody.appendChild(tr);
        });
    }
    async function carregarProdutosTabela() {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = `<tr><td colspan="7" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const produtos = await getProdutos();
            todosOsProdutos = produtos;
            renderizarTabelaProdutos(todosOsProdutos);
            pedidoProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>';
            todosOsProdutos.forEach(p => {
                pedidoProdutoSelect.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            productsTableBody.innerHTML = `<tr><td colspan="7" class="p-3 text-center text-red-500">Falha ao carregar produtos.</td></tr>`;
        }
    }
    searchProdutoInput?.addEventListener('input', () => {
        const searchTerm = searchProdutoInput.value.toLowerCase();
        const filtrados = todosOsProdutos.filter(p => p.nome.toLowerCase().includes(searchTerm));
        renderizarTabelaProdutos(filtrados);
    });

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
            pedidosTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">${msg}</td></tr>`;
            return;
        }
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
            
            let dataFormatada = 'N/A';
            if (pedido.dataPedido) {
                try {
                    dataFormatada = new Date(pedido.dataPedido).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                } catch (e) { console.error("Data do pedido inválida:", pedido.dataPedido); }
            }

            tr.innerHTML = `
                <td class="p-3">${pedido.nomeProduto || 'N/A'}</td>
                <td class="p-3 hidden sm:table-cell">${pedido.nomeCliente || 'N/A'}</td>
                <td class="p-3">${pedido.quantidadeProduto || 'N/A'}</td>
                <td class="p-3 hidden md:table-cell">${dataFormatada}</td>
            `;
            pedidosTableBody.appendChild(tr);
        });
    }
    async function carregarPedidosTabela() {
        if (!pedidosTableBody) return;
        pedidosTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Carregando...</td></tr>`;
        try {
            const pedidos = await getPedidos();
            todosOsPedidos = pedidos;
            renderizarTabelaPedidos(todosOsPedidos);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            pedidosTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Falha ao carregar pedidos.</td></tr>`;
        }
    }
    searchPedidoInput?.addEventListener('input', () => {
        const searchTerm = searchPedidoInput.value.toLowerCase();
        const filtrados = todosOsPedidos.filter(p => 
            (p.nomeProduto || '').toLowerCase().includes(searchTerm) ||
            (p.nomeCliente || '').toLowerCase().includes(searchTerm)
        );
        renderizarTabelaPedidos(filtrados);
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


    // ==================================================================
    // == LÓGICA DOS MODAIS (AGORA COM LISTENERS CORRETOS)
    // ==================================================================

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
        pedidoForm.reset();
        pedidoModal.classList.remove('hidden');
        pedidoModal.classList.add('flex');
    }
    function fecharModalPedido() {
        pedidoModal.classList.add('hidden');
        pedidoModal.classList.remove('flex');
    }
    openPedidoModalBtn?.addEventListener('click', abrirModalPedido);
    closePedidoModalBtn?.addEventListener('click', fecharModalPedido);
    cancelPedidoBtn?.addEventListener('click', fecharModalPedido);

    pedidoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = pedidoForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Gerando...';

        const produtoIdStr = pedidoProdutoSelect.value;
        const clienteIdStr = pedidoClienteSelect.value;
        const quantidadeStr = pedidoQuantidadeInput.value;

        if (!produtoIdStr || !clienteIdStr || !quantidadeStr) {
            alert("Todos os campos (produto, cliente e quantidade) são obrigatórios.");
            btn.disabled = false; btn.textContent = 'Gerar Pedido';
            return;
        }
        const quantidadeNum = parseInt(quantidadeStr);
        if (quantidadeNum <= 0) {
            alert("A quantidade deve ser maior que zero.");
            btn.disabled = false; btn.textContent = 'Gerar Pedido';
            return;
        }

        const pedido = {
            produtoId: parseInt(produtoIdStr),
            clienteId: parseInt(clienteIdStr),
            quantidadeProduto: quantidadeNum
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


    // ==================================================================
    // == LÓGICA DE AÇÃO (Editar/Excluir) - GENÉRICA
    // ==================================================================
    
    // Ouve cliques nas 3 tabelas
    productsTableBody?.addEventListener('click', (e) => handleTableClick(e, 'produto'));
    clientesTableBody?.addEventListener('click', (e) => handleTableClick(e, 'cliente'));
    usuariosTableBody?.addEventListener('click', (e) => handleTableClick(e, 'usuario'));

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
                } else if (tipo === 'usuario') {
                    const usuario = await getUsuario(id);
                    abrirModalUsuario(usuario);
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
            } else if (itemParaExcluir.tipo === 'usuario') {
                await deleteUsuario(itemParaExcluir.id);
                await carregarUsuariosTabela(); 
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


    // --- 5. INICIALIZAÇÃO ---
    mostrarTela(inicioContent, 'Início');
    setAtivo(navInicioBtn);
    
    // Carrega todos os dados em segundo plano
    carregarProdutosTabela();
    carregarPedidosTabela(); 
    if (userRole === 'admin') {
        carregarClientesTabela();
        carregarUsuariosTabela();
    }
    buscarVisaoGeralEstoque();
});