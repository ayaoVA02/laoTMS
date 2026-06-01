export interface Attraction {
  attraction_id: string;
  name_en: string;
  name_la: string;
  description: string;
  province: string;
  district: string;
  location: string;
  thumbnail_image: string;
  rating: number;
  review_count: number;
  status: "approved" | "pending" | "draft" | "rejected";
  social_share: boolean;
  has_parking: boolean;
  has_restaurant: boolean;
  has_accommodation: boolean;
  has_internet: boolean;
  is_free_entry: boolean;
  entry_fee_foreigner: number;
  open_time: string;
  close_time: string;
  created_at: string;
  type_name?: string;
  // thumbnail URL resolved from R2 or storage
  thumbnailUrl?: string;
}

export const attractions: Attraction[] = [
  
];

export const categories = [
  { id: 'temple', name: 'Temples', icon: 'Landmark', count: 2 },
  { id: 'nature', name: 'Nature', icon: 'TreePine', count: 2 },
  { id: 'adventure', name: 'Adventure', icon: 'Mountain', count: 1 },
  { id: 'culture', name: 'Culture', icon: 'Palette', count: 1 },
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', count: 2 },
  { id: 'beach', name: 'Beaches', icon: 'Waves', count: 1 },
  { id: 'historical', name: 'Historical', icon: 'Building2', count: 2 },
  { id: 'nightlife', name: 'Nightlife', icon: 'Music', count: 1 },
];

export const promotions = [
  {
    id: 'p1',
    title: 'Early Bird Special - Kuang Si Falls',
    description: 'Get 30% off when you visit before 8 AM. Experience the falls with fewer crowds!',
    discount: 30,
    attractionId: '2',
    validUntil: '2026-06-30',
    image: 'https://images.pexels.com/photos/2406979/pexels-photo-2406979.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'p2',
    title: 'Cooking Class Bundle',
    description: 'Book a cooking class and get a free market tour. Learn authentic Lao cuisine!',
    discount: 20,
    attractionId: '9',
    validUntil: '2026-07-15',
    image: 'https://images.pexels.com/photos/2406982/pexels-photo-2406982.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'p3',
    title: 'Adventure Package - Vang Vieng',
    description: 'Tubing + Rock Climbing + Cave Tour combo at 40% off. Limited time offer!',
    discount: 40,
    attractionId: '4',
    validUntil: '2026-05-31',
    image: 'https://images.pexels.com/photos/2406981/pexels-photo-2406981.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export const reviews = [
  { id: 'r1', attractionId: '1', userId: 'u1', userName: 'Sarah M.', rating: 5, comment: 'Absolutely breathtaking! The golden stupa is even more beautiful in person. A must-visit in Vientiane.', date: '2025-12-15' },
  { id: 'r2', attractionId: '1', userId: 'u2', userName: 'Tom K.', rating: 4, comment: 'Beautiful temple with rich history. The guide was very knowledgeable. Wish there were more English signs.', date: '2025-11-20' },
  { id: 'r3', attractionId: '2', userId: 'u3', userName: 'Emily R.', rating: 5, comment: 'The most beautiful waterfall I have ever seen! The turquoise pools are perfect for swimming.', date: '2026-01-10' },
  { id: 'r4', attractionId: '2', userId: 'u4', userName: 'David L.', rating: 5, comment: 'Stunning natural beauty. Go early to avoid crowds. The hike up is worth it!', date: '2025-12-28' },
  { id: 'r5', attractionId: '4', userId: 'u5', userName: 'Mike T.', rating: 4, comment: 'Great adventure activities. Tubing was fun but the river was a bit low. Rock climbing was excellent!', date: '2026-02-05' },
  { id: 'r6', attractionId: '7', userId: 'u6', userName: 'Lisa W.', rating: 5, comment: 'Amazing night market! So many unique handicrafts and delicious street food. Great atmosphere.', date: '2026-01-22' },
  { id: 'r7', attractionId: '10', userId: 'u7', userName: 'James P.', rating: 4, comment: 'Very relaxed island vibe. Perfect for unwinding. Saw the dolphins which was magical!', date: '2025-11-15' },
  { id: 'r8', attractionId: '9', userId: 'u8', userName: 'Anna S.', rating: 5, comment: 'Best cooking class ever! The instructor was so patient and the food was delicious. Highly recommend!', date: '2026-03-01' },
];
