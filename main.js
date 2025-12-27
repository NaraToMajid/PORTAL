// Elemen DOM
const themeToggle = document.getElementById('themeToggle');
const adminToggle = document.getElementById('adminToggle');
const backToMain = document.getElementById('backToMain');
const backToMainFromAdmin = document.getElementById('backToMainFromAdmin');
const mainPage = document.getElementById('mainPage');
const loginPage = document.getElementById('loginPage');
const adminPage = document.getElementById('adminPage');
const linksContainer = document.getElementById('linksContainer');

// Cek preferensi dark mode dari localStorage
const isDarkMode = localStorage.getItem('darkMode') === 'true';
const icon = themeToggle.querySelector('i');

// Terapkan mode sesuai preferensi yang disimpan
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Toggle dark mode
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Toggle ikon
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

// Navigasi antar halaman
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

// Fungsi untuk memuat links dari database
async function loadLinks() {
    try {
        const { data: links, error } = await supabase
            .from('links')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Jika belum ada data, buat data default
        if (!links || links.length === 0) {
            await createDefaultLinks();
            loadLinks(); // Muat ulang setelah membuat default
            return;
        }
        
        displayLinks(links);
    } catch (error) {
        console.error('Error loading links:', error);
        // Tampilkan default links jika error
        displayDefaultLinks();
    }
}

// Fungsi untuk membuat links default
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

// Fungsi untuk menampilkan links
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

// Fungsi untuk menampilkan default links (fallback)
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

// Muat links saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadLinks);
