document.addEventListener("DOMContentLoaded", () => {
    // --- LÓGICA DE AUTENTICAÇÃO E ROTEAMENTO ---
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "login.html" || currentPage === "") {
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        }
    } else if (currentPage === "dashboard.html") {
        checkAuth();
        initializeDashboard();
    }

    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("error-message");

        if (email === "admin@admin.com" && password === "123") {
            localStorage.setItem("isAuthenticated", "true");
            window.location.href = "dashboard.html";
        } else {
            errorMessage.textContent = "E-mail ou senha inválidos!";
            errorMessage.classList.remove("hidden");
        }
    }

    function checkAuth() {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            window.location.replace("./login.html");
        }
    }

    function handleLogout(event) {
        event.preventDefault();
        event.stopPropagation();
        localStorage.removeItem("isAuthenticated");
        window.location.replace("./login.html");
    }

    // Substitua TODA a sua função initializeDashboard por esta
    async function initializeDashboard() {

        let mockProducts = JSON.parse(localStorage.getItem("products"));

        if (!mockProducts || mockProducts.length === 0) {
            try {
                const response = await fetch('db.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                mockProducts = await response.json();
                localStorage.setItem('products', JSON.stringify(mockProducts));
            } catch (error) {
                console.error('Falha ao carregar e processar o arquivo db.json:', error);
                mockProducts = [];
            }
        }

        // --- SELETORES DE ELEMENTOS ---
        const logoutBtn = document.getElementById("logout-btn");
        const headerLogoutBtn = document.getElementById("header-logout-btn");
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const menuIcon = document.getElementById('menu-icon');
        const tableBody = document.getElementById("products-table-body");
        const searchInput = document.getElementById('search-input');
        const addProductHeaderBtn = document.getElementById('add-product-header-btn');
        const productModal = document.getElementById("product-modal");
        const openModalBtn = document.getElementById("open-modal-btn");
        const closeModalBtn = document.getElementById("close-modal-btn");
        const cancelBtn = document.getElementById("cancel-btn");
        const productForm = document.getElementById("product-form");
        const modalTitle = document.getElementById("modal-title");
        const saidaModal = document.getElementById("saida-modal");
        const openSaidaModalBtn = document.getElementById("open-saida-modal-btn");
        const closeSaidaModalBtn = document.getElementById("close-saida-modal-btn");
        const cancelSaidaBtn = document.getElementById("cancel-saida-btn");
        const saidaForm = document.getElementById("saida-form");
        const addStockModal = document.getElementById('add-stock-modal');
        const addStockForm = document.getElementById('add-stock-form');
        const closeAddStockModalBtn = document.getElementById('close-add-stock-modal-btn');
        const cancelAddStockBtn = document.getElementById('cancel-add-stock-btn');
        const addStockProductName = document.getElementById('add-stock-product-name');
        const addStockProductIdInput = document.getElementById('add-stock-product-id');
        const addStockQuantityInput = document.getElementById('add-stock-quantity');
        const deleteConfirmModal = document.getElementById('delete-confirm-modal');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        let productIdToDelete = null;
        const saidaProductIdInput = document.getElementById('saida-product-id');
        const saidaProductName = document.getElementById('saida-product-name');
        const saidaQuantityInput = document.getElementById('saida-quantidade');

        // --- LÓGICA DE UI (MENU E LOGOUT) ---
        if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
        if (headerLogoutBtn) headerLogoutBtn.addEventListener("click", handleLogout);
        function toggleMenu() { sidebar.classList.toggle('-translate-x-full'); menuIcon.classList.toggle('fa-bars'); menuIcon.classList.toggle('fa-times'); }
        if (menuToggleBtn) menuToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
        if (mainContent) mainContent.addEventListener('click', () => { if (window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) { toggleMenu(); } });

        // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS E TABELA ---
        function updateOverview() {
            const totalItens = mockProducts.reduce((sum, p) => sum + p["Quantidade Produto"], 0);
            const valorEstoque = mockProducts.reduce((sum, p) => sum + p["Quantidade Produto"] * p["Preco Unitario"], 0);
            document.getElementById("total-itens").textContent = totalItens;
            document.getElementById("valor-estoque").textContent = valorEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        function renderTable() {
            if (!tableBody) return;
            tableBody.innerHTML = "";
            mockProducts.forEach(product => {
                const row = `
                    <tr class="border-b border-gray-700 hover:bg-[#1e1e2d]" data-product-id="${product.id}">
                        <td class="p-3">
                            <div class="font-bold text-white">${product["Nome Produto"]}</div>
                            <div class="text-sm text-gray-500 md:hidden">${(product["Preco Unitario"]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        </td>
                        <td class="p-3">${product["Quantidade Produto"]}</td>
                        <td class="p-3 hidden md:table-cell">${(product["Preco Unitario"]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td class="p-3">
                            <div class="flex gap-3">
                                <button class="add-stock-btn text-green-500 hover:text-green-400" data-id="${product.id}" title="Adicionar Estoque"><i class="fa fa-plus-circle fa-lg"></i></button>
                                <button class="remove-stock-btn text-orange-500 hover:text-orange-400" data-id="${product.id}" title="Retirar do Estoque"><i class="fa fa-minus-circle fa-lg"></i></button>
                                <button class="edit-btn text-blue-500 hover:text-blue-400" data-id="${product.id}" title="Editar"><i class="fa fa-pencil-alt fa-lg"></i></button>
                                <button class="delete-btn text-red-500 hover:text-red-400" data-id="${product.id}" title="Excluir"><i class="fa fa-trash-alt fa-lg"></i></button>
                            </div>
                        </td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
            addTableEventListeners();
            updateOverview();
            localStorage.setItem("products", JSON.stringify(mockProducts));
        }

        function updateProductRow(productId) {
            const product = mockProducts.find(p => p.id === productId);
            if (!product) return;
            const row = tableBody.querySelector(`tr[data-product-id="${productId}"]`);
            if (!row) return;
            const quantityCell = row.cells[1];
            quantityCell.textContent = product["Quantidade Produto"];
            updateOverview();
            localStorage.setItem("products", JSON.stringify(mockProducts));
        }

        // --- FUNÇÕES DE CONTROLE DOS MODAIS ---
        function openProductModal(productId = null) {
            productForm.reset();
            document.getElementById('product-id').value = '';
            if (productId) {
                const product = mockProducts.find(p => p.id === productId);
                if (product) {
                    modalTitle.textContent = "Editar Produto";
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('nome').value = product["Nome Produto"];
                    document.getElementById('quantidade').value = product["Quantidade Produto"];
                    document.getElementById('preco').value = product["Preco Unitario"];
                    document.getElementById('tipo').value = product["Tipo Produto"];
                    document.getElementById('descricao').value = product["Descrição Produto"];
                }
            } else {
                modalTitle.textContent = "Adicionar Novo Produto";
            }
            productModal.classList.remove("hidden");
        }
        function closeProductModal() { productModal.classList.add("hidden"); }

        function openRemoveStockModal(productId) {
            const product = mockProducts.find(p => p.id === productId);
            if (product) {
                saidaProductName.textContent = product["Nome Produto"];
                saidaProductIdInput.value = product.id;
                saidaForm.reset();
                saidaQuantityInput.value = '';
                saidaModal.classList.remove('hidden');
            }
        }
        function closeSaidaModal() { saidaModal.classList.add("hidden"); }

        function openAddStockModal(productId) {
            const product = mockProducts.find(p => p.id === productId);
            if (product) {
                addStockProductName.textContent = product["Nome Produto"];
                addStockProductIdInput.value = product.id;
                addStockForm.reset();
                addStockQuantityInput.value = '';
                addStockModal.classList.remove('hidden');
            }
        }
        function closeAddStockModal() { addStockModal.classList.add('hidden'); }
        function openDeleteModal(id) { productIdToDelete = id; deleteConfirmModal.classList.remove('hidden'); }
        function closeDeleteModal() { productIdToDelete = null; deleteConfirmModal.classList.add('hidden'); }

        function confirmDeletion() {
            if (productIdToDelete !== null) {
                mockProducts = mockProducts.filter(p => p.id !== productIdToDelete);
                renderTable();
            }
            closeDeleteModal();
        }

        // --- EVENT LISTENERS GERAIS E DOS FORMULÁRIOS ---
        if (openModalBtn) openModalBtn.addEventListener("click", () => openProductModal());
        if (closeModalBtn) closeModalBtn.addEventListener("click", closeProductModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeProductModal);
        if (closeSaidaModalBtn) closeSaidaModalBtn.addEventListener("click", closeSaidaModal);
        if (cancelSaidaBtn) cancelSaidaBtn.addEventListener("click", closeSaidaModal);
        if (closeAddStockModalBtn) closeAddStockModalBtn.addEventListener('click', closeAddStockModal);
        if (cancelAddStockBtn) cancelAddStockBtn.addEventListener('click', closeAddStockModal);
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeletion);

        if (productForm) { /* ... Lógica do formulário de criar/editar ... */ }

        // CORRIGIDO: Lógica do formulário de Retirada
        if (saidaForm) {
            saidaForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const productId = parseInt(saidaProductIdInput.value); // Lê do input escondido
                const quantidade = parseInt(saidaQuantityInput.value);
                const product = mockProducts.find(p => p.id === productId);
                if (product && quantidade > 0 && quantidade <= product["Quantidade Produto"]) {
                    product["Quantidade Produto"] -= quantidade;
                    updateProductRow(product.id);
                    closeSaidaModal();
                } else {
                    alert("Quantidade inválida ou produto não encontrado!");
                }
            });
        }
        
        // CORRIGIDO: Lógica do formulário de Adição
        if (addStockForm) {
            addStockForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productId = parseInt(addStockProductIdInput.value); // Lê do input escondido
                const quantityToAdd = parseInt(addStockQuantityInput.value);
                const product = mockProducts.find(p => p.id === productId);
                if (product && !isNaN(quantityToAdd) && quantityToAdd > 0) {
                    product["Quantidade Produto"] += quantityToAdd;
                    updateProductRow(product.id);
                    closeAddStockModal();
                } else {
                    alert("Por favor, insira uma quantidade válida.");
                }
            });
        }

        function addTableEventListeners() {
            document.querySelectorAll('.add-stock-btn').forEach(btn => {
                btn.addEventListener('click', (e) => { const id = parseInt(e.currentTarget.dataset.id); openAddStockModal(id); });
            });
            document.querySelectorAll('.remove-stock-btn').forEach(btn => {
                btn.addEventListener('click', (e) => { const id = parseInt(e.currentTarget.dataset.id); openRemoveStockModal(id); });
            });
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => { const id = parseInt(e.currentTarget.dataset.id); openProductModal(id); });
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => { const id = parseInt(e.currentTarget.dataset.id); openDeleteModal(id); });
            });
        }
        
        // --- LÓGICA DA BUSCA ---
        if (addProductHeaderBtn) addProductHeaderBtn.addEventListener('click', () => openProductModal());
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const productName = row.querySelector('td:first-child').textContent.toLowerCase();
                    if (productName.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }

        // --- CARGA INICIAL ---
        renderTable();
    }
});