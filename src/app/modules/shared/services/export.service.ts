import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  // Export vers Excel
  exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  }

  // Export vers CSV
  exportToCSV(data: any[], fileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  // Export vers JSON
  exportToJSON(data: any[], fileName: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
  }

  // Export vers PDF (texte simple)
  exportToPDF(data: any[], fileName: string, title: string): void {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #5E35B1; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #5E35B1; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Date d'export : ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
    `;

    // Ajouter les en-têtes
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      htmlContent += '<tr>';
      headers.forEach(header => {
        htmlContent += `<th>${this.formatHeader(header)}</th>`;
      });
      htmlContent += '</tr>';
    }
    htmlContent += '</thead><tbody>';

    // Ajouter les données
    data.forEach(row => {
      htmlContent += '<tr>';
      Object.values(row).forEach((value: any) => {
        htmlContent += `<td>${value || ''}</td>`;
      });
      htmlContent += '</tr>';
    });

    htmlContent += `
          </tbody>
        </table>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Event&Formation Platform - Tous droits réservés</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    saveAs(blob, `${fileName}.html`);
  }

  private formatHeader(header: string): string {
    const headers: { [key: string]: string } = {
      'id': 'ID',
      'titre': 'Titre',
      'description': 'Description',
      'type': 'Type',
      'lieu': 'Lieu',
      'dateDebut': 'Date de début',
      'dateFin': 'Date de fin',
      'capaciteMax': 'Capacité max',
      'prix': 'Prix',
      'statut': 'Statut',
      'nom': 'Nom',
      'email': 'Email',
      'role': 'Rôle',
      'participantId': 'ID Participant',
      'evenementId': 'ID Événement',
      'dateInscription': "Date d'inscription",
      'present': 'Présent'
    };
    return headers[header] || header;
  }
}