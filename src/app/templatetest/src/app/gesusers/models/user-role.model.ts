export interface UserRole {
  id?: number;
  userId: number;
  roleId: number;
  roleLibelle?: string;
  roleDescription?: string;
  dateAttribution: string;
  dateExpiration?: string;
  statut: 'ACTIF' | 'EXPIRE' | 'REVOQUE';
  motifChangement?: string;
}