import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: false
})
export class StatusColorPipe implements PipeTransform {
  private statusColors: { [key: string]: string } = {
    'ACTIF': 'primary',
    'ACTIVE': 'primary',
    'INACTIF': 'warn',
    'SUSPENDU': 'warn',
    'EN_ATTENTE': 'accent',
    'PENDING': 'accent',
    'CONFIRMEE': 'primary',
    'EN_COURS': 'primary',
    'LIVREE': 'primary',
    'ANNULEE': 'warn',
    'REFUSEE': 'warn',
    'REMBOURSEE': 'primary'
  };

  transform(status: string): string {
    return this.statusColors[status?.toUpperCase()] || 'default';
  }
}
