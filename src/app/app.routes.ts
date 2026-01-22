import { Routes } from '@angular/router';

export const routes: Routes = [
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
        path: '',
        loadComponent: () => import('./components/redirect/redirect.component').then(m => m.RedirectComponent),
        pathMatch: 'full'
    }
];
