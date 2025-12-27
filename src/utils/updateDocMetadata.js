#!/usr/bin/env node
/**
 * Documentation Metadata Utility Script
 *
 * Usage: node src/utils/updateDocMetadata.js
 *
 * This script:
 * - Scans all documentation files in src/content/docs/
 * - Validates frontmatter against the schema
 * - Reports any issues found
 * - Can generate reference-portfolio.md from REFERENCE_PORTFOLIO.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '..', 'content', 'docs');

const VALID_CATEGORIES = [
    'active-directory',
    'paloalto',
    'monitoring',
    'proxmox',
    'linux',
    'windows',
    'docker',
    'backup',
    'network',
    'security',
    'documentation',
    'architecture',
    'multimedia',
    'llm',
    'web-front'
];

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const frontmatter = {};
    const lines = match[1].split('\n');
    let currentKey = null;
    let inArray = false;

    for (const line of lines) {
        if (line.match(/^\s*-\s+/)) {
            // Array item
            if (currentKey && inArray) {
                if (!frontmatter[currentKey]) frontmatter[currentKey] = [];
                frontmatter[currentKey].push(line.replace(/^\s*-\s+/, '').trim());
            }
        } else if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            currentKey = key.trim();

            if (value === '') {
                inArray = true;
                frontmatter[currentKey] = [];
            } else {
                inArray = false;
                frontmatter[currentKey] = value.replace(/^["']|["']$/g, '');
            }
        }
    }

    return frontmatter;
}

function validateDoc(filePath, frontmatter) {
    const issues = [];
    const fileName = path.basename(filePath);

    // Required fields
    if (!frontmatter.title) issues.push('Missing title');
    if (!frontmatter.description) issues.push('Missing description');
    if (!frontmatter.category) issues.push('Missing category');
    if (!frontmatter.date) issues.push('Missing date');

    // Validate category
    if (frontmatter.category && !VALID_CATEGORIES.includes(frontmatter.category)) {
        issues.push(`Invalid category: ${frontmatter.category}`);
    }

    // Validate difficulty if present
    if (frontmatter.difficulty && !VALID_DIFFICULTIES.includes(frontmatter.difficulty)) {
        issues.push(`Invalid difficulty: ${frontmatter.difficulty}`);
    }

    // Validate date format
    if (frontmatter.date && isNaN(new Date(frontmatter.date).getTime())) {
        issues.push(`Invalid date format: ${frontmatter.date}`);
    }

    return { fileName, issues, frontmatter };
}

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

        return { lastModified, readingTime, wordCount };
    } catch (error) {
        // Si pas de commit Git, utiliser la date du fichier
        const stats = fs.statSync(filePath);
        const lastModified = stats.mtime.toISOString().split('T')[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200);

        return { lastModified, readingTime, wordCount };
    }
}

function generateReferenceDoc() {
    const rootDir = path.resolve(__dirname, '..', '..');
    const sourceFile = path.join(rootDir, 'Documentation Porte Folio', 'REFERENCE_PORTFOLIO.md');
    const targetFile = path.join(rootDir, 'src', 'content', 'docs', 'reference-portfolio.md');

    if (!fs.existsSync(sourceFile)) {
        console.log('⚠️  REFERENCE_PORTFOLIO.md not found, skipping generation');
        return;
    }

    const metadata = getDocMetadata(sourceFile);
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

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
  - documentation
  - architecture
  - frontend
author: Adrien Mercadier
readingTime: ${metadata.readingTime}
featured: true
difficulty: intermediate
---

${sourceContent}`;

    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetFile, frontmatter, 'utf-8');

    console.log(`✅ Generated: reference-portfolio.md`);
    console.log(`   📅 Date: ${metadata.lastModified}`);
    console.log(`   📖 Reading time: ${metadata.readingTime} min`);
}

function main() {
    console.log('=== Documentation Metadata Validator ===\n');

    // Generate reference doc from REFERENCE_PORTFOLIO.md
    generateReferenceDoc();
    console.log('');

    if (!fs.existsSync(DOCS_DIR)) {
        console.error(`Error: Docs directory not found at ${DOCS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} documentation files\n`);

    let hasErrors = false;
    const results = [];

    for (const file of files) {
        const filePath = path.join(DOCS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const frontmatter = extractFrontmatter(content);

        if (!frontmatter) {
            results.push({ fileName: file, issues: ['No frontmatter found'], frontmatter: null });
            hasErrors = true;
            continue;
        }

        const result = validateDoc(filePath, frontmatter);
        results.push(result);
        if (result.issues.length > 0) hasErrors = true;
    }

    // Report
    console.log('--- Validation Results ---\n');

    for (const result of results) {
        if (result.issues.length === 0) {
            console.log(`[OK] ${result.fileName}`);
        } else {
            console.log(`[ERROR] ${result.fileName}`);
            result.issues.forEach(issue => console.log(`       - ${issue}`));
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Total files: ${results.length}`);
    console.log(`Valid: ${results.filter(r => r.issues.length === 0).length}`);
    console.log(`With errors: ${results.filter(r => r.issues.length > 0).length}`);

    // Category breakdown
    console.log('\n--- Categories ---');
    const categoryCount = {};
    for (const result of results) {
        if (result.frontmatter?.category) {
            categoryCount[result.frontmatter.category] = (categoryCount[result.frontmatter.category] || 0) + 1;
        }
    }
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
    });

    process.exit(hasErrors ? 1 : 0);
}

main();
