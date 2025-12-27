import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDocMetadata(filePath) {
    try {
        // Dernière modification depuis Git
        const lastModified = execSync(`git log -1 --format=%cd --date=short "${filePath}"`)
            .toString()
            .trim();

        // Lire le fichier
        const content = fs.readFileSync(filePath, 'utf-8');

        // Calculer nombre de mots
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

        // Temps de lecture (200 mots/min)
        const readingTime = Math.ceil(wordCount / 200);

        // Hash du dernier commit
        const gitCommit = execSync(`git log -1 --format=%h "${filePath}"`)
            .toString()
            .trim();

        return { lastModified, readingTime, wordCount, gitCommit };
    } catch (error) {
        // Si pas de commit Git, utiliser la date du fichier
        const stats = fs.statSync(filePath);
        const lastModified = stats.mtime.toISOString().split('T')[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200);

        return { lastModified, readingTime, wordCount, gitCommit: 'unknown' };
    }
}

function updateDocumentFrontmatter() {
    const rootDir = path.resolve(__dirname, '..', '..');
    const sourceFile = path.join(rootDir, 'Documentation Porte Folio', 'REFERENCE_PORTFOLIO.md');
    const targetFile = path.join(rootDir, 'src', 'content', 'docs', 'reference-portfolio.md');

    // Vérifier que le fichier source existe
    if (!fs.existsSync(sourceFile)) {
        console.error(`❌ Fichier source introuvable : ${sourceFile}`);
        process.exit(1);
    }

    const metadata = getDocMetadata(sourceFile);

    // Lire le fichier source
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

    // Créer le frontmatter
    const frontmatter = `---
title: "Référence Technique - Portfolio Protolab V3"
description: "Documentation technique complète du portfolio : architecture Astro, structure du code, workflow Git, et guide de reprise pour LLM"
category: web-front
date: ${metadata.lastModified}
tags:
  - astro
  - typescript
  - docker
  - nginx
  - git
  - devops
  - documentation
  - architecture
  - frontend
author: Adrien Mercadier
readingTime: ${metadata.readingTime}
featured: true
difficulty: intermediate
---

${sourceContent}`;

    // S'assurer que le dossier de destination existe
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Écrire dans le fichier target
    fs.writeFileSync(targetFile, frontmatter, 'utf-8');

    console.log(`✅ Document mis à jour : ${targetFile}`);
    console.log(`📅 Dernière modification : ${metadata.lastModified}`);
    console.log(`📖 Temps de lecture : ${metadata.readingTime} min`);
    console.log(`📝 Nombre de mots : ${metadata.wordCount}`);
    console.log(`🔖 Commit : ${metadata.gitCommit}`);
}

// Exécuter le script
updateDocumentFrontmatter();
