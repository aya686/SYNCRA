import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../ms6/environments/environment';

export interface WeatherData {
  city: string;
  temperature: string;
  condition: string;
  description: string;
  humidity: string;
  windSpeed: string;
  icon: string;
  deliveryGood: boolean;
  advice: string;
}

export interface WeatherCheck {
  city: string;
  deliveryPossible: boolean;
  message: string;
  warning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la météo pour une ville
   */
  getWeather(city: string): Observable<WeatherData> {
    let params = new HttpParams().set('city', city);
    return this.http.get<WeatherData>(`${this.apiUrl}/weather/test`, { params });
  }

  /**
   * Vérifie si les conditions sont favorables pour la livraison
   */
  checkDeliveryConditions(city: string): Observable<WeatherCheck> {
    let params = new HttpParams().set('city', city);
    return this.http.get<WeatherCheck>(`${this.apiUrl}/weather/delivery-check`, { params });
  }
}
