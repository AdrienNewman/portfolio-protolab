# Content Collections & Schémas

> 2026-01-04 | Admin Backend v1.0

---

## 🆕 Sections Data (JSON)

**Fichier** : `src/data/sections.json`

### Structure
```json
{
  "hero": { /* HeroContent */ },
  "profile": { /* ProfileContent */ },
  "contact": { /* ContactContent */ }
}
```

### Interfaces (src/types/content.ts)
```typescript
interface HeroContent {
  name: { firstName: string; lastName: string };
  title: string;
  subtitle: string;
  badge: { text: string; icon: string };
  typingSkills: string[];
  stats: Array<{ value: string; label: string }>;
  cta: { text: string; href: string };
}

interface ProfileContent {
  sectionLabel: string;
  sectionTitle: string;
  sectionDesc: string;
  terminal: {
    user: string;
    role: string;
    age: string;
    status: string;
    careerLog: string[];
    story: string[];
  };
  softSkills: Array<{ label: string; value: number; colorClass: string }>;
  certifications: Array<{
    name: string;
    issuer: string;
    image: string;
    credlyUrl: string;
    details?: { duration: string; skills: string[] };
  }>;
}

interface ContactContent {
  sectionLabel: string;
  sectionTitle: string;
  sectionDesc: string;
  links: Array<{
    type: 'email' | 'linkedin' | 'github' | 'portfolio';
    label: string;
    value: string;
    href: string;
    icon: string;  // SVG path
  }>;
}
```

**Éditable via** : Admin `:4322` → Tab "Sections"

---

## 🆕 Skills Data (JSON)

**Fichier** : `src/data/skills.json`

### Structure
```json
[
  {
    "id": "windows",
    "icon": "windows",
    "previewTitle": "Windows Server",
    "previewDescription": "...",
    "previewTags": ["AD DS", "GPO"],
    "modalTitle": "Windows Server & Active Directory",
    "sections": [
      { "title": "Maîtrise Technique", "items": ["...", "..."] }
    ]
  }
]
```

### Interface
```typescript
interface SkillSection {
  title: string;
  items: string[];
}

interface SkillData {
  id: string;
  icon: string;
  previewTitle: string;
  previewDescription: string;
  previewTags: string[];
  modalTitle: string;
  sections: SkillSection[];
}
```

**Éditable via** : Admin `:4322` → Tab "Compétences"

---

## 📦 Projects Collection (YAML)

**Chemin** : `src/content/projects/*.yaml`

### Schéma Zod
```typescript
z.object({
  title: z.string(),
  description: z.string(),
  stack: z.array(z.string()),
  status: z.string(),
  featured: z.boolean().default(false),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  stats: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional()
})
```

### Exemple
```yaml
title: "Infrastructure Protolab"
stack: ["Proxmox VE", "Palo Alto", "Docker"]
status: "Production"
iconColor: "#00ffff"
stats:
  - label: "VMs"
    value: "15+"
```

**5 projets** : protolab, llm-local, observability, control-plane, web-interface

---

## 📄 Docs Collection (Markdown)

**Chemin** : `src/content/docs/*.md`

### Schéma Zod
```typescript
z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum([
    'active-directory', 'paloalto', 'monitoring', 'proxmox',
    'linux', 'windows', 'docker', 'backup', 'network',
    'security', 'documentation', 'architecture',
    'multimedia', 'llm', 'web-front'
  ]),
  date: z.date(),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional()
})
```

**12 docs** répartis sur 15 catégories

---

## 🗂️ Project Modals Data

**Fichier** : `src/data/projectModals.ts`

### Interface
```typescript
interface ProjectSection {
  title: string;
  type: 'text' | 'list' | 'tags';
  content?: string;
  items?: string[];
  tags?: string[];
}

interface ProjectModalData {
  id: string;
  title: string;
  iconSvg: string;
  iconColorClass?: string;
  sections: ProjectSection[];
}
```

**5 modales** : protolab, llm, observability, control-plane, web-interface

---

## 🔌 API Routes

### Portfolio

| Route | Type | Description |
|-------|------|-------------|
| `/api/lab-status.json` | GET | Métriques Proxmox (9 services) |
| `/api/docs/[slug].json` | GET | Contenu markdown + metadata |

### Admin

| Route | Méthodes | Cible |
|-------|----------|-------|
| `/api/sections` | GET/PUT | sections.json |
| `/api/skills` | GET/PUT | skills.json |
| `/api/projects` | GET/PUT | projects.json |

---

*Schémas optimisés | 2026-01-04*