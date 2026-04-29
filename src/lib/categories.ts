export type CategoryItem = {
  slug: string;
  name: string;
  parent?: string;
};

export const CATEGORIES: CategoryItem[] = [
  { slug: 'jewellery', name: 'Jewellery' },
  { slug: 'rings', name: 'Rings', parent: 'jewellery' },
  { slug: 'necklaces', name: 'Necklaces', parent: 'jewellery' },
  { slug: 'earrings', name: 'Earrings', parent: 'jewellery' },
  { slug: 'bracelets', name: 'Bracelets', parent: 'jewellery' },
  { slug: 'bangles', name: 'Bangles', parent: 'jewellery' },
  { slug: 'pendants', name: 'Pendants', parent: 'jewellery' },
  { slug: 'brooches', name: 'Brooches', parent: 'jewellery' },
  { slug: 'anklets', name: 'Anklets', parent: 'jewellery' },
  { slug: 'fine-jewellery', name: 'Fine Jewellery' },
  { slug: 'diamond', name: 'Diamond', parent: 'fine-jewellery' },
  { slug: 'gold', name: 'Gold', parent: 'fine-jewellery' },
  { slug: 'silver', name: 'Silver', parent: 'fine-jewellery' },
  { slug: 'platinum', name: 'Platinum', parent: 'fine-jewellery' },
  { slug: 'gemstone', name: 'Gemstone', parent: 'fine-jewellery' },
  { slug: 'accessories', name: 'Accessories' },
  { slug: 'watches', name: 'Watches', parent: 'accessories' },
  { slug: 'bags', name: 'Bags', parent: 'accessories' },
  { slug: 'scarves', name: 'Scarves', parent: 'accessories' },
  { slug: 'gifts', name: 'Gifts & Sets' },
];

export const PARENT_CATEGORIES = CATEGORIES.filter((c) => !c.parent);

export function getSubcategories(parentSlug: string): CategoryItem[] {
  return CATEGORIES.filter((c) => c.parent === parentSlug);
}

export function getCategoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
