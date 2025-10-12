document.addEventListener("DOMContentLoaded", () => {
    // --- LÓGICA DE AUTENTICAÇÃO E ROTEAMENTO ---
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "login.html" || currentPage === "") {
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        } else {
            console.error("Formulário de login (login-form) não encontrado no DOM");
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

        if (email === "admin@exemplo.com" && password === "123") {
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
        try {
            console.log("Iniciando logout...");
            localStorage.removeItem("isAuthenticated");
            console.log("isAuthenticated removido do localStorage");
            window.location.replace("./login.html");
        } catch (error) {
            console.error("Erro ao realizar logout:", error);
        }
    }

    // --- LÓGICA DO DASHBOARD ---
    function initializeDashboard() {
        // Carregar produtos do localStorage ou usar padrão
        let mockProducts = JSON.parse(localStorage.getItem("products")) || [
            { id: 1, "Nome Produto": "Sacola Plástica Grande", "Quantidade Produto": 150, "Preco Unitario": 5.50, "Tipo Produto": "Embalagem", "Descrição Produto": "Sacola reforçada de 50L." },
            { id: 2, "Nome Produto": "Caixa de Papelão Média", "Quantidade Produto": 75, "Preco Unitario": 12.00, "Tipo Produto": "Caixa", "Descrição Produto": "Caixa de papelão para envios." },
            { id: 3, "Nome Produto": "Fita Adesiva Transparente", "Quantidade Produto": 200, "Preco Unitario": 8.75, "Tipo Produto": "Material", "Descrição Produto": "Rolo de fita adesiva de 50m." },
        ];

        const logoutBtn = document.getElementById("logout-btn");
        const headerLogoutBtn = document.getElementById("header-logout-btn");
        if (logoutBtn) {
            console.log("Botão de logout (sidebar) encontrado, adicionando listener");
            logoutBtn.removeEventListener("click", handleLogout);
            logoutBtn.addEventListener("click", handleLogout);
        } else {
            console.error("Botão de logout (sidebar) não encontrado no DOM");
        }
        if (headerLogoutBtn) {
            console.log("Botão de logout (header) encontrado, adicionando listener");
            headerLogoutBtn.removeEventListener("click", handleLogout);
            headerLogoutBtn.addEventListener("click", handleLogout);
        } else {
            console.error("Botão de logout (header) não encontrado no DOM");
        }
        
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const menuIcon = document.getElementById('menu-icon');

        function toggleMenu() {
            sidebar.classList.toggle('-translate-x-full');
            if (sidebar.classList.contains('-translate-x-full')) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            } else {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            }
        }

        if (menuToggleBtn && sidebar && mainContent && menuIcon) {
            menuToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                toggleMenu();
            });

            mainContent.addEventListener('click', () => {
                if (!sidebar.classList.contains('-translate-x-full')) {
                    toggleMenu();
                }
            });
        }

        const tableBody = document.getElementById("products-table-body");
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
        
        const deleteConfirmModal = document.getElementById('delete-confirm-modal');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        let productIdToDelete = null;

        // Atualizar visão geral de quantidades
        function updateOverview() {
            const totalItens = mockProducts.reduce((sum, p) => sum + p["Quantidade Produto"], 0);
            const valorEstoque = mockProducts.reduce((sum, p) => sum + p["Quantidade Produto"] * p["Preco Unitario"], 0);
            document.getElementById("total-itens").textContent = totalItens;
            document.getElementById("valor-estoque").textContent = `R$ ${valorEstoque.toFixed(2)}`;
        }

        // Preencher select de produtos no modal de saída
        function populateSaidaSelect() {
            const select = document.getElementById("saida-produto");
            select.innerHTML = '<option value="">Selecione um produto</option>';
            mockProducts.forEach(product => {
                select.innerHTML += `<option value="${product.id}">${product["Nome Produto"]} (Qtd: ${product["Quantidade Produto"]})</option>`;
            });
        }

        function renderTable() {
            if (!tableBody) return;
            tableBody.innerHTML = "";
            mockProducts.forEach(product => {
                const row = `
                    <tr class="border-b border-gray-800 hover:bg-gray-800">
                        <td class="p-3 hidden sm:table-cell">${product["Nome Produto"]}</td>
                        <td class="p-3 sm:hidden">${product["Nome Produto"].substring(0, 15)}${product["Nome Produto"].length > 15 ? '...' : ''}</td>
                        <td class="p-3 hidden sm:table-cell">${product["Quantidade Produto"]}</td>
                        <td class="p-3 sm:hidden">${product["Quantidade Produto"]}</td>
                        <td class="p-3 hidden md:table-cell">R$ ${product["Preco Unitario"].toFixed(2)}</td>
                        <td class="p-3 flex gap-3">
                            <button class="edit-btn bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-700 transition-colors" data-id="${product.id}" title="Editar">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="delete-btn bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-700 transition-colors" data-id="${product.id}" title="Excluir">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            addTableEventListeners();
            updateOverview();
            populateSaidaSelect();
            localStorage.setItem("products", JSON.stringify(mockProducts));
        }

        function openProductModal(productId = null) {
            if (!productForm) return;
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

        function closeProductModal() {
            if (productModal) productModal.classList.add("hidden");
        }

        function openSaidaModal() {
            if (!saidaForm) return;
            saidaForm.reset();
            populateSaidaSelect();
            saidaModal.classList.remove("hidden");
        }

        function closeSaidaModal() {
            if (saidaModal) saidaModal.classList.add("hidden");
        }

        function openDeleteModal(id) {
            productIdToDelete = id;
            if (deleteConfirmModal) deleteConfirmModal.classList.remove('hidden');
        }

        function closeDeleteModal() {
            productIdToDelete = null;
            if (deleteConfirmModal) deleteConfirmModal.classList.add('hidden');
        }

        function confirmDeletion() {
            if (productIdToDelete !== null) {
                mockProducts = mockProducts.filter(p => p.id !== productIdToDelete);
                renderTable();
            }
            closeDeleteModal();
        }

        if (openModalBtn) openModalBtn.addEventListener("click", () => openProductModal());
        if (closeModalBtn) closeModalBtn.addEventListener("click", closeProductModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeProductModal);
        if (openSaidaModalBtn) openSaidaModalBtn.addEventListener("click", () => openSaidaModal());
        if (closeSaidaModalBtn) closeSaidaModalBtn.addEventListener("click", closeSaidaModal);
        if (cancelSaidaBtn) cancelSaidaBtn.addEventListener("click", closeSaidaModal);
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeletion);

        if (productForm) {
            productForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const id = document.getElementById('product-id').value;
                const newProduct = {
                    "Nome Produto": document.getElementById('nome').value,
                    "Quantidade Produto": parseInt(document.getElementById('quantidade').value),
                    "Preco Unitario": parseFloat(document.getElementById('preco').value),
                    "Tipo Produto": document.getElementById('tipo').value,
                    "Descrição Produto": document.getElementById('descricao').value,
                };

                if (id) {
                    mockProducts = mockProducts.map(p => p.id === parseInt(id) ? { ...newProduct, id: parseInt(id) } : p);
                } else {
                    newProduct.id = Date.now();
                    mockProducts.push(newProduct);
                }
                renderTable();
                closeProductModal();
            });
        }

        if (saidaForm) {
            saidaForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const productId = parseInt(document.getElementById("saida-produto").value);
                const quantidade = parseInt(document.getElementById("saida-quantidade").value);
                const motivo = document.getElementById("saida-motivo").value;

                const product = mockProducts.find(p => p.id === productId);
                if (product && quantidade > 0 && quantidade <= product["Quantidade Produto"]) {
                    product["Quantidade Produto"] -= quantidade;
                    renderTable();
                    closeSaidaModal();
                } else {
                    alert("Quantidade inválida ou produto não encontrado!");
                }
            });
        }

        function addTableEventListeners() {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    openProductModal(id);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    openDeleteModal(id);
                });
            });
        }
        
        renderTable();
    }
});