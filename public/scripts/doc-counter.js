// Dynamic Documentation Counter System
document.addEventListener('DOMContentLoaded', () => {
    // Function to count documents from category cards
    function calculateDocStats() {
        const categoryCards = document.querySelectorAll('.doc-category-card');
        let totalDocs = 0;

        // Sum up all document counts from category cards
        categoryCards.forEach(card => {
            const countText = card.querySelector('.doc-category-count');
            if (countText) {
                const count = parseInt(countText.textContent.match(/\d+/)[0]);
                totalDocs += count;
            }
        });

        // Calculate derived statistics
        const avgWordsPerDoc = 1500; // Average words per technical document
        const totalWords = totalDocs * avgWordsPerDoc;
        const avgHoursPerDoc = 3; // Average hours per document
        const totalHours = totalDocs * avgHoursPerDoc;

        // Count unique technologies (could be enhanced to parse from content)
        const techCount = 30; // Base count

        return {
            documents: totalDocs,
            words: totalWords,
            hours: totalHours,
            technologies: techCount
        };
    }

    // Animate counter from 0 to target value
    function animateCounter(element, target, duration = 2000, suffix = '', prefix = '') {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            // Format the number
            let displayValue = Math.floor(current);

            // Special formatting for large numbers (words count)
            if (suffix === 'K') {
                displayValue = Math.floor(current / 1000);
            }

            element.textContent = prefix + displayValue.toLocaleString('fr-FR') + suffix;
        }, 16);
    }

    // Initialize counters when stats section becomes visible
    function initDocCounters() {
        const statsHero = document.querySelector('.doc-stats-hero');
        if (!statsHero) return;

        const stats = calculateDocStats();
        let animated = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;

                    // Get all stat cards in order
                    const statCards = statsHero.querySelectorAll('.doc-stat-card');

                    // Map stat values to calculated data
                    const statMapping = [
                        stats.documents,      // First card: Documents
                        stats.words,          // Second card: Words
                        stats.hours,          // Third card: Hours
                        stats.technologies    // Fourth card: Technologies
                    ];

                    statCards.forEach((card, index) => {
                        const statElement = card.querySelector('.doc-stat-value');
                        if (!statElement) return;

                        const suffix = statElement.getAttribute('data-suffix') || '';
                        const prefix = statElement.getAttribute('data-prefix') || '';
                        const calculatedValue = statMapping[index];

                        // Update the data-count attribute with calculated value
                        statElement.setAttribute('data-count', calculatedValue);

                        animateCounter(statElement, calculatedValue, 2000, suffix, prefix);
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(statsHero);
    }

    // Initialize on portfolio ready event
    document.addEventListener('portfolioReady', function() {
        initDocCounters();
    });

    // Fallback if event doesn't fire
    setTimeout(() => {
        if (!document.querySelector('.doc-stat-value').textContent.match(/\d+/)) {
            initDocCounters();
        }
    }, 1000);
});
