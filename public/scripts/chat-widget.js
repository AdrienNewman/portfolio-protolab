/**
 * Chat Widget - Protolab Assistant
 * Widget chatbot avec streaming SSE
 */
(function() {
    'use strict';

    // ===== Configuration =====
    const CONFIG = {
        apiEndpoint: 'https://protolab.ovh/api/chat/stream',
        healthEndpoint: 'https://protolab.ovh/api/health',
        timeout: 30000,
        retryAttempts: 1,
        retryDelay: 2000
    };

    // ===== État =====
    const STATE = {
        isOpen: false,
        isLoading: false,
        conversationId: null,
        messages: []
    };

    // ===== Éléments DOM =====
    const elements = {
        toggle: null,
        window: null,
        close: null,
        messages: null,
        suggestions: null,
        input: null,
        send: null,
        loading: null
    };

    // ===== Initialisation =====
    function init() {
        cacheElements();
        if (!elements.toggle || !elements.window) {
            console.warn('[ChatWidget] Éléments non trouvés');
            return;
        }
        attachEventListeners();
        console.log('[ChatWidget] Initialisé');
    }

    function cacheElements() {
        elements.toggle = document.getElementById('chat-toggle');
        elements.window = document.getElementById('chat-window');
        elements.close = document.getElementById('chat-close');
        elements.messages = document.getElementById('chat-messages');
        elements.suggestions = document.getElementById('chat-suggestions');
        elements.input = document.getElementById('chat-input');
        elements.send = document.getElementById('chat-send');
        elements.loading = document.getElementById('chat-loading');
    }

    function attachEventListeners() {
        // Toggle button
        elements.toggle.addEventListener('click', toggleChat);

        // Close button
        elements.close.addEventListener('click', closeChat);

        // Send button
        elements.send.addEventListener('click', handleSend);

        // Input events
        elements.input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        elements.input.addEventListener('input', function() {
            elements.send.disabled = !this.value.trim();
        });

        // Suggestion chips
        elements.suggestions.querySelectorAll('.suggestion-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                const suggestion = this.getAttribute('data-suggestion');
                if (suggestion) {
                    elements.input.value = suggestion;
                    elements.send.disabled = false;
                    handleSend();
                }
            });
        });

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && STATE.isOpen) {
                closeChat();
            }
        });

        // Click outside to close (optional - désactivé pour UX)
        // document.addEventListener('click', function(e) {
        //     if (STATE.isOpen && !elements.window.contains(e.target) && !elements.toggle.contains(e.target)) {
        //         closeChat();
        //     }
        // });
    }

    // ===== Toggle Chat =====
    function toggleChat() {
        if (STATE.isOpen) {
            closeChat();
        } else {
            openChat();
        }
    }

    function openChat() {
        STATE.isOpen = true;
        elements.window.classList.add('open');
        elements.window.setAttribute('aria-hidden', 'false');
        elements.toggle.classList.add('active');
        elements.toggle.setAttribute('aria-label', 'Fermer le chat');

        // Focus input
        setTimeout(function() {
            elements.input.focus();
        }, 100);

        // Disable body scroll on mobile
        if (window.innerWidth <= 480) {
            document.body.style.overflow = 'hidden';
        }
    }

    function closeChat() {
        STATE.isOpen = false;
        elements.window.classList.remove('open');
        elements.window.setAttribute('aria-hidden', 'true');
        elements.toggle.classList.remove('active');
        elements.toggle.setAttribute('aria-label', 'Ouvrir le chat');

        // Restore body scroll
        document.body.style.overflow = '';
    }

    // ===== Gestion des messages =====
    function handleSend() {
        const text = elements.input.value.trim();
        if (!text || STATE.isLoading) return;

        // Clear input
        elements.input.value = '';
        elements.send.disabled = true;

        // Hide suggestions after first message
        if (elements.suggestions) {
            elements.suggestions.classList.add('hidden');
        }

        // Send message
        sendMessage(text);
    }

    async function sendMessage(text) {
        // Add user message
        appendMessage('user', text);

        STATE.isLoading = true;
        showLoading();

        // Create placeholder for assistant message
        const assistantMsgEl = appendMessage('assistant', '', true);

        try {
            await streamResponse(text, assistantMsgEl);
        } catch (error) {
            console.error('[ChatWidget] Erreur:', error);

            // Remove empty placeholder
            if (!assistantMsgEl.textContent.trim()) {
                assistantMsgEl.remove();
            }

            // Show error message
            appendMessage('error', getErrorMessage(error));
        } finally {
            STATE.isLoading = false;
            hideLoading();
        }
    }

    async function streamResponse(text, messageEl, attempt = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(function() {
            controller.abort();
        }, CONFIG.timeout);

        try {
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    message: text,
                    conversation_id: STATE.conversationId
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }

            // Read SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process SSE lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);

                            // Handle different response formats
                            if (parsed.token) {
                                fullResponse += parsed.token;
                            } else if (parsed.content) {
                                fullResponse += parsed.content;
                            } else if (parsed.response) {
                                fullResponse += parsed.response;
                            }

                            // Update conversation ID
                            if (parsed.conversation_id) {
                                STATE.conversationId = parsed.conversation_id;
                            }

                            // Update message content
                            updateMessageContent(messageEl, fullResponse);
                            scrollToBottom();

                        } catch (parseError) {
                            // Not JSON, might be raw text
                            if (data && data !== '[DONE]') {
                                fullResponse += data;
                                updateMessageContent(messageEl, fullResponse);
                                scrollToBottom();
                            }
                        }
                    }
                }
            }

            // Final update
            if (fullResponse) {
                STATE.messages.push({ role: 'assistant', content: fullResponse });
                updateMessageContent(messageEl, fullResponse);
            }

        } catch (error) {
            clearTimeout(timeoutId);

            // Retry logic
            if (attempt < CONFIG.retryAttempts && error.name !== 'AbortError') {
                appendMessage('error', 'Erreur de connexion. Nouvelle tentative...');
                await delay(CONFIG.retryDelay);

                // Remove retry message
                const lastError = elements.messages.querySelector('.message.error:last-child');
                if (lastError) lastError.remove();

                return streamResponse(text, messageEl, attempt + 1);
            }

            throw error;
        }
    }

    // ===== Rendu des messages =====
    function appendMessage(role, content, isPlaceholder = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ' + role;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (content) {
            contentDiv.innerHTML = parseMarkdown(content);
        } else if (isPlaceholder) {
            contentDiv.innerHTML = '<span class="typing-cursor">▊</span>';
        }

        msgDiv.appendChild(contentDiv);
        elements.messages.appendChild(msgDiv);

        scrollToBottom();

        return contentDiv;
    }

    function updateMessageContent(contentEl, text) {
        contentEl.innerHTML = parseMarkdown(text);
    }

    function scrollToBottom() {
        if (elements.messages) {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        }
    }

    // ===== Markdown Parser =====
    function parseMarkdown(text) {
        if (!text) return '';

        // Use marked.js if available
        if (typeof marked !== 'undefined') {
            try {
                marked.setOptions({
                    breaks: true,
                    gfm: true
                });
                return sanitizeHtml(marked.parse(text));
            } catch (e) {
                console.warn('[ChatWidget] marked.js error:', e);
            }
        }

        // Fallback: basic markdown parsing
        return basicMarkdownParse(text);
    }

    function basicMarkdownParse(text) {
        return text
            // Code blocks
            .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Headers (h3 max for chat)
            .replace(/^### (.+)$/gm, '<strong>$1</strong>')
            .replace(/^## (.+)$/gm, '<strong>$1</strong>')
            .replace(/^# (.+)$/gm, '<strong>$1</strong>')
            // Lists
            .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Line breaks
            .replace(/\n/g, '<br>');
    }

    function sanitizeHtml(html) {
        // Remove script tags and event handlers
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '');
    }

    // ===== Loading indicator =====
    function showLoading() {
        if (elements.loading) {
            elements.loading.hidden = false;
        }
    }

    function hideLoading() {
        if (elements.loading) {
            elements.loading.hidden = true;
        }
    }

    // ===== Error handling =====
    function getErrorMessage(error) {
        if (error.name === 'AbortError') {
            return 'La requête a expiré (30s). Veuillez réessayer.';
        }
        if (error.message && error.message.includes('HTTP')) {
            return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
        }
        return 'Erreur de connexion. Veuillez vérifier votre connexion Internet.';
    }

    // ===== Utilities =====
    function delay(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    }

    // ===== Public API =====
    window.ChatWidget = {
        open: openChat,
        close: closeChat,
        toggle: toggleChat
    };

    // ===== Init on DOM ready =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
