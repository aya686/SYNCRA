import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotComponent } from './chatbot.component';

const routes: Routes = [
  {
    path: '',
    component: ChatbotComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ChatbotComponent // Standalone component
  ]
})
export class ChatbotModule { }
