// 1. IMPORTAMOS AS FUNÇÕES DO NOSSO ARQUIVO DE API
import { getProdutos, addProduto, deleteProduto } from './services/api.js';

// --- CÓDIGO EXISTENTE PARA O MENU (não muda) ---
const menuButton = document.getElementById('menu-button');
const sidebar = document.getElementById('sidebar');

menuButton.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-full');
});


// --- CÓDIGO EXISTENTE DO MODAL (com pequenas adições) ---
const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const cancelBtn = document.getElementById('cancel-btn');
const productForm = document.getElementById('product-form'); // Adicionamos a referência ao formulário

addProductBtn.addEventListener('click', () => {
    productModal.classList.remove('hidden');
});

cancelBtn.addEventListener('click', () => {
    productModal.classList.add('hidden');
});


// --- NOVA LÓGICA PARA INTERAGIR COM A API ---

// Referência ao corpo da tabela
const tabelaProdutosCorpo = document.getElementById('product-table-body');

/**
 * Carrega os produtos da API e os exibe na tabela.
 */
async function carregarProdutos() {
  tabelaProdutosCorpo.innerHTML = `
    <tr><td colspan="4" class="text-center p-4 text-gray-500">Carregando...</td></tr>
  `;

  const produtos = await getProdutos();
  tabelaProdutosCorpo.innerHTML = '';

  if (produtos.length === 0) {
    tabelaProdutosCorpo.innerHTML = `
      <tr><td colspan="4" class="text-center p-4 text-gray-500">Nenhum produto cadastrado.</td></tr>
    `;
    return;
  }

  produtos.forEach(produto => {
    const tr = document.createElement('tr');
    tr.className = 'border-b';
    tr.innerHTML = `
      <td class="p-4">${produto.nome}</td>
      <td class="p-4">${produto.quantidade}</td>
      <td class="p-4">R$ ${produto.preco.toFixed(2)}</td>
      <td class="p-4">
        <button class="text-blue-500 hover:underline mr-2">Editar</button>
        <button data-id="${produto.id}" class="text-red-500 hover:underline delete-btn">Excluir</button>
      </td>
    `;
    tabelaProdutosCorpo.appendChild(tr);
  });
}

/**
 * Lida com o envio do formulário para adicionar um novo produto.
 */
productForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const novoProduto = {
        nome: document.getElementById('product-name').value,
        quantidade: parseInt(document.getElementById('product-quantity').value),
        preco: parseFloat(document.getElementById('product-price').value),
    };

    const produtoAdicionado = await addProduto(novoProduto);

    if (produtoAdicionado) {
        alert('Produto adicionado com sucesso!');
        productForm.reset(); // Limpa o formulário
        productModal.classList.add('hidden'); // Fecha o modal
        carregarProdutos(); // Atualiza a tabela com o novo produto
    } else {
        alert('Erro ao adicionar produto.');
    }
});

/**
 * Lida com cliques nos botões de excluir.
 */
tabelaProdutosCorpo.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const id = event.target.dataset.id;
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const sucesso = await deleteProduto(id);
            if (sucesso) {
                alert('Produto excluído com sucesso!');
                carregarProdutos(); // Recarrega a lista
            } else {
                alert('Erro ao excluir produto.');
            }
        }
    }
});


// --- INICIALIZAÇÃO ---
// Carrega os produtos da API assim que a página é carregada.
carregarProdutos();