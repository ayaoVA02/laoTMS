export interface TravelPlan {
  id: string;
  name: string;
  description: string;
  attractionIds: string[];
  startDate: string;
  endDate: string;
  userId: string;
  createdAt: string;
}

export const demoTravelPlans: TravelPlan[] = [
  {
    id: 'tp1',
    name: 'Luang Prabang Heritage Tour',
    description: 'Explore the UNESCO World Heritage city of Luang Prabang with its stunning temples and waterfalls.',
    attractionIds: ['2', '3', '7'],
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    userId: '4',
    createdAt: '2026-04-15',
  },
  {
    id: 'tp2',
    name: 'Vientiane City Break',
    description: 'A short trip exploring the capital city highlights and local cuisine.',
    attractionIds: ['1', '5', '9'],
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    userId: '4',
    createdAt: '2026-04-20',
  },
  {
    id: 'tp3',
    name: 'Adventure Week',
    description: 'Thrilling adventure activities in Vang Vieng combined with nature exploration.',
    attractionIds: ['4', '2', '8'],
    startDate: '2026-08-01',
    endDate: '2026-08-07',
    userId: '4',
    createdAt: '2026-05-01',
  },
];
