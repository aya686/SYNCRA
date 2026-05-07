

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RequestType {
  FABRICATION = 'FABRICATION',
  SERVICE = 'SERVICE',
  MACHINE_RENT = 'MACHINE_RENT',
  MACHINE_PURCHASE = 'MACHINE_PURCHASE',
  REPARATION = 'REPARATION',
  CONSULTATION = 'CONSULTATION'
}

export interface RequestAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  targetProviderId: number | null;
  isExternalProvider: boolean;
  externalProviderName: string;
  externalProviderPhone: string;
  externalProviderEmail: string;
  externalProviderCompany: string;
  requestType: RequestType;
  machineServiceId: number;
  machineServiceName: string;
  quantity: number;
  material: string;
  deadline: string;
  specifications: string;
  budget: number;
  status: RequestStatus;
  attachments: RequestAttachment[];
  responseMessage: string;
  proposedPrice: number;
  estimatedDelivery: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt: Date;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  targetProviderId: number | null;
  isExternalProvider: boolean;
  externalProviderName: string;
  externalProviderPhone: string;
  externalProviderEmail: string;
  externalProviderCompany: string;
  requestType: RequestType;
  machineServiceId: number;
  machineServiceName: string;
  quantity: number;
  material: string;
  deadline: string;
  specifications: string;
  budget: number;
  attachments: RequestAttachment[];
}

export interface Provider {
  id: number;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  location: string;
  rating: number;
  isInApp: boolean;
}