/**
 * Modal System - 2-Level Architecture
 * Level 1: Preview modals (hover cards)
 * Level 2: Detail modals (full content)
 */

let cardHoverTimeout = null;
let modalHoverTimeout = null;

function initModals() {
    const skillCards = document.querySelectorAll('[data-preview]');
    const projectCards = document.querySelectorAll('[data-project]');
    const detailOverlays = document.querySelectorAll('.modal-overlay');
    const previewModals = document.querySelectorAll('.skill-preview-modal');

    // SKILL CARDS - Preview Modal Logic
    skillCards.forEach(card => {
        const previewId = card.dataset.preview;
        const detailId = card.dataset.modal;
        const previewModal = document.getElementById(previewId);
        const detailModal = document.getElementById(detailId);

        if (!previewModal || !detailModal) {
            console.warn(`Modal not found for card:`, { previewId, detailId });
            return;
        }

        // Hover handling - Show preview after 200ms delay
        card.addEventListener('mouseenter', (e) => {
            clearTimeout(cardHoverTimeout);
            clearTimeout(modalHoverTimeout);

            cardHoverTimeout = setTimeout(() => {
                closeAllPreviews();
                if (previewModal) {
                    previewModal.classList.add('active');
                    requestAnimationFrame(() => {
                        positionPreviewModal(previewModal, card);
                    });
                }
            }, 200);
        });

        // Keep modal open when hovering card
        card.addEventListener('mouseleave', (e) => {
            clearTimeout(cardHoverTimeout);

            modalHoverTimeout = setTimeout(() => {
                if (previewModal && !previewModal.matches(':hover')) {
                    previewModal.classList.remove('active');
                }
            }, 100);
        });

        // Click opens detail modal directly
        card.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllPreviews();
            if (detailModal) {
                detailModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // PREVIEW MODAL HOVER - Keep open when hovering modal itself
    previewModals.forEach(preview => {
        preview.addEventListener('mouseenter', () => {
            clearTimeout(modalHoverTimeout);
        });

        preview.addEventListener('mouseleave', () => {
            modalHoverTimeout = setTimeout(() => {
                preview.classList.remove('active');
            }, 100);
        });

        // CTA BUTTON - Click opens detail modal
        const ctaBtn = preview.querySelector('.skill-preview-cta');
        const detailModalId = preview.dataset.detailModal;
        const detailModal = document.getElementById(detailModalId);

        if (ctaBtn && detailModal) {
            ctaBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllPreviews();
                detailModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
    });

    // PROJECT CARDS - Open detail modal on click
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.project;
            const modal = document.getElementById(projectId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // DETAIL MODALS - Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDetailModals();
        });
    });

    // DETAIL MODALS - Click outside to close
    detailOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDetailModals();
            }
        });
    });

    // ESC key closes everything
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeAllPreviews();
            closeDetailModals();
        }
    });

    // Close previews when scrolling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            closeAllPreviews();
        }, 50);
    }, { passive: true });
}

/**
 * Position preview modal intelligently
 * - Try right side first
 * - Fall back to left if no space
 * - Keep within viewport bounds
 */
function positionPreviewModal(modal, card) {
    const cardRect = card.getBoundingClientRect();
    const modalWidth = 450;
    const modalHeight = modal.offsetHeight;
    const gap = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left, top;

    // Try positioning to the right
    left = cardRect.right + gap;

    // If doesn't fit on right, try left
    if (left + modalWidth > viewportWidth - gap) {
        left = cardRect.left - modalWidth - gap;
    }

    // If still doesn't fit, center it
    if (left < gap) {
        left = (viewportWidth - modalWidth) / 2;
    }

    // Vertical positioning - align with card top
    top = cardRect.top;

    // Ensure modal stays within viewport vertically
    if (top + modalHeight > viewportHeight - gap) {
        top = viewportHeight - modalHeight - gap;
    }

    if (top < gap) {
        top = gap;
    }

    // Apply position
    modal.style.left = `${Math.max(gap, left)}px`;
    modal.style.top = `${Math.max(gap, top)}px`;
}

/**
 * Close all preview modals
 */
function closeAllPreviews() {
    document.querySelectorAll('.skill-preview-modal.active').forEach(m => {
        m.classList.remove('active');
    });
}

/**
 * Close all detail modals
 */
function closeDetailModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
    });
    document.body.style.overflow = '';
}

/**
 * Scroll to section helper (for modal CTA buttons)
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        closeDetailModals();
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
} else {
    initModals();
}

// Also listen for portfolioReady event (after boot animation)
document.addEventListener('portfolioReady', () => {
    console.log('✓ Modal system initialized after boot');
    initModals();
});

/**
 * ==============================================
 * DOCUMENTATION MODAL SYSTEM
 * ==============================================
 */

class DocModalSystem {
    constructor() {
        this.modal = document.getElementById('doc-modal');
        this.overlay = this.modal?.querySelector('.doc-modal-overlay');
        this.closeButtons = this.modal?.querySelectorAll('[data-modal-close]');
        this.prevButton = document.getElementById('doc-modal-prev');
        this.nextButton = document.getElementById('doc-modal-next');

        this.currentDocIndex = -1;
        this.allDocs = [];

        this.init();
    }

    init() {
        if (!this.modal) {
            console.warn('Doc modal not found in DOM');
            return;
        }

        // Récupérer toutes les documentations disponibles
        this.loadDocsList();

        // Attacher les event listeners
        this.attachEventListeners();

        // Gérer le hash dans l'URL pour deep linking
        this.handleUrlHash();

        console.log('✓ Documentation modal system initialized');
    }

    loadDocsList() {
        const docCards = document.querySelectorAll('.doc-list-card');
        this.allDocs = Array.from(docCards).map(card => ({
            slug: card.dataset.docSlug,
            element: card,
            title: card.querySelector('.doc-card-title')?.textContent || '',
            description: card.querySelector('.doc-card-description')?.textContent || '',
            category: card.querySelector('.doc-card-category')?.textContent || '',
            date: card.querySelector('.doc-card-date')?.textContent || '',
            tags: Array.from(card.querySelectorAll('.doc-card-tag')).map(tag => tag.textContent)
        }));

        console.log(`✓ Loaded ${this.allDocs.length} documentation cards`);
    }

    attachEventListeners() {
        // Fermeture du modal
        this.closeButtons?.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Navigation avec les flèches
        document.addEventListener('keydown', (e) => {
            if (this.modal?.dataset.modalState === 'open') {
                if (e.key === 'ArrowLeft') this.navigatePrevious();
                if (e.key === 'ArrowRight') this.navigateNext();
            }
        });

        // Boutons de navigation
        this.prevButton?.addEventListener('click', () => this.navigatePrevious());
        this.nextButton?.addEventListener('click', () => this.navigateNext());

        // Click sur les cards de documentation
        this.allDocs.forEach((doc, index) => {
            doc.element.addEventListener('click', () => {
                this.openModal(doc.slug, index);
            });

            // Ajouter un style de hover
            doc.element.style.cursor = 'pointer';
        });
    }

    async openModal(slug, index) {
        this.currentDocIndex = index;

        // Mettre à jour l'URL
        window.location.hash = `doc-${slug}`;

        // Charger le contenu
        await this.loadDocContent(slug);

        // Afficher le modal
        this.modal.dataset.modalState = 'open';
        document.body.style.overflow = 'hidden';

        // Mettre à jour les boutons de navigation
        this.updateNavigationButtons();
    }

    closeModal() {
        this.modal.dataset.modalState = 'closed';
        document.body.style.overflow = '';

        // Nettoyer le hash
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    async loadDocContent(slug) {
        try {
            // Récupérer les données depuis l'élément de la card
            const docData = this.allDocs[this.currentDocIndex];

            // Fetch le contenu Markdown de la documentation
            const response = await fetch(`/docs/${slug}.md`);

            if (!response.ok) {
                throw new Error(`Failed to load doc: ${slug}`);
            }

            const markdownContent = await response.text();

            // Convertir le Markdown en HTML (simple conversion pour le moment)
            const htmlContent = this.convertMarkdownToHtml(markdownContent);

            // Calculer les stats
            const wordCount = markdownContent.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // ~200 mots par minute

            // Mettre à jour le modal avec les données
            this.updateModalContent({
                title: docData.title,
                description: docData.description,
                categoryDisplay: docData.category,
                date: docData.date,
                tags: docData.tags,
                htmlContent: htmlContent,
                wordCount: wordCount,
                readingTime: readingTime
            });

        } catch (error) {
            console.error('Error loading documentation:', error);
            this.showError();
        }
    }

    convertMarkdownToHtml(markdown) {
        // Enlever le frontmatter YAML
        let html = markdown.replace(/^---[\s\S]*?---\n/, '');

        // Conversion basique du Markdown en HTML
        // Headings
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code inline
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Paragraphs
        html = html.split('\n\n').map(para => {
            if (para.trim() && !para.startsWith('<')) {
                return `<p>${para}</p>`;
            }
            return para;
        }).join('\n');

        return html;
    }

    updateModalContent(docData) {
        // Titre et description
        const titleEl = this.modal.querySelector('.doc-modal-title');
        const descEl = this.modal.querySelector('.doc-modal-description');
        const categoryEl = this.modal.querySelector('.doc-modal-category');
        const dateEl = this.modal.querySelector('.doc-modal-date');

        if (titleEl) titleEl.textContent = docData.title;
        if (descEl) descEl.textContent = docData.description;
        if (categoryEl) categoryEl.textContent = docData.categoryDisplay;
        if (dateEl) dateEl.textContent = docData.date;

        // Tags
        const tagsContainer = this.modal.querySelector('#doc-modal-tags');
        if (tagsContainer && docData.tags && docData.tags.length > 0) {
            tagsContainer.innerHTML = docData.tags.map(tag =>
                `<span class="doc-modal-tag">${tag}</span>`
            ).join('');
        }

        // Stats
        const readingTimeEl = this.modal.querySelector('#doc-modal-reading-time');
        const wordsEl = this.modal.querySelector('#doc-modal-words');

        if (readingTimeEl) readingTimeEl.textContent = `${docData.readingTime} min`;
        if (wordsEl) wordsEl.textContent = `~${docData.wordCount} mots`;

        // Contenu
        const bodyEl = this.modal.querySelector('#doc-modal-body');
        if (bodyEl) {
            bodyEl.innerHTML = docData.htmlContent;
        }

        // Scroll to top
        const contentEl = this.modal.querySelector('.doc-modal-content');
        if (contentEl) contentEl.scrollTop = 0;
    }

    showError() {
        const bodyEl = this.modal.querySelector('#doc-modal-body');
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h3 style="color: #ff4444; margin-bottom: 1rem;">Erreur de chargement</h3>
                    <p style="color: rgba(255,255,255,0.6);">Impossible de charger cette documentation.</p>
                </div>
            `;
        }
    }

    navigatePrevious() {
        if (this.currentDocIndex > 0) {
            const prevDoc = this.allDocs[this.currentDocIndex - 1];
            this.openModal(prevDoc.slug, this.currentDocIndex - 1);
        }
    }

    navigateNext() {
        if (this.currentDocIndex < this.allDocs.length - 1) {
            const nextDoc = this.allDocs[this.currentDocIndex + 1];
            this.openModal(nextDoc.slug, this.currentDocIndex + 1);
        }
    }

    updateNavigationButtons() {
        if (this.prevButton) {
            this.prevButton.disabled = this.currentDocIndex <= 0;
        }
        if (this.nextButton) {
            this.nextButton.disabled = this.currentDocIndex >= this.allDocs.length - 1;
        }
    }

    handleUrlHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#doc-')) {
            const slug = hash.replace('#doc-', '');
            const index = this.allDocs.findIndex(doc => doc.slug === slug);
            if (index !== -1) {
                this.openModal(slug, index);
            }
        }
    }
}

// Initialize Documentation Modal System
document.addEventListener('DOMContentLoaded', () => {
    window.docModalSystem = new DocModalSystem();
});

document.addEventListener('portfolioReady', () => {
    window.docModalSystem = new DocModalSystem();
});
