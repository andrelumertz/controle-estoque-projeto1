// services/api.js (COMPLETO E CORRIGIDO)
// --- 1. CONFIGURAÇÃO PRINCIPAL ---
const API_URL = process.env.VITE_API_URL || 'https://estoque-api-t1b1.onrender.com/api';

// --- 2. CRIAÇÃO DA INSTÂNCIA DO AXIOS ---
const api = axios.create({
  baseURL: API_URL
});

// --- 3. INTERCEPTOR DE REQUISIÇÃO (Adiciona o Token) ---
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
 * AUTENTICAÇÃO (Versão Simplificada)
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
export async function getProdutos() {
  const response = await api.get('/Produtos');
  return response.data;
}
export async function getProduto(id) {
  const response = await api.get(`/Produtos/${id}`);
  return response.data;
}
export async function addProduto(produto) {
  const response = await api.post('/Produtos', produto);
  return response.data;
}
export async function updateProduto(id, produto) {
  await api.put(`/Produtos/${id}`, produto);
}
export async function deleteProduto(id) {
  await api.delete(`/Produtos/${id}`);
}


/**
 * CLIENTES
 */
export async function getClientes() {
  const response = await api.get('/Clientes');
  return response.data;
}
export async function getCliente(id) {
  const response = await api.get(`/Clientes/${id}`);
  return response.data;
}
export async function addCliente(cliente) {
  const response = await api.post('/Clientes', cliente);
  return response.data;
}
export async function updateCliente(id, cliente) {
  await api.put(`/Clientes/${id}`, cliente);
}
export async function deleteCliente(id) {
  await api.delete(`/Clientes/${id}`);
}


/**
 * FORNECEDORES
 */
export async function getFornecedores() {
  const response = await api.get('/Fornecedores');
  return response.data;
}
export async function getFornecedor(id) {
  const response = await api.get(`/Fornecedores/${id}`);
  return response.data;
}
export async function addFornecedor(fornecedor) {
  const response = await api.post('/Fornecedores', fornecedor);
  return response.data;
}
export async function updateFornecedor(id, fornecedor) {
  await api.put(`/Fornecedores/${id}`, fornecedor);
}
export async function deleteFornecedor(id) {
  await api.delete(`/Fornecedores/${id}`);
}


/**
 * PEDIDOS (Atualizado)
 */
export async function getPedidos(status = null) {
  const params = {};
  if (status) {
    params.status = status;
  }
  const response = await api.get('/Pedidos', { params });
  return response.data;
}

export async function addPedido(pedido) {
  const response = await api.post('/Pedidos', pedido);
  return response.data;
}

export async function getPedido(id) {
  const response = await api.get(`/Pedidos/${id}`);
  return response.data;
}

export async function updatePedidoStatus(id, status) {
  await api.put(`/Pedidos/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  });
}


/**
 * NOTAS FISCAIS (Atualizado)
 */
export async function getNotasFiscais() {
  // Agora que o endpoint existe no backend, podemos chamá-lo.
  const response = await api.get('/NotaFiscalCompra');
  return response.data;
}
export async function getNotaFiscal(id) {
  const response = await api.get(`/NotaFiscalCompra/${id}`);
  return response.data;
}
export async function addNotaFiscalManual(notaFiscal) {
  const response = await api.post('/NotaFiscalCompra', notaFiscal);
  return response.data;
}
export async function updateNotaFiscal(id, notaFiscal) {
  console.warn("API: O endpoint PUT /api/NotaFiscalCompra/{id} não foi implementado.");
}
export async function deleteNotaFiscal(id) {
  console.warn("API: O endpoint DELETE /api/NotaFiscalCompra/{id} não foi implementado.");
}
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
export async function getUsuarios() {
  const response = await api.get('/Users');
  return response.data;
}
export async function getUsuario(id) {
  const response = await api.get(`/Users/${id}`);
  return response.data;
}
export async function addUsuario(usuario) {
  const response = await api.post('/Users', usuario);
  return response.data;
}
export async function updateUsuario(id, usuario) {
  await api.put(`/Users/${id}`, usuario);
}
export async function deleteUsuario(id) {
  await api.delete(`/Users/${id}`);
}


/**
 * RELATÓRIOS (Visão Geral e Gráficos)
 */
export async function getVisaoGeralEstoque() {
  const response = await api.get('/Relatorios/estoque/visaogeral');
  return response.data;
}
export async function getVendasPorMes() {
  const response = await api.get('/Relatorios/vendas/pormes');
  return response.data;
}
export async function getTop5Produtos() {
  const response = await api.get('/Relatorios/vendas/top5produtos');
  return response.data;
}
export async function getTop5Clientes() {
  const response = await api.get('/Relatorios/vendas/top5clientes');
  return response.data;
}

export async function getItensParados(dias = 10) {
  const response = await api.get(`/Relatorios/estoque/itensparados?dias=${dias}`);
  return response.data;
}