export interface Notification {
  id: string;
  type: 'approved' | 'rejected' | 'update_reminder' | 'auto_hidden' | 'social_post' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export const demoNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'approved',
    title: 'Attraction Approved',
    message: 'Your attraction "Pha That Luang" has been approved and is now visible to tourists.',
    read: false,
    createdAt: '2026-05-04T10:30:00Z',
    relatedId: '1',
  },
  {
    id: 'n2',
    type: 'update_reminder',
    title: 'Update Required',
    message: 'Your attraction "Kuang Si Falls" is 6 months old. Please update the information to keep it current.',
    read: false,
    createdAt: '2026-05-03T14:00:00Z',
    relatedId: '2',
  },
  {
    id: 'n3',
    type: 'social_post',
    title: 'Auto-Posted to Social Media',
    message: 'Your attraction "Vang Vieng Adventure" has been automatically shared on Facebook and Instagram after approval.',
    read: true,
    createdAt: '2026-05-02T09:15:00Z',
    relatedId: '4',
  },
  {
    id: 'n4',
    type: 'rejected',
    title: 'Attraction Rejected',
    message: 'Your attraction submission was rejected due to incomplete information. Please update and resubmit.',
    read: false,
    createdAt: '2026-05-01T16:45:00Z',
  },
  {
    id: 'n5',
    type: 'info',
    title: 'New Review',
    message: 'A tourist left a 5-star review on "Night Market Luang Prabang". Check it out!',
    read: true,
    createdAt: '2026-04-30T11:20:00Z',
    relatedId: '7',
  },
  {
    id: 'n6',
    type: 'auto_hidden',
    title: 'Attraction Auto-Hidden',
    message: 'Your attraction was automatically hidden due to no response after 2 update notifications. Please update to restore visibility.',
    read: false,
    createdAt: '2026-04-28T08:00:00Z',
  },
  {
    id: 'n7',
    type: 'approved',
    title: 'Attraction Approved',
    message: 'Your attraction "Si Phan Don (4000 Islands)" has been approved and is now live!',
    read: true,
    createdAt: '2026-04-25T13:30:00Z',
    relatedId: '10',
  },
];
