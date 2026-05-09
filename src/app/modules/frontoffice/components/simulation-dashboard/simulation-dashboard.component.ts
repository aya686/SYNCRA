// src/app/modules/frontoffice/components/simulation-dashboard/simulation-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { MultiAgentSimulatorService, SimulationResult } from '../../../shared/services/multi-agent-simulator.service';
import { NeuralNetworkService } from '../../../shared/services/neural-network.service';
import { DataCollectorService } from '../../../shared/services/data-collector.service';

@Component({
    selector: 'app-simulation-dashboard',
    templateUrl: './simulation-dashboard.component.html',
    styleUrls: ['./simulation-dashboard.component.scss'],
    standalone: false
})
export class SimulationDashboardComponent implements OnInit {
  simulationResult: SimulationResult | null = null;
  isLoading = false;
  agentStats: { total: number; distribution: Record<string, number> } = { total: 0, distribution: {} };
  iterations = 10;
  useAI = true;
  isTraining = false;
  trainingProgress = 0;
  
  trainingDataSize = 0;
  modelAccuracy = 0;
  showExplanation = false;
  collectedDataStats: any = null;  // ✅ AJOUTER
  
  constructor(
    private simulator: MultiAgentSimulatorService,
    private neuralNetwork: NeuralNetworkService,
    private dataCollector: DataCollectorService,
    private http: HttpClient  // ✅ AJOUTER
  ) {}

  ngOnInit() {
    this.agentStats = this.simulator.getAgentStats();
    this.simulator.setUseAI(this.useAI);
    this.updateTrainingStatus();
    this.updateTrainingStats();
  }
  
  async updateTrainingStatus() {
    const status = this.neuralNetwork.getTrainingStatus();
    this.trainingProgress = status.progress;
  }
  
  toggleExplanation(): void {
    this.showExplanation = !this.showExplanation;
  }
  
  async updateTrainingStats() {
    const stats = await this.dataCollector.getStats();
    this.trainingDataSize = stats.total;
    
    if (this.simulationResult) {
      this.modelAccuracy = this.simulationResult.aiMetrics.modelAccuracy * 100;
    } else {
      const status = this.neuralNetwork.getTrainingStatus();
      this.modelAccuracy = status.isTrained ? 75 : 0;
    }
  }
  
  toggleAI() {
    this.useAI = !this.useAI;
    this.simulator.setUseAI(this.useAI);
  }
  
  // ✅ CORRIGER cette méthode
  async getCollectedStats() {
    try {
      const stats = await lastValueFrom(
        this.http.get('http://localhost:8089/event_db/api/training-data/stats/realtime')
      );
      console.log('📊 Données collectées:', stats);
      this.collectedDataStats = stats;
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
  
  async retrainModel() {
    this.isTraining = true;
    await this.simulator.retrainModel();
    this.isTraining = false;
    await this.updateTrainingStatus();
    await this.updateTrainingStats();
  }
  
  async getTrainingDataStats() {
    return await this.dataCollector.getStats();
  }
  
  getEtudiantCount(): number {
    return this.agentStats.distribution['etudiant'] || 0;
  }
  
  getProfessionnelCount(): number {
    return this.agentStats.distribution['professionnel'] || 0;
  }
  
  getCurieuxCount(): number {
    return this.agentStats.distribution['curieux'] || 0;
  }
  
  getExpertCount(): number {
    return this.agentStats.distribution['expert'] || 0;
  }
  
  getAgentDistribution(event: any): { etudiant: number; professionnel: number; curieux: number; expert: number } {
    return {
      etudiant: event.agentDistribution?.['etudiant'] || 0,
      professionnel: event.agentDistribution?.['professionnel'] || 0,
      curieux: event.agentDistribution?.['curieux'] || 0,
      expert: event.agentDistribution?.['expert'] || 0
    };
  }
  
  async runSimulation() {
    this.isLoading = true;
    this.simulationResult = await this.simulator.runSimulation(this.iterations);
    this.isLoading = false;
    
    await this.updateTrainingStats();
  }
}