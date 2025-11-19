// services/api.js (COMPLETO E CORRIGIDO)

/**
 * @fileoverview Módulo de serviços da API.
 * Este arquivo configura a instância do Axios, define interceptors
 * para inclusão automática do token e tratamento de erros 401/403,
 * e exporta funções assíncronas para todas as operações CRUD e relatórios.
 */

// --- 1. CONFIGURAÇÃO PRINCIPAL ---
const API_URL = 'https://localhost:7202/api';

// --- 2. CRIAÇÃO DA INSTÂNCIA DO AXIOS ---
const api = axios.create({
  baseURL: API_URL
});

// --- 3. INTERCEPTOR DE REQUISIÇÃO (Adiciona o Token) ---
/**
 * Intercepta todas as requisições antes de serem enviadas para a API.
 * Se houver um 'authToken' no LocalStorage, ele é adicionado
 * ao cabeçalho 'Authorization' como 'Bearer Token'.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//--- 4. INTERCEPTOR DE RESPOSTA (Tratamento de Erro 401/403) ---
/**
 * Intercepta todas as respostas da API.
 * Se a resposta for um erro 401 (Não Autorizado) ou 403 (Proibido),
 * a sessão é considerada expirada, o token é removido e o usuário
 * é redirecionado para a tela de login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('Sua sessão expirou ou você não tem permissão. Faça o login novamente.');
      localStorage.removeItem('authToken');
      window.location.href = 'login.html';
    }
    return Promise.reject(error);
  }
);


// --- 5. SERVIÇOS DA API ---

/**
 * AUTENTICAÇÃO
 */
/**
 * Realiza a autenticação do usuário na API.
 * Em caso de sucesso, salva o token JWT no LocalStorage.
 *
 * @param {string} email - O email de login do usuário.
 * @param {string} senha - A senha do usuário.
 * @returns {Promise<{token: string}>} - Um objeto contendo o token de autenticação.
 * @throws {Error} - Lança um erro se a autenticação falhar ou se o token não for recebido.
 */
export async function autenticar(email, senha) {
  const response = await api.post('/Auth/login', { email, senha });
  const token = response.data.token;
  if (!token) {
    throw new Error('Token não recebido da API.');
  }
  localStorage.setItem('authToken', token);
  return { token };
}


/**
 * PRODUTOS
 */
/**
 * Busca todos os produtos cadastrados.
 * @returns {Promise<Array<Object>>} - Lista de objetos Produto.
 */
export async function getProdutos() {
  const response = await api.get('/Produtos');
  return response.data;
}

/**
 * Busca um produto específico pelo ID.
 * @param {string|number} id - O ID do produto.
 * @returns {Promise<Object>} - Objeto Produto.
 */
export async function getProduto(id) {
  const response = await api.get(`/Produtos/${id}`);
  return response.data;
}

/**
 * Adiciona um novo produto.
 * @param {Object} produto - O objeto Produto a ser adicionado.
 * @returns {Promise<Object>} - O objeto Produto criado (com ID).
 */
export async function addProduto(produto) {
  const response = await api.post('/Produtos', produto);
  return response.data;
}

/**
 * Atualiza um produto existente.
 * @param {string|number} id - O ID do produto a ser atualizado.
 * @param {Object} produto - O objeto Produto com os dados atualizados.
 * @returns {Promise<void>}
 */
export async function updateProduto(id, produto) {
  await api.put(`/Produtos/${id}`, produto);
}

/**
 * Remove (exclui fisicamente) um produto pelo ID.
 * @param {string|number} id - O ID do produto a ser excluído.
 * @returns {Promise<void>}
 */
export async function deleteProduto(id) {
  await api.delete(`/Produtos/${id}`);
}


/**
 * CLIENTES
 */
/**
 * Busca todos os clientes cadastrados.
 * @returns {Promise<Array<Object>>} - Lista de objetos Cliente.
 */
export async function getClientes() {
  const response = await api.get('/Clientes');
  return response.data;
}

/**
 * Busca um cliente específico pelo ID.
 * @param {string|number} id - O ID do cliente.
 * @returns {Promise<Object>} - Objeto Cliente.
 */
export async function getCliente(id) {
  const response = await api.get(`/Clientes/${id}`);
  return response.data;
}

/**
 * Adiciona um novo cliente.
 * @param {Object} cliente - O objeto Cliente a ser adicionado.
 * @returns {Promise<Object>} - O objeto Cliente criado (com ID).
 */
export async function addCliente(cliente) {
  const response = await api.post('/Clientes', cliente);
  return response.data;
}

/**
 * Atualiza um cliente existente.
 * @param {string|number} id - O ID do cliente a ser atualizado.
 * @param {Object} cliente - O objeto Cliente com os dados atualizados.
 * @returns {Promise<void>}
 */
export async function updateCliente(id, cliente) {
  await api.put(`/Clientes/${id}`, cliente);
}

/**
 * Inativa (soft delete) um cliente pelo ID.
 * @param {string|number} id - O ID do cliente a ser inativado.
 * @returns {Promise<void>}
 */
export async function deleteCliente(id) {
  await api.delete(`/Clientes/${id}`);
}


/**
 * FORNECEDORES
 */
/**
 * Busca todos os fornecedores cadastrados.
 * @returns {Promise<Array<Object>>} - Lista de objetos Fornecedor.
 */
export async function getFornecedores() {
  const response = await api.get('/Fornecedores');
  return response.data;
}

/**
 * Busca um fornecedor específico pelo ID.
 * @param {string|number} id - O ID do fornecedor.
 * @returns {Promise<Object>} - Objeto Fornecedor.
 */
export async function getFornecedor(id) {
  const response = await api.get(`/Fornecedores/${id}`);
  return response.data;
}

/**
 * Adiciona um novo fornecedor.
 * @param {Object} fornecedor - O objeto Fornecedor a ser adicionado.
 * @returns {Promise<Object>} - O objeto Fornecedor criado (com ID).
 */
export async function addFornecedor(fornecedor) {
  const response = await api.post('/Fornecedores', fornecedor);
  return response.data;
}

/**
 * Atualiza um fornecedor existente.
 * @param {string|number} id - O ID do fornecedor a ser atualizado.
 * @param {Object} fornecedor - O objeto Fornecedor com os dados atualizados.
 * @returns {Promise<void>}
 */
export async function updateFornecedor(id, fornecedor) {
  await api.put(`/Fornecedores/${id}`, fornecedor);
}

/**
 * Remove (exclui fisicamente) um fornecedor pelo ID.
 * @param {string|number} id - O ID do fornecedor a ser excluído.
 * @returns {Promise<void>}
 */
export async function deleteFornecedor(id) {
  await api.delete(`/Fornecedores/${id}`);
}


/**
 * PEDIDOS
 */
/**
 * Busca a lista de pedidos, com opção de filtrar por status.
 *
 * @param {string} [status=null] - O status do pedido ('Pendente', 'Concluído', 'Cancelado'). Se for null, retorna todos.
 * @returns {Promise<Array<Object>>} - Array de objetos Pedido.
 */
export async function getPedidos(status = null) {
  const params = {};
  if (status) {
    params.status = status;
  }
  const response = await api.get('/Pedidos', { params });
  return response.data;
}

/**
 * Adiciona um novo pedido.
 * @param {Object} pedido - O objeto Pedido (contém clienteId e itens).
 * @returns {Promise<Object>} - O objeto Pedido criado.
 */
export async function addPedido(pedido) {
  const response = await api.post('/Pedidos', pedido);
  return response.data;
}

/**
 * Busca um pedido específico pelo ID.
 * @param {string|number} id - O ID do pedido.
 * @returns {Promise<Object>} - Objeto Pedido completo (com itens e cliente).
 */
export async function getPedido(id) {
  const response = await api.get(`/Pedidos/${id}`);
  return response.data;
}

/**
 * Atualiza apenas o status de um pedido.
 * @param {string|number} id - O ID do pedido a ser atualizado.
 * @param {string} status - O novo status ('Pendente', 'Concluído', 'Cancelado').
 * @returns {Promise<void>}
 */
export async function updatePedidoStatus(id, status) {
  // Nota: Envia o status como um JSON simples (string) no corpo da requisição PUT
  await api.put(`/Pedidos/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  });
}


/**
 * NOTAS FISCAIS
 */
/**
 * Busca todas as Notas Fiscais de Compra/Entrada.
 * @returns {Promise<Array<Object>>} - Array de objetos NotaFiscalCompra.
 */
export async function getNotasFiscais() {
  const response = await api.get('/NotaFiscalCompra');
  return response.data;
}
/**
 * Busca uma Nota Fiscal específica pelo ID.
 * @param {string|number} id - O ID da Nota Fiscal.
 * @returns {Promise<Object>} - Objeto NotaFiscalCompra.
 */
export async function getNotaFiscal(id) {
  const response = await api.get(`/NotaFiscalCompra/${id}`);
  return response.data;
}
/**
 * Adiciona uma Nota Fiscal de Entrada preenchida manualmente.
 * @param {Object} notaFiscal - Objeto NotaFiscalCompra (com itens de produto).
 * @returns {Promise<Object>} - A Nota Fiscal criada.
 */
export async function addNotaFiscalManual(notaFiscal) {
  const response = await api.post('/NotaFiscalCompra', notaFiscal);
  return response.data;
}
/**
 * Função placeholder: endpoint PUT não implementado no backend.
 * @param {string|number} id - ID da Nota Fiscal.
 * @param {Object} notaFiscal - Dados da Nota Fiscal.
 * @returns {Promise<void>}
 */
export async function updateNotaFiscal(id, notaFiscal) {
  console.warn("API: O endpoint PUT /api/NotaFiscalCompra/{id} não foi implementado.");
}
/**
 * Função placeholder: endpoint DELETE não implementado no backend.
 * @param {string|number} id - ID da Nota Fiscal.
 * @returns {Promise<void>}
 */
export async function deleteNotaFiscal(id) {
  console.warn("API: O endpoint DELETE /api/NotaFiscalCompra/{id} não foi implementado.");
}
/**
 * Envia um arquivo XML para a API para processamento e registro da Nota Fiscal.
 * @param {FormData} formData - Objeto FormData contendo o arquivo XML.
 * @returns {Promise<Object>} - Objeto com detalhes da nota processada.
 */
export async function addNotaFiscalXml(formData) {
  const response = await api.post('/NotaFiscalCompra/UploadXML', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * USUÁRIOS
 */
/**
 * Busca todos os usuários cadastrados.
 * @returns {Promise<Array<Object>>} - Lista de objetos Usuário.
 */
export async function getUsuarios() {
  const response = await api.get('/Users');
  return response.data;
}
/**
 * Busca um usuário específico pelo ID.
 * @param {string|number} id - O ID do usuário.
 * @returns {Promise<Object>} - Objeto Usuário.
 */
export async function getUsuario(id) {
  const response = await api.get(`/Users/${id}`);
  return response.data;
}
/**
 * Adiciona um novo usuário.
 * @param {Object} usuario - O objeto Usuário a ser adicionado.
 * @returns {Promise<Object>} - O objeto Usuário criado (com ID).
 */
export async function addUsuario(usuario) {
  const response = await api.post('/Users', usuario);
  return response.data;
}
/**
 * Atualiza um usuário existente.
 * @param {string|number} id - O ID do usuário a ser atualizado.
 * @param {Object} usuario - O objeto Usuário com os dados atualizados.
 * @returns {Promise<void>}
 */
export async function updateUsuario(id, usuario) {
  await api.put(`/Users/${id}`, usuario);
}
/**
 * Inativa (soft delete) um usuário pelo ID.
 * @param {string|number} id - O ID do usuário a ser inativado.
 * @returns {Promise<void>}
 */
export async function deleteUsuario(id) {
  await api.delete(`/Users/${id}`);
}


/**
 * RELATÓRIOS (Visão Geral e Gráficos)
 */
/**
 * Busca os dados de visão geral do estoque (itens únicos, valor total em venda e custo).
 * @returns {Promise<Object>} - Objeto contendo métricas do estoque.
 */
export async function getVisaoGeralEstoque() {
  const response = await api.get('/Relatorios/estoque/visaogeral');
  return response.data;
}
/**
 * Busca dados de vendas agregados por mês.
 * @returns {Promise<Array<Object>>} - Array de objetos com { mes, ano, valorTotalVendido }.
 */
export async function getVendasPorMes() {
  const response = await api.get('/Relatorios/vendas/pormes');
  return response.data;
}
/**
 * Busca os top 5 produtos mais vendidos por quantidade.
 * @returns {Promise<Array<Object>>} - Array de objetos com { nomeProduto, totalVendido }.
 */
export async function getTop5Produtos() {
  const response = await api.get('/Relatorios/vendas/top5produtos');
  return response.data;
}
/**
 * Busca os top 5 clientes que mais compraram por valor total.
 * @returns {Promise<Array<Object>>} - Array de objetos com { nomeCliente, valorTotalComprado }.
 */
export async function getTop5Clientes() {
  const response = await api.get('/Relatorios/vendas/top5clientes');
  return response.data;
}

/**
 * Busca itens que estão parados (sem venda recente).
 * @returns {Promise<Array<Object>>} - Array de objetos com detalhes dos itens parados.
 */
export async function getItensParados() {
  const response = await api.get('/Relatorios/estoque/itensparados');
  return response.data;
}