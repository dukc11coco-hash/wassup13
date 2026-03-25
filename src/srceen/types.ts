export interface Tool {
  id: number;
  name: string;
  icon: string;
  language: string;
  category: string;
  level: string;
  price: string;
  priceType: 'free' | 'paid';
  description: string;
  tags: string[];
  filterTags: string[];
  reason: string;
  recommendFor: string[];
  website: string;
}

export type FilterType = 'all' | 'writing' | 'research' | 'image' | 'coding' | 'automation' | 'free' | 'korean';
export type TabType = 'home' | 'collection';

export interface RecommendationWizardState {
  purpose: 'writing' | 'research' | 'image' | 'coding' | 'automation' | null;
  price: 'free' | 'any' | null;
  koreanOnly: boolean;
}
