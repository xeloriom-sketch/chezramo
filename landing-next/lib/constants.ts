import type { MenuItem, Review } from './types'

export const SAUCES = [
  'Blanche','Algérienne','Mayonnaise','Ketchup','Samouraï',
  'Curry','Barbecue','Andalouse','Tartare','Burger','Harissa','Moutarde',
]

export const REMOVABLES = ['Tomate','Oignon','Salade','Cornichon','Poivron']

export const DRINKS = [
  'Coca-Cola','Fanta Orange','Fanta Citron','Sprite',
  'Ice Tea Pêche','Ice Tea Citron','Oasis','Eau plate','Eau gazeuse',
]

export const NO_SAUCE_CATEGORIES = [
  'Salades Fraiches','Salades & Burek','Accompagnements & Sauces',
  'Desserts','Menu Enfants','Finger Food','Burek & Specialites',
  'Plats Maison','Boissons & Boissons Chaudes',
]

export const REVIEWS: Review[] = [
  {
    quote: '"Tombé par hasard sur ce kebab, et effectivement c\'était excellent, rien à voir avec les commentaires négatifs. Qualité irréprochable."',
    author: 'Maé T.',
    stars: 5,
  },
  {
    quote: '"L\'assiette est super généreuse et la viande super bonne. La broche est de meilleure qualité que chez les autres — j\'y retournerai bientôt."',
    author: 'Yukii J.',
    stars: 5,
  },
  {
    quote: '"Changement de propriétaire depuis peu. Préparation faite en famille avec sourire et bonne humeur. Allez-y !"',
    author: 'Sab\' L.',
    stars: 5,
  },
  {
    quote: '"Le kebab vient de changer de propriétaire et franchement, très bonne surprise ! Super bon, bien garni et généreux. On sent la qualité et le soin."',
    author: 'Ugur D.',
    stars: 5,
  },
  {
    quote: '"Super viande, pas grasse du tout. Très propre. Accueil au top."',
    author: 'Brahim A.',
    stars: 5,
  },
  {
    quote: '"Accueil au top, nourriture au top, service au top ! N\'hésitez pas, c\'est une bonne adresse pour bien manger."',
    author: 'Seb',
    stars: 5,
  },
  {
    quote: '"Curieux de voir ce que ça donnerait après le changement de propriétaire — je n\'ai vraiment pas été déçu. Je vous conseille vivement de le tester."',
    author: 'Baptiste P.',
    stars: 5,
  },
  {
    quote: '"Entrés par hasard en famille. Un accueil au top, des conseils sympathiques pour les enfants. De très belles assiettes, nous nous sommes régalés."',
    author: 'Solène G.',
    stars: 5,
  },
]

export const MENU_DATA: MenuItem[] = [
  {title:'Kebab',description:'Pain rond, veau de broche, crudités — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Sandwichs Vedettes'},
  {title:'Kebab Frites',description:'Viande et frites servies dans le pain',price:'9,50',menu_price:'',category:'Sandwichs Vedettes'},
  {title:'Kebab Géant',description:'Double portion de veau de broche — Menu +2 €',price:'15,00',menu_price:'17,00',category:'Sandwichs Vedettes'},
  {title:'Kofte',description:'Boulettes de viande hachée épicées — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Nos Spécialités'},
  {title:'Américain',description:'Steak haché et cheddar fondu — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Nos Spécialités'},
  {title:'Escalope',description:'Filet de poulet pané — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Nos Spécialités'},
  {title:'Cordon Bleu',description:'Sandwich au cordon bleu fondant — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Tradition & Galettes'},
  {title:'Galette (Dürum)',description:'Fine galette roulée, veau, crudités — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Tradition & Galettes'},
  {title:'Miche Kebab',description:'Pain miche traditionnel croustillant — Menu +3 €',price:'9,00',menu_price:'12,00',category:'Tradition & Galettes'},
  {title:'Tacos',description:'Sauce fromagère et frites incluses — Menu +3 €',price:'10,00',menu_price:'13,00',category:'Tacos'},
  {title:'Maxi Tacos',description:'Format géant avec 2 viandes — Menu +2 €',price:'15,00',menu_price:'17,00',category:'Tacos'},
  {title:'Chicken Burger',description:'Poulet croustillant et cheddar — Menu +3 €',price:'6,00',menu_price:'9,00',category:'Burgers'},
  {title:'Cheese Burger',description:'Steak haché et fromage fondu — Menu +3 €',price:'6,00',menu_price:'9,00',category:'Burgers'},
  {title:'Nuggets (x7)',description:'Filets de poulet frits dorés',price:'8,50',menu_price:'',category:'Finger Food'},
  {title:'Wings (x4)',description:'Ailerons de poulet épicés',price:'7,50',menu_price:'',category:'Finger Food'},
  {title:'Tenders (x4)',description:'Aiguillettes de poulet tendres',price:'7,50',menu_price:'',category:'Finger Food'},
  {title:'Assiette Kebab',description:'Veau de broche servi à l\'assiette',price:'15,00',menu_price:'',category:'Assiettes Gourmet'},
  {title:'Assiette Escalope',description:'Poulet pané ou grillé',price:'15,00',menu_price:'',category:'Assiettes Gourmet'},
  {title:'Assiette Kofte',description:'Boulettes grillées',price:'15,00',menu_price:'',category:'Assiettes Gourmet'},
  {title:'Assiette Steak',description:'Steaks hachés grillés minute',price:'15,00',menu_price:'',category:'Assiettes Gourmet (Suite)'},
  {title:'Assiette Cordon Bleu',description:'Deux cordons bleus fondants',price:'15,00',menu_price:'',category:'Assiettes Gourmet (Suite)'},
  {title:'Assiette Mixte',description:'Kebab + 2 viandes au choix',price:'18,00',menu_price:'',category:'Assiettes Gourmet (Suite)'},
  {title:'Assiette Enfant',description:'Frites + viande au choix',price:'12,00',menu_price:'',category:'Assiettes & Salade'},
  {title:'Assiette Emporter',description:'Format pratique — Mixte 18 €',price:'15,00',menu_price:'',category:'Assiettes & Salade'},
  {title:'Escalope Crème',description:'Poulet à la crème, champignons, légumes',price:'12,50',menu_price:'',category:'Plats Maison'},
  {title:'Filet de Poulet',description:'Frites, fromage, tomate, sauce blanche',price:'12,00',menu_price:'',category:'Plats Maison'},
  {title:'Pleskavice',description:'Frites, fromage, tomate, sauce blanche',price:'9,50',menu_price:'',category:'Plats Maison'},
  {title:'Makarona',description:'Penne, sauce tomate, fromage râpé',price:'8,50',menu_price:'',category:'Burek & Spécialités'},
  {title:'Qofte x5',description:'5 pièces de viande hachée grillées',price:'9,00',menu_price:'',category:'Qofte Grillées'},
  {title:'Qofte x7',description:'7 pièces de viande hachée grillées',price:'11,00',menu_price:'',category:'Qofte Grillées'},
  {title:'Qofte x10',description:'10 pièces de viande hachée grillées',price:'13,00',menu_price:'',category:'Qofte Grillées'},
  {title:'Salade Grecque',description:'Tomates, concombres, olives, feta, oignons',price:'6,00',menu_price:'',category:'Salades Fraîches'},
  {title:'Salade du Berger',description:'Crudités, feta et olives',price:'10,00',menu_price:'',category:'Salades Fraîches'},
  {title:'Salade Shope',description:'Saladerie fraîche',price:'6,00',menu_price:'',category:'Salades Fraîches'},
  {title:'Burek Fromage',description:'Feuilleté au fromage',price:'3,50',menu_price:'',category:'Salades & Burek'},
  {title:'Burek Épinards',description:'Feuilleté aux épinards et fromage',price:'3,50',menu_price:'',category:'Salades & Burek'},
  {title:'Burek Viande',description:'Feuilleté croustillant à la viande',price:'4,00',menu_price:'',category:'Salades & Burek'},
  {title:'Fli - Flija',description:'Fli traditionnel',price:'4,00',menu_price:'',category:'Salades & Burek'},
  {title:'Trilece',description:'Dessert traditionnel au lait',price:'3,50',menu_price:'',category:'Desserts'},
  {title:'Tiramisu',description:'Tiramisu',price:'3,50',menu_price:'',category:'Desserts'},
  {title:'Menu Enfant',description:'4 Nuggets ou viande au choix',price:'10,00',menu_price:'',category:'Menu Enfants'},
  {title:'Frites',description:'Petite — Grande 3,00 €',price:'2,00',menu_price:'',category:'Accompagnements & Sauces'},
  {title:'Barquette Viande',description:'Portion de veau 100% artisanal',price:'10,00',menu_price:'',category:'Accompagnements & Sauces'},
  {title:'Coca-Cola',description:'33 cl',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Fanta Orange',description:'33 cl',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Fanta Citron',description:'33 cl',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Sprite',description:'33 cl — citron vert',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Ice Tea Pêche',description:'33 cl — Lipton pêche',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Ice Tea Citron',description:'33 cl — Lipton citron',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Oasis',description:'33 cl — tropical',price:'2,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Eau plate',description:'50 cl — Evian ou Volvic',price:'1,00',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Eau gazeuse',description:'33 cl — Perrier',price:'1,50',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Café',description:'Serré, allongé ou noisette',price:'1,50',menu_price:'',category:'Boissons & Boissons Chaudes'},
  {title:'Thé à la menthe',description:'Traditionnel ou nature',price:'1,50',menu_price:'',category:'Boissons & Boissons Chaudes'},
]
