// script.js
import {
  getProdutos,
  addProduto,
  updateProduto,
  deleteProduto,
  getProduto,
  getVisaoGeralEstoque,
  // --- NOVAS IMPORTAÇÕES ---
  getClientes, // Função para buscar clientes (precisa existir em api.js)
  addCliente,  // Função para adicionar cliente (precisa existir em api.js)
  addPedido,   // Função para adicionar pedido (precisa existir em api.js)
  // Assumindo que você terá uma função para registrar saída, se mantiver essa funcionalidade
  // registrarSaida
} from './services/api.js';

// --- GUARDA DE AUTENTICAÇÃO ---
(function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'login.html'; // Assume que login.html está na mesma pasta
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // --- Elementos Globais ---
  const menuButton = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const menuIcon = document.getElementById('menu-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const headerLogoutBtn = document.getElementById('header-logout-btn');
  const productsTableBody = document.getElementById('products-table-body');
  const searchInput = document.getElementById('search-input');
  const totalItensSpan = document.getElementById('total-itens');
  const valorTotalSpan = document.getElementById('valor-total');

  // --- Elementos do Modal de Produto ---
  const productModal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('open-modal-btn'); // Botão na tabela?
  const addProductHeaderBtn = document.getElementById('add-product-header-btn'); // Botão no header?
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const productForm = document.getElementById('product-form');
  const modalTitle = document.getElementById('modal-title');
  const productIdInput = document.getElementById('product-id'); // Hidden input
  const nomeInput = document.getElementById('nome');
  const quantidadeInput = document.getElementById('quantidade');
  const precoInput = document.getElementById('preco');
  const tipoInput = document.getElementById('tipo');
  // const descricaoInput = document.getElementById('descricao'); // Removido se não existir

  // --- Elementos do Modal de CLIENTE ---
  const clienteModal = document.getElementById('cliente-modal');
  const openClienteModalBtn = document.getElementById('open-cliente-modal-btn');
  const closeClienteModalBtn = document.getElementById('close-cliente-modal-btn');
  const cancelClienteBtn = document.getElementById('cancel-cliente-btn');
  const clienteForm = document.getElementById('cliente-form');
  const clienteNomeInput = document.getElementById('cliente-nome');
  const clienteCnpjInput = document.getElementById('cliente-cnpj');
  const clienteEmailInput = document.getElementById('cliente-email');
  const clienteEnderecoInput = document.getElementById('cliente-endereco');

  // --- Elementos do Modal de PEDIDO ---
  const pedidoModal = document.getElementById('pedido-modal');
  const openPedidoModalBtn = document.getElementById('open-pedido-modal-btn');
  const closePedidoModalBtn = document.getElementById('close-pedido-modal-btn');
  const cancelPedidoBtn = document.getElementById('cancel-pedido-btn');
  const pedidoForm = document.getElementById('pedido-form');
  const pedidoProdutoSelect = document.getElementById('pedido-produto');
  const pedidoClienteSelect = document.getElementById('pedido-cliente');
  const pedidoQuantidadeInput = document.getElementById('pedido-quantidade');

  // --- Elementos do Modal de Exclusão ---
  const deleteModal = document.getElementById('delete-confirm-modal');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  // --- Estado da Aplicação ---
  let produtoParaExcluir = null;
  let produtoParaEditar = null;
  let todosOsProdutos = []; // Guarda a lista completa de produtos para busca
  let todosOsClientes = []; // Guarda a lista completa de clientes

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
      window.location.href = 'login.html';
    }
  };
  logoutBtn?.addEventListener('click', handleLogout);
  headerLogoutBtn?.addEventListener('click', handleLogout);


  // --- FUNÇÕES PRINCIPAIS ---

  // Renderiza a tabela com base na lista de produtos fornecida
  function renderizarTabela(produtos) {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = ''; // Limpa tabela

    if (!Array.isArray(produtos) || produtos.length === 0) {
      const searchTerm = searchInput?.value || '';
      const message = searchTerm
        ? `Nenhum produto encontrado para "${searchTerm}".`
        : "Nenhum produto cadastrado.";
      productsTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">${message}</td></tr>`;
    } else {
      produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
        // Formata preço com segurança
        const precoFormatado = typeof produto.preco === 'number'
          ? produto.preco.toFixed(2).replace('.', ',')
          : 'Inválido';

        tr.innerHTML = `
          <td class="p-3 hidden sm:table-cell">${produto.nome || 'Sem nome'}</td>
          <td class="p-3 sm:hidden">${produto.nome || 'Sem nome'}</td>
          <td class="p-3 hidden sm:table-cell">${produto.quantidade ?? 0}</td>
          <td class="p-3 sm:hidden">${produto.quantidade ?? 0}</td>
          <td class="p-3 hidden md:table-cell">R$ ${precoFormatado}</td>
          <td class="p-3">
            <button data-id="${produto.id}" class="text-purple-400 hover:text-purple-300 mr-3 edit-btn" title="Editar">
              <i class="fa fa-pencil-alt"></i>
            </button>
            <button data-id="${produto.id}" class="text-red-500 hover:text-red-400 delete-btn" title="Excluir">
              <i class="fa fa-trash-alt"></i>
            </button>
          </td>
        `;
        productsTableBody.appendChild(tr);
      });
    }
  }

  // Carrega os produtos da API, atualiza o estado e renderiza a tabela
  async function carregarProdutosTabela() {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-500">Carregando produtos...</td></tr>`;

    // Limpa e prepara o select de produtos do modal de Pedido
    if (pedidoProdutoSelect) {
      pedidoProdutoSelect.innerHTML = '<option value="">Carregando...</option>';
      pedidoProdutoSelect.disabled = true;
    }

    try {
      const produtos = await getProdutos();
      todosOsProdutos = Array.isArray(produtos) ? produtos : []; // Garante que seja um array
      renderizarTabela(todosOsProdutos);

      // Popula o select do modal de Pedido
      if (pedidoProdutoSelect) {
          pedidoProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>'; // Limpa msg de carregando
          if (todosOsProdutos.length > 0) {
              todosOsProdutos.forEach(produto => {
                  const option = document.createElement('option');
                  option.value = produto.id; // O 'value' é o ID
                  option.textContent = produto.nome || `Produto ID ${produto.id}`;
                  pedidoProdutoSelect.appendChild(option);
              });
              pedidoProdutoSelect.disabled = false; // Habilita o select
          } else {
             pedidoProdutoSelect.innerHTML = '<option value="">Nenhum produto cadastrado</option>';
          }
      }

    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      productsTableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-red-500">Falha ao carregar produtos. ${error.message}</td></tr>`;
      if (pedidoProdutoSelect) {
          pedidoProdutoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
      }
    }
  }

  // Carrega os clientes da API e popula o select do modal de Pedido
  async function carregarClientes() {
    if (!pedidoClienteSelect) return; // Só executa se o select existir
    pedidoClienteSelect.innerHTML = '<option value="">Carregando clientes...</option>';
    pedidoClienteSelect.disabled = true;

    try {
      const clientes = await getClientes(); // Chama a função importada
      todosOsClientes = Array.isArray(clientes) ? clientes : []; // Garante que seja array

      pedidoClienteSelect.innerHTML = '<option value="">Selecione um cliente</option>'; // Limpa msg carregando

      if (todosOsClientes.length > 0) {
        todosOsClientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = cliente.id; // O 'value' é o ID
          option.textContent = cliente.nome || `Cliente ID ${cliente.id}`;
          pedidoClienteSelect.appendChild(option);
        });
        pedidoClienteSelect.disabled = false; // Habilita o select
      } else {
        pedidoClienteSelect.innerHTML = '<option value="">Nenhum cliente cadastrado</option>';
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      pedidoClienteSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    }
  }

  // Busca e atualiza a Visão Geral do Estoque
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
        console.error("Erro ao buscar visão geral do estoque:", error);
        totalItensSpan.textContent = 'Erro';
        valorTotalSpan.textContent = 'Erro';
        // Considerar não mostrar alert aqui para não interromper o usuário a cada falha
        // alert(`Falha ao carregar visão geral do estoque: ${error.message}`);
    }
  }


  // --- Lógica do Modal de Produto (Adicionar/Editar) ---
  function abrirModalProduto(produto = null) {
    if (!productModal || !productForm) return;
    productForm.reset();
    produtoParaEditar = produto;

    if (produto) {
      modalTitle.textContent = 'Editar Produto';
      if (productIdInput) productIdInput.value = produto.id || ''; // Garante que ID existe
      if (nomeInput) nomeInput.value = produto.nome || '';
      if (quantidadeInput) quantidadeInput.value = produto.quantidade ?? '';
      if (precoInput) precoInput.value = produto.preco ?? '';
      if (tipoInput) tipoInput.value = produto.tipo || '';
    } else {
      modalTitle.textContent = 'Adicionar Novo Produto';
      if (productIdInput) productIdInput.value = '';
    }
    productModal.classList.remove('hidden');
    productModal.classList.add('flex');
  }

  function fecharModalProduto() {
    productModal?.classList.add('hidden');
    productModal?.classList.remove('flex');
  }

  openModalBtn?.addEventListener('click', () => abrirModalProduto());
  addProductHeaderBtn?.addEventListener('click', () => abrirModalProduto());
  closeModalBtn?.addEventListener('click', fecharModalProduto);
  cancelBtn?.addEventListener('click', fecharModalProduto);

  productForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';
    }

    const produto = {
      nome: nomeInput?.value || '',
      quantidade: parseInt(quantidadeInput?.value || '0'),
      preco: parseFloat(precoInput?.value || '0.0'),
      tipo: tipoInput?.value || '',
    };

    try {
      if (produtoParaEditar && produtoParaEditar.id) {
        await updateProduto(produtoParaEditar.id, { ...produto, id: produtoParaEditar.id });
        alert('Produto atualizado com sucesso!');
      } else {
        await addProduto(produto); // Função addProduto deve remover o ID internamente se precisar
        alert('Produto adicionado com sucesso!');
      }
      fecharModalProduto();
      // Recarrega TUDO após salvar produto
      await carregarProdutosTabela();
      await buscarVisaoGeralEstoque();
      await carregarClientes(); // Recarrega clientes caso o nome mude e afete dropdowns
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert(`Falha ao salvar produto: ${error.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar';
      }
    }
  });


  // --- Lógica de Busca (Search) ---
  searchInput?.addEventListener('input', () => {
    const searchTerm = (searchInput.value || '').toLowerCase();
    const produtosFiltrados = todosOsProdutos.filter(produto =>
      (produto.nome || '').toLowerCase().includes(searchTerm) ||
      (produto.tipo || '').toLowerCase().includes(searchTerm) // Busca por tipo também
    );
    renderizarTabela(produtosFiltrados);
  });


  // --- Lógica do Modal de CLIENTE ---
  function abrirModalCliente() {
    if (!clienteModal || !clienteForm) return;
    clienteForm.reset();
    clienteModal.classList.remove('hidden');
    clienteModal.classList.add('flex');
  }
  function fecharModalCliente() {
    clienteModal?.classList.add('hidden');
    clienteModal?.classList.remove('flex');
  }

  openClienteModalBtn?.addEventListener('click', abrirModalCliente);
  closeClienteModalBtn?.addEventListener('click', fecharModalCliente);
  cancelClienteBtn?.addEventListener('click', fecharModalCliente);

  clienteForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = clienteForm.querySelector('button[type="submit"]');
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';
    }

    const cliente = {
      nome: clienteNomeInput?.value,
      cnpj: clienteCnpjInput?.value,
      email: clienteEmailInput?.value,
      endereco: clienteEnderecoInput?.value
    };

    try {
      await addCliente(cliente); // Função addCliente não deve enviar ID
      alert('Cliente cadastrado com sucesso!');
      fecharModalCliente();
      // Recarrega a lista de clientes para o dropdown do pedido
      await carregarClientes();
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      alert(`Falha ao cadastrar cliente: ${error.message}`);
    } finally {
      if(submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar Cliente';
      }
    }
  });


  // --- Lógica do Modal de PEDIDO ---
  function abrirModalPedido() {
    if (!pedidoModal || !pedidoForm) return;
    pedidoForm.reset(); // Limpa o formulário
    pedidoModal.classList.remove('hidden');
    pedidoModal.classList.add('flex');
  }
  function fecharModalPedido() {
    pedidoModal?.classList.add('hidden');
    pedidoModal?.classList.remove('flex');
  }

  openPedidoModalBtn?.addEventListener('click', abrirModalPedido);
  closePedidoModalBtn?.addEventListener('click', fecharModalPedido);
  cancelPedidoBtn?.addEventListener('click', fecharModalPedido);

  pedidoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = pedidoForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gerando...';

    // 1. Pega os valores "crus" (como string)
    const produtoIdStr = pedidoProdutoSelect.options[pedidoProdutoSelect.selectedIndex].value;
    const clienteIdStr = pedidoClienteSelect.options[pedidoClienteSelect.selectedIndex].value;
    const quantidadeStr = pedidoQuantidadeInput?.value;

    // 2. VALIDA as strings PRIMEIRO
    if (!produtoIdStr || !clienteIdStr || !quantidadeStr) {
        alert("Todos os campos (produto, cliente e quantidade) são obrigatórios.");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gerar Pedido';
        return; // Para a execução
    }

    // 3. Converte para números
    const quantidadeNum = parseInt(quantidadeStr);

    // 4. Valida a quantidade
    if (quantidadeNum <= 0) {
        alert("A quantidade deve ser maior que zero.");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gerar Pedido';
        return; // Para a execução
    }

    // 5. SÓ AGORA nós criamos o objeto, pois sabemos que os dados são válidos
    const pedido = {
      produtoId: parseInt(produtoIdStr),
      clienteId: parseInt(clienteIdStr),
      quantidadeProduto: quantidadeNum
    };

    try {
      await addPedido(pedido);
      alert('Pedido gerado com sucesso!');
      fecharModalPedido();
      // Recarrega produtos e visão geral, pois o estoque deve ter mudado
      await carregarProdutosTabela();
      await buscarVisaoGeralEstoque();
    } catch (error) {
      console.error("Erro ao gerar pedido:", error);
      alert(`Falha ao gerar pedido: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gerar Pedido';
    }
  });


  // --- Lógica de Excluir e Editar (Botões da Tabela) ---
  productsTableBody?.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      const id = editBtn.dataset.id;
      if (!id) return;
      try {
        const produto = await getProduto(id);
        if (produto) {
          abrirModalProduto(produto);
        } else {
          alert(`Produto com ID ${id} não encontrado.`);
        }
      } catch (error) {
        alert(`Não foi possível carregar o produto para edição: ${error.message}`);
      }
    }

    if (deleteBtn) {
      produtoParaExcluir = deleteBtn.dataset.id;
      if (produtoParaExcluir) {
        deleteModal?.classList.remove('hidden');
        deleteModal?.classList.add('flex');
      }
    }
  });

  // --- Lógica do Modal de Confirmação de Exclusão ---
  cancelDeleteBtn?.addEventListener('click', () => {
    deleteModal?.classList.add('hidden');
    deleteModal?.classList.remove('flex');
    produtoParaExcluir = null;
  });

  confirmDeleteBtn?.addEventListener('click', async () => {
    if (!produtoParaExcluir) return;

    if(confirmDeleteBtn) {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Excluindo...';
    }

    try {
      await deleteProduto(produtoParaExcluir);
      alert('Produto excluído com sucesso!');
      deleteModal?.classList.add('hidden');
      deleteModal?.classList.remove('flex');
      // Recarrega TUDO após excluir
      await carregarProdutosTabela();
      await buscarVisaoGeralEstoque();
      await carregarClientes(); // Recarrega clientes se necessário
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert(`Falha ao excluir produto: ${error.message}`);
    } finally {
      if(confirmDeleteBtn) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Excluir';
      }
      produtoParaExcluir = null;
    }
  });

  // --- INICIALIZAÇÃO ---
  // Chama as funções para carregar os dados iniciais do dashboard
  carregarProdutosTabela();
  carregarClientes();
  buscarVisaoGeralEstoque();
});