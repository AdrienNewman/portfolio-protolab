// Typing Effect for Hero Section
document.addEventListener('DOMContentLoaded', () => {
    const typingText = document.querySelector('.typing-text');
    if (!typingText) return;

    // Liste des compétences à afficher
    const skills = [
        'Active Directory & GPO',
        'Linux & Docker',
        'Palo Alto Firewall',
        'Proxmox Virtualisation',
        'Monitoring & Observabilité',
        'Scripting Bash & PowerShell',
        'Infrastructure Cloud'
    ];

    let skillIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentSkill = skills[skillIndex];

        if (isDeleting) {
            // Suppression de caractères
            typingText.textContent = currentSkill.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Ajout de caractères
            typingText.textContent = currentSkill.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        // Si le mot est complètement tapé
        if (!isDeleting && charIndex === currentSkill.length) {
            // Pause à la fin du mot
            typingSpeed = 2000;
            isDeleting = true;
        }
        // Si le mot est complètement supprimé
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            // Passer au skill suivant
            skillIndex = (skillIndex + 1) % skills.length;
            // Petite pause avant de commencer le prochain mot
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    // Démarrer l'animation après un petit délai
    setTimeout(type, 1000);
});
