// script.js
import {
  getProdutos,
  addProduto,
  updateProduto,
  deleteProduto,
  getProduto,
  registrarSaida
} from './services/api.js';

// --- GUARDA DE AUTENTICAÇÃO ---
(function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = '/login.html';
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
  
  // --- Elementos do Modal de Produto ---
  const productModal = document.getElementById('product-modal');
  const openModalBtn = document.getElementById('open-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const productForm = document.getElementById('product-form');
  const modalTitle = document.getElementById('modal-title');
  const productIdInput = document.getElementById('product-id');
  const nomeInput = document.getElementById('nome');
  const quantidadeInput = document.getElementById('quantidade');
  const precoInput = document.getElementById('preco');
  const tipoInput = document.getElementById('tipo');
  const descricaoInput = document.getElementById('descricao');
  
  // --- Elementos do Modal de Saída ---
  const saidaModal = document.getElementById('saida-modal');
  const openSaidaModalBtn = document.getElementById('open-saida-modal-btn');
  const closeSaidaModalBtn = document.getElementById('close-saida-modal-btn');
  const cancelSaidaBtn = document.getElementById('cancel-saida-btn');
  const saidaForm = document.getElementById('saida-form');
  const saidaProdutoSelect = document.getElementById('saida-produto');
  const saidaQuantidadeInput = document.getElementById('saida-quantidade');
  const saidaMotivoSelect = document.getElementById('saida-motivo');
  
  // --- Elementos do Modal de Exclusão ---
  const deleteModal = document.getElementById('delete-confirm-modal');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  // --- Estado da Aplicação ---
  let produtoParaExcluir = null; 
  let produtoParaEditar = null;

  // --- Lógica de Sidebar e Logout ---
  menuButton.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    mainContent.classList.toggle('md:ml-64');
    menuIcon.classList.toggle('fa-bars');
    menuIcon.classList.toggle('fa-times');
  });

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('authToken');
      window.location.href = '/login.html';
    }
  };
  logoutBtn.addEventListener('click', handleLogout);
  headerLogoutBtn.addEventListener('click', handleLogout);


  // --- FUNÇÕES PRINCIPAIS ---

  async function carregarTabelaEVisaoGeral() {
    productsTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Carregando produtos...</td></tr>`;
    
    try {
      const produtos = await getProdutos();
      productsTableBody.innerHTML = ''; 
      saidaProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>'; 
      
      let totalItens = 0;
      let valorEstoque = 0;

      if (produtos.length === 0) {
        productsTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">Nenhum produto cadastrado.</td></tr>`;
      }

      produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-700 hover:bg-[#1e1e2d]';
        
        // --- CORRIGIDO: Lendo em camelCase ---
        // (ex: produto.nome, produto.quantidade, produto.preco)
        tr.innerHTML = `
          <td class="p-3 hidden sm:table-cell">${produto.nome}</td>
          <td class="p-3 sm:hidden">${produto.nome}</td>
          <td class="p-3 hidden sm:table-cell">${produto.quantidade}</td>
          <td class="p-3 sm:hidden">${produto.quantidade}</td>
          <td class="p-3 hidden md:table-cell">R$ ${produto.preco.toFixed(2)}</td>
          <td class="p-3">
            <button data-id="${produto.id}" class="text-purple-400 hover:text-purple-300 mr-3 edit-btn">
              <i class="fa fa-pencil-alt"></i>
            </button>
            <button data-id="${produto.id}" class="text-red-500 hover:text-red-400 delete-btn">
              <i class="fa fa-trash-alt"></i>
            </button>
          </td>
        `;
        productsTableBody.appendChild(tr);

        const option = document.createElement('option');
        option.value = produto.id; // Lendo 'id'
        option.textContent = produto.nome; // Lendo 'nome'
        saidaProdutoSelect.appendChild(option);
        
        totalItens += produto.quantidade; // Lendo 'quantidade'
        valorEstoque += produto.quantidade * produto.preco; // Lendo 'preco'
      });
      
      document.getElementById('total-itens').textContent = totalItens;
      document.getElementById('valor-estoque').textContent = `R$ ${valorEstoque.toFixed(2)}`;

    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      productsTableBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Falha ao carregar produtos.</td></tr>`;
    }
  }

  // --- Lógica do Modal de Produto (Adicionar/Editar) ---
  function abrirModalProduto(produto = null) {
    productForm.reset();
    produtoParaEditar = produto; 
    
    if (produto) {
      // Modo Edição: Lendo em camelCase
      modalTitle.textContent = 'Editar Produto';
      productIdInput.value = produto.id;
      nomeInput.value = produto.nome;
      quantidadeInput.value = produto.quantidade;
      precoInput.value = produto.preco;
      tipoInput.value = produto.tipo;
      descricaoInput.value = produto.descricao;
    } else {
      // Modo Cadastro
      modalTitle.textContent = 'Adicionar Novo Produto';
      productIdInput.value = '';
    }
    productModal.classList.remove('hidden');
  }

  function fecharModalProduto() {
    productModal.classList.add('hidden');
  }

  openModalBtn.addEventListener('click', () => abrirModalProduto());
  closeModalBtn.addEventListener('click', fecharModalProduto);
  cancelBtn.addEventListener('click', fecharModalProduto);

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    // --- CORRIGIDO: Enviando em camelCase ---
    const produto = {
      nome: nomeInput.value,
      quantidade: parseInt(quantidadeInput.value),
      preco: parseFloat(precoInput.value),
      tipo: tipoInput.value,
      descricao: descricaoInput.value
    };

    try {
      if (produtoParaEditar) {
        await updateProduto(produtoParaEditar.id, { ...produto, id: produtoParaEditar.id });
        alert('Produto atualizado com sucesso!');
      } else {
        await addProduto(produto);
        alert('Produto adicionado com sucesso!');
      }
      fecharModalProduto();
      carregarTabelaEVisaoGeral(); 
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert(`Falha ao salvar produto: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar';
    }
  });


  // --- Lógica do Modal de Saída ---
  function abrirModalSaida() {
    saidaForm.reset();
    saidaModal.classList.remove('hidden');
  }
  function fecharModalSaida() {
    saidaModal.classList.add('hidden');
  }

  openSaidaModalBtn.addEventListener('click', abrirModalSaida);
  closeSaidaModalBtn.addEventListener('click', fecharModalSaida);
  cancelSaidaBtn.addEventListener('click', fecharModalSaida);
  
  saidaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = saidaForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    
    // --- CORRIGIDO: Enviando em camelCase ---
    const saida = {
      produtoId: saidaProdutoSelect.value,
      quantidade: parseInt(saidaQuantidadeInput.value),
      motivo: saidaMotivoSelect.value
    };

    try {
      await registrarSaida(saida);
      alert('Saída registrada com sucesso!');
      fecharModalSaida();
      carregarTabelaEVisaoGeral(); 
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      alert(`Falha ao registrar saída: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrar';
    }
  });

  // --- Lógica de Excluir e Editar (Botões da Tabela) ---
  productsTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      const id = editBtn.dataset.id;
      try {
        const produto = await getProduto(id); // API retorna camelCase
        abrirModalProduto(produto); 
      } catch (error) {
        alert(`Não foi possível carregar o produto para edição: ${error.message}`);
      }
    }

    if (deleteBtn) {
      produtoParaExcluir = deleteBtn.dataset.id;
      deleteModal.classList.remove('hidden'); 
    }
  });

  // --- Lógica do Modal de Confirmação de Exclusão ---
  cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    produtoParaExcluir = null;
  });

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!produtoParaExcluir) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Excluindo...';

    try {
      await deleteProduto(produtoParaExcluir);
      alert('Produto excluído com sucesso!');
      deleteModal.classList.add('hidden');
      carregarTabelaEVisaoGeral(); 
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert(`Falha ao excluir produto: ${error.message}`);
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = 'Excluir';
      produtoParaExcluir = null;
    }
  });

  // --- INICIALIZAÇÃO ---
  carregarTabelaEVisaoGeral();
});