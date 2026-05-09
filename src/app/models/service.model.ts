// src/app/modules/resources/models/service.model.ts

import { CategoryType, AvailabilityStatus } from './machine.model';

export enum ServiceType {
  FABRICATION = 'FABRICATION',
  REPARATION = 'REPARATION',
  CONSULTATION = 'CONSULTATION',
  LIVRAISON = 'LIVRAISON',
  AUTRE = 'AUTRE'
}

export interface ServiceEntity {
  id: number;
  name: string;
  description: string;
  category: CategoryType;
  serviceType: ServiceType;
  basePrice: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  availability: AvailabilityStatus;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  providerId: number;
  providerName: string;
  isInApp: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // ✅ AJOUTER CES PROPRIÉTÉS
  validationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  validatedBy?: number;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: CategoryType;
  serviceType: ServiceType;
  availability: AvailabilityStatus;
  basePrice: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  imageUrls: string[];
  providerId: number;
  providerName: string;
  isInApp: boolean;
}