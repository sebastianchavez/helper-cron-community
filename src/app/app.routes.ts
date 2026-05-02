import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'welcome',
        loadComponent: () => import('./pages/welcome/welcome.component').then(m => m.WelcomeComponent)
    },
    {
        path: 'chat',
        redirectTo: '/chatbot',
        pathMatch: 'full'
    },
    {
        path: 'chatbot',
        loadComponent: () => import('./pages/chatbot/chatbot.component').then(m => m.ChatbotComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
    },
    {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
    },
    {
        path: 'terms',
        loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent)
    },
    {
        path: 'ai-models',
        loadComponent: () => import('./pages/ai-models/ai-models-page.component').then(m => m.AiModelsPageComponent)
    },
    {
        path: 'task-builder',
        loadComponent: () => import('./pages/task-builder/task-builder.component').then(m => m.TaskBuilderComponent)
    },
    {
        path: 'flow-library',
        loadComponent: () => import('./pages/flow-library/flow-library.component').then(m => m.FlowLibraryComponent)
    },
    {
        path: '',
        loadComponent: () => import('./components/redirect/redirect.component').then(m => m.RedirectComponent),
        pathMatch: 'full'
    }
];
