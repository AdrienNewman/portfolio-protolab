export interface NavItem {
  label: string;
  href: string;
  isCta?: boolean;
}

export const navigationItems: NavItem[] = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Compétences', href: '#competences' },
  { label: 'Profil', href: '#profil' },
  { label: 'Projets', href: '#projets' },
  { label: 'Documentation', href: '#documentation' },
  { label: 'Contact', href: '#contact' },
];

export const ctaItem: NavItem = {
  label: 'Disponible',
  href: '#contact',
  isCta: true,
};
