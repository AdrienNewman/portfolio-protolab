// ============ SECTIONS ============
export interface HeroContent {
  name: { firstName: string; lastName: string };
  title: string;
  subtitle: string;
  badge: { text: string; icon: string };
  typingSkills: string[];
  stats: Array<{ value: string; label: string }>;
  cta: { text: string; href: string };
}

export interface ProfileContent {
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
  softSkills: Array<{
    label: string;
    value: number;
    colorClass: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    image: string;
    credlyUrl: string;
    details?: {
      duration: string;
      skills: string[];
    };
  }>;
}

export interface ContactContent {
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

export interface SectionsData {
  hero: HeroContent;
  profile: ProfileContent;
  contact: ContactContent;
}

// ============ SKILLS ============
export interface SkillSection {
  title: string;
  items: string[];
}

export interface SkillData {
  id: string;
  icon: string;
  previewTitle: string;
  previewDescription: string;
  previewTags: string[];
  modalTitle: string;
  sections: SkillSection[];
}

// ============ PROJECTS ============
export interface ProjectData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stack: string[];
  featured: boolean;
  status: string;
  icon: string;  // SVG path
  iconColor: string;
  glowColor: string;
  statusDot?: string;
  stats: Array<{ value: string; label: string }>;
}

// ============ PROJECT MODALS ============
export type ProjectSectionType = 'text' | 'list' | 'tags';

export interface ProjectSection {
  title: string;
  type: ProjectSectionType;
  content?: string;
  items?: string[];
  tags?: string[];
}

export interface ProjectModalData {
  id: string;
  title: string;
  iconSvg: string;
  iconColorClass?: string;
  sections: ProjectSection[];
}
