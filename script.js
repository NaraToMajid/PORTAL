// ========== KONFIGURASI GLOBAL ==========
const SUPABASE_URL = 'https://bxhrnnwfqlsoviysqcdw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aHJubndmcWxzb3ZpeXNxY2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODkzNDIsImV4cCI6MjA4MTM2NTM0Mn0.O7fpv0TrDd-8ZE3Z9B5zWyAuWROPis5GRnKMxmqncX8';

const ADMIN_CONFIG = {
    username: 'admin',
    password: 'Rantauprapat123'
};

let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

function showNotification(message, type = 'success') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== VARIABEL GLOBAL ==========
const themeToggle = document.getElementById('themeToggle');
const adminToggle = document.getElementById('adminToggle');
const backToMain = document.getElementById('backToMain');
const backToMainFromAdmin = document.getElementById('backToMainFromAdmin');
const mainPage = document.getElementById('mainPage');
const loginPage = document.getElementById('loginPage');
const adminPage = document.getElementById('adminPage');
const linksContainer = document.getElementById('linksContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const linkForm = document.getElementById('linkForm');
const cancelEdit = document.getElementById('cancelEdit');
const linksTable = document.getElementById('linksTable');
const loginError = document.getElementById('loginError');

let isEditing = false;
let currentEditId = null;
let currentLinks = [];

// ========== DARK MODE TOGGLE ==========
const isDarkMode = localStorage.getItem('darkMode') === 'true';
const icon = themeToggle.querySelector('i');

if (isDarkMode) {
    document.body.classList.add('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'true');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'false');
    }
});

// ========== NAVIGASI HALAMAN ==========
adminToggle.addEventListener('click', () => {
    mainPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
});

backToMain.addEventListener('click', () => {
    loginPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
});

backToMainFromAdmin.addEventListener('click', () => {
    adminPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
});

// ========== FUNGSI LOAD LINKS (MAIN PAGE) ==========
async function loadLinks() {
    try {
        const supabase = getSupabase();
        const { data: links, error } = await supabase
            .from('links')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!links || links.length === 0) {
            await createDefaultLinks();
            loadLinks();
            return;
        }
        
        displayLinks(links);
    } catch (error) {
        console.error('Error loading links:', error);
        displayDefaultLinks();
        showNotification('Error loading links. Using default links.', 'error');
    }
}

async function createDefaultLinks() {
    const defaultLinks = [
        { title: 'Portfolio 1', url: 'https://almajid.vercel.app/' },
        { title: 'Portfolio 2', url: 'https://almajidnafi.vercel.app/' },
        { title: 'Portfolio 3', url: 'https://almajidoor.vercel.app/' },
        { title: 'Bahlil Alpha', url: 'https://bahlil-alpha.vercel.app/' },
        { title: 'Catatan Rahasia', url: 'https://catatanrahasia.vercel.app/' },
        { title: 'Dino Almajid', url: 'https://dinoalmajid.vercel.app/' },
        { title: 'Bahlil Puzzle', url: 'https://bahlilpuzzle.vercel.app/' },
        { title: 'Bahlil Slash', url: 'https://bahlil-slash.vercel.app/' },
        { title: 'orarps', url: 'https://batuguntingkertas-five.vercel.app/' },
        { title: 'OraSticker', url: 'https://kumpulanstikerbahlil.vercel.app/' }
    ];
    
    try {
        const supabase = getSupabase();
        for (const link of defaultLinks) {
            const { error } = await supabase
                .from('links')
                .insert([link]);
            
            if (error) console.error('Error inserting default link:', error);
        }
    } catch (error) {
        console.error('Error creating default links:', error);
    }
}

function displayLinks(links) {
    linksContainer.innerHTML = '';
    
    links.forEach(link => {
        const linkCard = document.createElement('a');
        linkCard.href = link.url;
        linkCard.target = '_blank';
        linkCard.className = 'link-card';
        
        linkCard.innerHTML = `
            <div class="link-title">${link.title}</div>
            <div class="link-url">${link.url}</div>
        `;
        
        linksContainer.appendChild(linkCard);
    });
}

function displayDefaultLinks() {
    const defaultLinks = [
        { title: 'Portfolio 1', url: 'https://almajid.vercel.app/' },
        { title: 'Portfolio 2', url: 'https://almajidnafi.vercel.app/' },
        { title: 'Portfolio 3', url: 'https://almajidoor.vercel.app/' },
        { title: 'Bahlil Alpha', url: 'https://bahlil-alpha.vercel.app/' },
        { title: 'Catatan Rahasia', url: 'https://catatanrahasia.vercel.app/' },
        { title: 'Dino Almajid', url: 'https://dinoalmajid.vercel.app/' },
        { title: 'Bahlil Puzzle', url: 'https://bahlilpuzzle.vercel.app/' },
        { title: 'Bahlil Slash', url: 'https://bahlil-slash.vercel.app/' },
        { title: 'orarps', url: 'https://batuguntingkertas-five.vercel.app/' },
        { title: 'OraSticker', url: 'https://kumpulanstikerbahlil.vercel.app/' }
    ];
    
    displayLinks(defaultLinks);
}

// ========== ADMIN LOGIN ==========
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
        loginPage.classList.add('hidden');
        adminPage.classList.remove('hidden');
        loadAdminLinks();
        loginError.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showNotification('Login successful!', 'success');
    } else {
        loginError.textContent = 'Invalid username or password!';
        showNotification('Login failed!', 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    adminPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    showNotification('Logged out successfully!', 'success');
});

// ========== ADMIN CRUD OPERATIONS ==========
cancelEdit.addEventListener('click', () => {
    resetForm();
});

linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    
    if (isEditing) {
        await updateLink(currentEditId, { title, url });
    } else {
        await createLink({ title, url });
    }
    
    resetForm();
    loadAdminLinks();
    loadLinks();
});

async function createLink(linkData) {
    try {
        const supabase = getSupabase();
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

async function updateLink(id, linkData) {
    try {
        const supabase = getSupabase();
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

async function deleteLink(id) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showNotification('Link deleted successfully!', 'success');
        loadAdminLinks();
        loadLinks();
    } catch (error) {
        console.error('Error deleting link:', error);
        showNotification('Error deleting link!', 'error');
    }
}

async function loadAdminLinks() {
    try {
        const supabase = getSupabase();
        const { data: links, error } = await supabase
            .from('links')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        currentLinks = links || [];
        displayAdminLinks(currentLinks);
    } catch (error) {
        console.error('Error loading admin links:', error);
        showNotification('Error loading links!', 'error');
    }
}

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
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.edit-btn').dataset.id;
            editLink(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.delete-btn').dataset.id;
            deleteLink(id);
        });
    });
}

function editLink(id) {
    const link = currentLinks.find(l => l.id == id);
    
    if (link) {
        document.getElementById('linkId').value = link.id;
        document.getElementById('linkTitle').value = link.title;
        document.getElementById('linkUrl').value = link.url;
        
        isEditing = true;
        currentEditId = id;
        
        const saveBtn = linkForm.querySelector('.save-btn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Link';
        
        showNotification('Editing link...', 'success');
    }
}

function resetForm() {
    linkForm.reset();
    document.getElementById('linkId').value = '';
    
    isEditing = false;
    currentEditId = null;
    
    const saveBtn = linkForm.querySelector('.save-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Link';
}

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', () => {
    loadLinks();
});
