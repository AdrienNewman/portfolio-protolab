export interface NavItem {
  label: string;
  href: string;
  isCta?: boolean;
  isLab?: boolean;
}

export const navigationItems: NavItem[] = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Compétences', href: '#competences' },
  { label: 'Profil', href: '#profil' },
  { label: 'Projets', href: '#projets' },
  { label: 'Live_Lab', href: '#live-lab', isLab: true },
  { label: 'Documentation', href: '#documentation' },
  { label: 'Contact', href: '#contact' },
];

export const ctaItem: NavItem = {
  label: 'Disponible',
  href: '#contact',
  isCta: true,
};
