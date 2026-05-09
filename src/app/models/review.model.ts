// src/app/models/review.model.ts

export interface Review {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  userAvatarUrl: string;
  machineId: number | null;
  serviceId: number | null;
  machineName?: string;
  serviceName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReview {
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  machineId?: number | null;
  serviceId?: number | null;
}

export enum RatingValue {
  ONE_STAR = 1,
  TWO_STARS = 2,
  THREE_STARS = 3,
  FOUR_STARS = 4,
  FIVE_STARS = 5
}

export const RATING_LABELS: { [key: number]: string } = {
  1: 'Très mauvais',
  2: 'Mauvais',
  3: 'Moyen',
  4: 'Bien',
  5: 'Excellent'
};