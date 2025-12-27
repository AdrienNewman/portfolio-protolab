// Terminal Boot Script
let bootSequenceRunning = true;
const timeouts = [];
let terminalOutput;
let terminalBoot;
let skipBtn;
let mainPortfolio;

const debianAscii = `       _,met$$$$$gg.
    ,g$$$$$$$$$$$$$$$P.
  ,g$$P"        """Y$$.".
 ,$$P'              \`$$$.
',$$P       ,ggs.    \`$$b:
\`d$$'     ,$P"'   .    $$$
 $$P      d$'     ,    $$P
 $$:      $$.   -    ,d$$'
 $$;      Y$b._   _,d$P'
 Y$$.    \`.\`"Y$$$$P"'
 \`$$b      "-.__
  \`Y$$
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""`;

const bootSequence = [
    { type: 'command', text: 'neofetch', delay: 100 },
    { type: 'neofetch', delay: 100 },
    { type: 'empty', delay: 400 },
    { type: 'command', text: 'cat /etc/protolab/owner.conf', delay: 100 },
    { type: 'info', text: '# ═══════════════════════════════════════', delay: 30 },
    { type: 'info', text: '#  PROTOLAB INFRASTRUCTURE', delay: 30 },
    { type: 'info', text: '# ═══════════════════════════════════════', delay: 30 },
    { type: 'output', text: 'NAME="Adrien Mercadier"', delay: 50 },
    { type: 'output', text: 'ROLE="Technicien Systèmes & Réseaux"', delay: 50 },
    { type: 'highlight', text: 'STATUS="Disponible"', delay: 50 },
    { type: 'empty', delay: 300 },
    { type: 'command', text: './launch_portfolio.sh', delay: 100 },
    { type: 'output', text: 'Initializing portfolio...', delay: 100 },
    { type: 'progress', text: 'Loading', delay: 600 },
    { type: 'success', text: '✓ Ready', delay: 200 },
    { type: 'launch', delay: 500 }
];

function createLine(content) {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = content;
    return line;
}

function getPrompt() {
    return `<span class="term-user">adrien</span><span class="term-prompt">@</span><span class="term-user">protolab</span><span class="term-prompt">:</span><span class="term-path">~</span><span class="term-prompt">$ </span>`;
}

async function typeCommand(command, element) {
    let typed = '';
    for (let char of command) {
        if (!bootSequenceRunning) return;
        typed += char;
        element.innerHTML = getPrompt() + `<span class="term-command">${typed}</span><span class="typing-cursor-term"></span>`;
        await sleep(25 + Math.random() * 35);
    }
    element.innerHTML = getPrompt() + `<span class="term-command">${command}</span>`;
}

function createNeofetch() {
    const container = document.createElement('div');
    container.className = 'term-line';
    container.innerHTML = `<div class="neofetch-container"><pre class="neofetch-ascii">${debianAscii}</pre><div class="neofetch-info"><div><span class="neofetch-label">adrien</span>@<span class="neofetch-label">protolab</span></div><div style="color:var(--gray-light)">─────────────────────</div><div><span class="neofetch-label">OS:</span> Debian 12</div><div><span class="neofetch-label">Host:</span> Proxmox VE 8.x</div><div><span class="neofetch-label">CPU:</span> AMD Ryzen 7 5800X</div><div><span class="neofetch-label">GPU:</span> NVIDIA RTX 3060</div><div><span class="neofetch-label">Memory:</span> 12GB / 32GB</div><div style="margin-top:8px"><span class="neofetch-label">Role:</span> <span style="color:var(--neon-cyan)">TSSR</span></div><div class="neofetch-colors"><div class="color-block" style="background:#0d1117"></div><div class="color-block" style="background:#f85149"></div><div class="color-block" style="background:#3fb950"></div><div class="color-block" style="background:#d29922"></div><div class="color-block" style="background:#58a6ff"></div><div class="color-block" style="background:#a371f7"></div><div class="color-block" style="background:#00ffff"></div><div class="color-block" style="background:#fff"></div></div></div></div>`;
    return container;
}

async function createProgressBar(text) {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="term-output">${text}...</span> <div class="term-progress"><div class="term-progress-bar"></div></div>`;
    terminalOutput.appendChild(line);
    const bar = line.querySelector('.term-progress-bar');
    for (let i = 0; i <= 100; i += 5) {
        if (!bootSequenceRunning) return;
        bar.style.width = i + '%';
        await sleep(25);
    }
}

function sleep(ms) {
    return new Promise(r => { timeouts.push(setTimeout(r, ms)); });
}

async function runBootSequence() {
    for (const item of bootSequence) {
        if (!bootSequenceRunning) return;
        switch (item.type) {
            case 'command':
                const cmdLine = createLine('');
                terminalOutput.appendChild(cmdLine);
                await typeCommand(item.text, cmdLine);
                break;
            case 'output': terminalOutput.appendChild(createLine(`<span class="term-output">${item.text}</span>`)); break;
            case 'success': terminalOutput.appendChild(createLine(`<span class="term-success">${item.text}</span>`)); break;
            case 'info': terminalOutput.appendChild(createLine(`<span class="term-info">${item.text}</span>`)); break;
            case 'highlight': terminalOutput.appendChild(createLine(`<span class="term-highlight">${item.text}</span>`)); break;
            case 'neofetch': terminalOutput.appendChild(createNeofetch()); break;
            case 'progress': await createProgressBar(item.text); break;
            case 'empty': terminalOutput.appendChild(createLine('&nbsp;')); break;
            case 'launch': launchPortfolio(); return;
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        await sleep(item.delay);
    }
}

function launchPortfolio() {
    skipBtn.classList.add('hidden');
    terminalBoot.classList.add('fade-out');
    setTimeout(() => {
        terminalBoot.classList.add('hidden');
        mainPortfolio.classList.add('visible');

        // Trigger portfolio initialization via custom event
        const event = new CustomEvent('portfolioReady');
        document.dispatchEvent(event);
    }, 800);
}

function skipBoot() {
    bootSequenceRunning = false;
    timeouts.forEach(t => clearTimeout(t));
    launchPortfolio();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    terminalOutput = document.getElementById('terminal-output');
    terminalBoot = document.getElementById('terminal-boot');
    skipBtn = document.getElementById('skip-btn');
    mainPortfolio = document.getElementById('main-portfolio');

    if (skipBtn) {
        skipBtn.addEventListener('click', skipBoot);
    }

    document.addEventListener('keydown', e => {
        if ((e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') && bootSequenceRunning) skipBoot();
    });

    // Auto-start boot sequence
    runBootSequence();
});
