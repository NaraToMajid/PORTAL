// Elemen DOM Admin
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const linkForm = document.getElementById('linkForm');
const cancelEdit = document.getElementById('cancelEdit');
const linksTable = document.getElementById('linksTable');
const loginError = document.getElementById('loginError');

// State untuk admin
let isEditing = false;
let currentEditId = null;

// Event Listener untuk form login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validasi login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Login berhasil
        loginPage.classList.add('hidden');
        adminPage.classList.remove('hidden');
        loadAdminLinks();
        loginError.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showNotification('Login successful!', 'success');
    } else {
        // Login gagal
        loginError.textContent = 'Invalid username or password!';
        showNotification('Login failed!', 'error');
    }
});

// Event Listener untuk logout
logoutBtn.addEventListener('click', () => {
    adminPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    showNotification('Logged out successfully!', 'success');
});

// Event Listener untuk cancel edit
cancelEdit.addEventListener('click', () => {
    resetForm();
});

// Event Listener untuk form link
linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    
    if (isEditing) {
        // Update existing link
        await updateLink(currentEditId, { title, url });
    } else {
        // Create new link
        await createLink({ title, url });
    }
    
    // Reset form dan refresh table
    resetForm();
    loadAdminLinks();
    loadLinks(); // Refresh halaman utama juga
});

// Fungsi untuk membuat link baru
async function createLink(linkData) {
    try {
        const { data, error } = await supabase
            .from('links')
            .insert([linkData]);
        
        if (error) throw error;
        
        showNotification('Link created successfully!', 'success');
        return data;
    } catch (error) {
        console.error('Error creating link:', error);
        showNotification('Error creating link!', 'error');
    }
}

// Fungsi untuk mengupdate link
async function updateLink(id, linkData) {
    try {
        const { data, error } = await supabase
            .from('links')
            .update(linkData)
            .eq('id', id);
        
        if (error) throw error;
        
        showNotification('Link updated successfully!', 'success');
        return data;
    } catch (error) {
        console.error('Error updating link:', error);
        showNotification('Error updating link!', 'error');
    }
}

// Fungsi untuk menghapus link
async function deleteLink(id) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showNotification('Link deleted successfully!', 'success');
        loadAdminLinks();
        loadLinks(); // Refresh halaman utama juga
    } catch (error) {
        console.error('Error deleting link:', error);
        showNotification('Error deleting link!', 'error');
    }
}

// Fungsi untuk memuat links di admin dashboard
async function loadAdminLinks() {
    try {
        const { data: links, error } = await supabase
            .from('links')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayAdminLinks(links);
    } catch (error) {
        console.error('Error loading admin links:', error);
        showNotification('Error loading links!', 'error');
    }
}

// Fungsi untuk menampilkan links di table admin
function displayAdminLinks(links) {
    linksTable.innerHTML = '';
    
    if (!links || links.length === 0) {
        linksTable.innerHTML = '<tr><td colspan="3" style="text-align: center;">No links found</td></tr>';
        return;
    }
    
    links.forEach(link => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${link.title}</td>
            <td><a href="${link.url}" target="_blank" class="link-url">${link.url}</a></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" data-id="${link.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" data-id="${link.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        linksTable.appendChild(row);
    });
    
    // Tambahkan event listeners untuk tombol edit dan delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.edit-btn').dataset.id;
            editLink(id, links);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.delete-btn').dataset.id;
            deleteLink(id);
        });
    });
}

// Fungsi untuk mengisi form edit
async function editLink(id, links) {
    const link = links.find(l => l.id == id);
    
    if (link) {
        document.getElementById('linkId').value = link.id;
        document.getElementById('linkTitle').value = link.title;
        document.getElementById('linkUrl').value = link.url;
        
        isEditing = true;
        currentEditId = id;
        
        // Ubah teks tombol
        const saveBtn = linkForm.querySelector('.save-btn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Link';
        
        showNotification('Editing link...', 'success');
    }
}

// Fungsi untuk reset form
function resetForm() {
    linkForm.reset();
    document.getElementById('linkId').value = '';
    
    isEditing = false;
    currentEditId = null;
    
    // Kembalikan teks tombol
    const saveBtn = linkForm.querySelector('.save-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Link';
}
