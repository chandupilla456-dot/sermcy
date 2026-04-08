import type { Juice } from '../types/juice';

export const JUICES: Juice[] = [
  {
    id: '1',
    name: 'Sunrise Citrus',
    tagline: 'Orange, carrot & ginger',
    ingredients: ['Orange', 'Carrot', 'Ginger', 'Cold-pressed'],
    price: '$6.50',
    accent: '#E85D04',
  },
  {
    id: '2',
    name: 'Green Glow',
    tagline: 'Spinach, apple & lime',
    ingredients: ['Spinach', 'Green apple', 'Lime', 'Cucumber'],
    price: '$7.00',
    accent: '#2D6A4F',
  },
  {
    id: '3',
    name: 'Berry Boost',
    tagline: 'Mixed berries & beet',
    ingredients: ['Strawberry', 'Blueberry', 'Beet', 'Lemon'],
    price: '$7.50',
    accent: '#9D4EDD',
  },
  {
    id: '4',
    name: 'Tropical Chill',
    tagline: 'Mango, pineapple & coconut',
    ingredients: ['Mango', 'Pineapple', 'Coconut water'],
    price: '$6.75',
    accent: '#F4A259',
  },
];
