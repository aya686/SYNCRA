// src/app/modules/resources/models/machine.model.ts

export enum CategoryType {
  INDUSTRIELLE = 'INDUSTRIELLE',
  DOMESTIQUE = 'DOMESTIQUE',
  AGRICOLE = 'AGRICOLE',
  ELECTRONIQUE = 'ELECTRONIQUE',
  MEDICAL = 'MEDICAL',
  BUREAUTIQUE = 'BUREAUTIQUE',
  CONSTRUCTION = 'CONSTRUCTION',
  AUTRE = 'AUTRE'
}

export enum MachineType {
  EQUIPMENT = 'EQUIPMENT',
  RAW_MATERIAL = 'RAW_MATERIAL',
  PART_ACCESSORY = 'PART_ACCESSORY'
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  RESERVED = 'RESERVED'
}

export enum TransactionType {
  SALE = 'SALE',
  RENT = 'RENT',
  BOTH = 'BOTH'
}

export interface Machine {
  id: number;
  name: string;
  description: string;
  category: CategoryType;
  type: MachineType;
  availability: AvailabilityStatus;
  transactionType: TransactionType;
  price: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  supplierId: number;
  supplierName: string;
  isInApp: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineRequest {
  name: string;
  description: string;
  category: CategoryType;
  type: MachineType;
  availability: AvailabilityStatus;
  transactionType: TransactionType;
  price: number;
  priceUnit: string;
  location: string;
  contactInfo: string;
  stockQuantity: number;
  imageUrls: string[];
  supplierId: number;
  supplierName: string;
  isInApp: boolean;
}