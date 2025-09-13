// Almacenamiento de contenidos
let userContents = {
    home: [],
    philosophers: [],
    currents: [],
    texts: []
};

// Cargar contenidos existentes al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadUserContents();
    
    // Configurar navegación
    const sections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('nav a, .sidebar-widget a');
    
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        window.scrollTo(0, 0);
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) showSection(section);
        });
    });

    // Configurar formulario de búsqueda
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm !== '') {
                alert(`Buscando: ${searchTerm}`);
                searchInput.value = '';
            } else {
                alert('Por favor, ingresa un término de búsqueda');
            }
        });
    }

    // Configurar formulario de newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email !== '') {
                if (isValidEmail(email)) {
                    alert(`Gracias por suscribirte con el email: ${email}`);
                    emailInput.value = '';
                } else {
                    alert('Por favor, ingresa un email válido');
                }
            } else {
                alert('Por favor, ingresa tu email');
            }
        });
    }

    // Configurar formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContentUpload();
        });
    }

    // Vista previa de archivo
    const fileInput = document.getElementById('file');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            const preview = document.getElementById('filePreview');
            
            if (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.innerHTML = `<p><i class="fas fa-file"></i> ${file.name} (${formatFileSize(file.size)})</p>`;
                }
            } else {
                preview.innerHTML = '<p>Vista previa del archivo aparecerá aquí</p>';
            }
        });
    }
});

// Función para manejar la subida de contenido
function handleContentUpload() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;
    const fileInput = document.getElementById('file');
    
    if (title && author && category && content) {
        // Crear objeto de contenido
        const newContent = {
            id: Date.now(), // ID único basado en timestamp
            title,
            author,
            category,
            content,
            date: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            imageUrl: null
        };
        
        // Procesar archivo si existe
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newContent.imageUrl = e.target.result;
                    finishContentUpload(newContent);
                };
                reader.readAsDataURL(file);
            } else {
                finishContentUpload(newContent);
            }
        } else {
            finishContentUpload(newContent);
        }
    } else {
        alert('Por favor, completa todos los campos obligatorios');
    }
}

// Finalizar la subida de contenido
function finishContentUpload(content) {
    // Guardar en el almacenamiento
    userContents[content.category].push(content);
    
    // Guardar en localStorage
    localStorage.setItem('userContents', JSON.stringify(userContents));
    
    // Mostrar vista previa
    showContentPreview(content);
    
    // Resetear formulario
    document.getElementById('uploadForm').reset();
    document.getElementById('filePreview').innerHTML = '<p>Vista previa del archivo aparecerá aquí</p>';
    
    // Actualizar la visualización en las secciones
    loadUserContents();
    
    alert(`¡Contenido "${content.title}" publicado con éxito!`);
}

// Mostrar vista previa del contenido
function showContentPreview(content) {
    const previewSection = document.getElementById('uploadPreview');
    const previewContent = document.getElementById('previewContent');
    
    let imageHtml = '';
    if (content.imageUrl) {
        imageHtml = `<div class="article-header">
            <img src="${content.imageUrl}" alt="${content.title}">
        </div>`;
    }
    
    previewContent.innerHTML = `
        <article>
            ${imageHtml}
            <div class="article-content">
                <h2>${content.title}</h2>
                <div class="article-meta">
                    <span>Por: ${content.author}</span>
                    <span>${content.date}</span>
                    <span>${getCategoryName(content.category)}</span>
                </div>
                <p>${content.content}</p>
                <a href="#" class="read-more">Leer más</a>
            </div>
        </article>
    `;
    
    previewSection.style.display = 'block';
}

// Cargar contenidos del usuario
function loadUserContents() {
    // Cargar desde localStorage si existe
    const storedContents = localStorage.getItem('userContents');
    if (storedContents) {
        userContents = JSON.parse(storedContents);
    }
    
    // Mostrar contenidos en cada sección
    displayUserContents('home', 'user-home-content');
    displayUserContents('philosophers', 'user-philosophers-content');
    displayUserContents('currents', 'user-currents-content');
    displayUserContents('texts', 'user-texts-content');
}

// Mostrar contenidos en una sección específica
function displayUserContents(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (userContents[category].length === 0) {
        container.innerHTML = '<p>Aún no has agregado contenido en esta categoría.</p>';
        return;
    }
    
    userContents[category].forEach(content => {
        let imageHtml = '';
        if (content.imageUrl) {
            imageHtml = `<div class="article-header">
                <img src="${content.imageUrl}" alt="${content.title}">
            </div>`;
        }
        
        container.innerHTML += `
            <article>
                ${imageHtml}
                <div class="article-content">
                    <h2>${content.title}</h2>
                    <div class="article-meta">
                        <span>Por: ${content.author}</span>
                        <span>${content.date}</span>
                        <span>${getCategoryName(content.category)}</span>
                    </div>
                    <p>${content.content}</p>
                    <button class="read-more" onclick="deleteContent(${content.id}, '${category}')">Eliminar</button>
                </div>
            </article>
        `;
    });
}

// Eliminar contenido
function deleteContent(id, category) {
    if (confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
        userContents[category] = userContents[category].filter(content => content.id !== id);
        localStorage.setItem('userContents', JSON.stringify(userContents));
        loadUserContents();
    }
}

// Obtener nombre legible de la categoría
function getCategoryName(category) {
    const names = {
        'home': 'Artículo General',
        'philosophers': 'Filósofo',
        'currents': 'Corriente Filosófica',
        'texts': 'Texto Filosófico'
    };
    return names[category] || category;
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}