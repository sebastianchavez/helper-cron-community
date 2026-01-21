import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>('es');
  public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

  private translations: { [key: string]: { [key: string]: string } } = {
    es: {
      // Aplicación
      'app.name': 'Local Mind',
      
      // Navegación
      'nav.chat': 'Volver al Chat',
      'nav.profile': 'Mi Perfil',
      'nav.settings': 'Configuraciones',
      'nav.about': 'Acerca de',
      'nav.newChat': 'Nuevo Chat',
      
      // Perfil
      'profile.title': 'Mi Perfil',
      'profile.name': 'Nombre',
      'profile.namePlaceholder': 'Introduce tu nombre',
      'profile.nameRequired': 'El nombre es requerido',
      'profile.save': 'Guardar Perfil',
      'profile.saving': 'Guardando...',
      'profile.delete': 'Eliminar',
      'profile.back': 'Volver',
      'profile.saveSuccess': 'Perfil guardado exitosamente',
      'profile.deleteSuccess': 'Perfil eliminado exitosamente',
      'profile.saveError': 'Error al guardar el perfil',
      'profile.deleteError': 'Error al eliminar el perfil',
      'profile.loadError': 'Error al cargar el perfil',
      'profile.deleteConfirm': '¿Estás seguro de que deseas eliminar tu perfil?',
      
      // Configuraciones
      'settings.title': 'Configuraciones',
      'settings.appearance': 'Apariencia',
      'settings.darkMode': 'Modo Oscuro',
      'settings.darkModeDesc': 'Cambia entre modo claro y oscuro',
      'settings.language': 'Idioma',
      'settings.languageDesc': 'Selecciona el idioma de la aplicación',
      'settings.information': 'Información',
      'settings.version': 'Versión',
      'settings.platform': 'Plataforma',
      'settings.aboutApp': 'Acerca de la aplicación',
      
      // Chat
      'chat.thinking': 'Pensando...',
      'chat.analyzing': 'Analizando...',
      'chat.writing': 'Escribiendo...',
      'chat.processing': 'Procesando...',
      'chat.conversation': 'Conversación',
      'newChat': 'Nuevo Chat',
      'conversation': 'Conversación',
      'user': 'Usuario',
      'assistant': 'Asistente',
      'you': 'Tú',
      'currentConversation': 'Conversación Actual',
      'noModelsAvailable': 'No hay modelos disponibles',
      'welcomeMessage': '¿En qué puedo ayudarte hoy?',
      'personalizedWelcome': 'Hola {name}, ¿en qué puedo ayudarte hoy?',
      'sendMessage': 'Envía un mensaje...',
      'aiDisclaimer': 'El asistente puede cometer errores. Considera verificar información importante.',
      'about.title': 'Acerca de',
      
      // Carpetas
      'folders.newFolder': 'Nueva Carpeta',
      'folders.noFolders': 'No hay carpetas. Crea una nueva.',
      'folders.folderName': 'Nombre de la carpeta',
      'folders.create': 'Crear',
      'folders.deleteConfirm': '¿Eliminar esta carpeta y todas sus subcarpetas?',
      
      // Acerca de
      'about.features': 'Características',
      'about.aiChat': 'Chat con IA',
      'about.aiChatDesc': 'Conversaciones inteligentes con modelos de IA avanzados',
      'about.multiLanguage': 'Soporte Multi-idioma',
      'about.multiLanguageDesc': 'Interfaz disponible en 7 idiomas diferentes',
      'about.darkMode': 'Modo Oscuro',
      'about.darkModeDesc': 'Interfaz adaptable con tema claro y oscuro',
      'about.folders': 'Organización con Carpetas',
      'about.foldersDesc': 'Organiza tus conversaciones en carpetas personalizadas',
      'about.madeWith': 'Hecho con',
      'about.withTech': 'usando Angular, Electron y Tailwind CSS',
      'about.allRights': 'Todos los derechos reservados',
      'settings.aboutAppDesc': 'Local Mind - Una aplicación de escritorio para chatear con inteligencia artificial',
      
      // Modelos IA
      'models.title': 'Modelos de IA',
      'models.status': 'Estado de los Modelos',
      'models.installed': 'Instalado',
      'models.notInstalled': 'No instalado',
      'models.loading': 'Cargando modelos...',
      'models.noModels': 'No se encontraron modelos',
      'models.refresh': 'Actualizar Lista',
      'models.ollamaError': 'No se puede conectar con Ollama. Asegúrate de que Ollama esté instalado y ejecutándose.',
      'models.size': 'Tamaño',
      'models.lastUsed': 'Último uso',
      'models.available': 'Disponible',
      'models.downloading': 'Descargando...',
      'models.error': 'Error al cargar',
      'models.noModelsDesc': 'No tienes modelos de IA instalados. Instala Ollama para comenzar.',
      'models.downloadOllama': 'Descargar Ollama',
      'models.ollamaNotInstalled': 'Ollama no está instalado',
      'models.ollamaInstallPrompt': 'Necesitas instalar Ollama para usar modelos de IA locales.',
      'models.ollamaNotRunning': 'Ollama está instalado pero no se está ejecutando',
      'models.ollamaStartPrompt': 'Ollama está instalado en tu sistema pero no se está ejecutando. Puedes iniciarlo desde aquí.',
      'models.startOllama': 'Iniciar Ollama',
      'models.startingOllama': 'Iniciando Ollama...',
      'models.ollamaStarted': 'Ollama se ha iniciado correctamente',
      'models.ollamaStartError': 'Error al iniciar Ollama',
      'models.checkingOllama': 'Verificando estado de Ollama...',
      'models.ollamaNotRunningError': 'Ollama está instalado pero no se está ejecutando',
      'models.ollamaNotInstalledError': 'Ollama no está instalado en tu sistema',
      'models.exploreModels': 'Explorar Modelos',
      'models.recommendedModels': 'Modelos Recomendados',
      'models.downloadModel': 'Descargar',
      'models.downloadingModel': 'Descargando...',
      'models.selectModelToDownload': 'Selecciona un modelo para empezar:',
      'models.modelSize': 'Tamaño:',
      
      // Mensajes generales
      'common.user': 'Usuario',
      'common.cancel': 'Cancelar',
      'common.save': 'Guardar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.close': 'Cerrar'
    },
    en: {
      // Application
      'app.name': 'Local Mind',
      
      // Navigation
      'nav.chat': 'Back to Chat',
      'nav.profile': 'My Profile',
      'nav.settings': 'Settings',
      'nav.about': 'About',
      'nav.newChat': 'New Chat',
      
      // Profile
      'profile.title': 'My Profile',
      'profile.name': 'Name',
      'profile.namePlaceholder': 'Enter your name',
      'profile.nameRequired': 'Name is required',
      'profile.save': 'Save Profile',
      'profile.saving': 'Saving...',
      'profile.delete': 'Delete',
      'profile.back': 'Back',
      'profile.saveSuccess': 'Profile saved successfully',
      'profile.deleteSuccess': 'Profile deleted successfully',
      'profile.saveError': 'Error saving profile',
      'profile.deleteError': 'Error deleting profile',
      'profile.loadError': 'Error loading profile',
      'profile.deleteConfirm': 'Are you sure you want to delete your profile?',
      
      // Settings
      'settings.title': 'Settings',
      'settings.appearance': 'Appearance',
      'settings.darkMode': 'Dark Mode',
      'settings.darkModeDesc': 'Switch between light and dark mode',
      'settings.language': 'Language',
      'settings.languageDesc': 'Select application language',
      'settings.information': 'Information',
      'settings.version': 'Version',
      'settings.platform': 'Platform',
      'settings.aboutApp': 'About the application',
      
      // Chat
      'chat.thinking': 'Thinking...',
      'chat.analyzing': 'Analyzing...',
      'chat.writing': 'Writing...',
      'chat.processing': 'Processing...',
      'chat.conversation': 'Conversation',
      'newChat': 'New Chat',
      'conversation': 'Conversation',
      'user': 'User',
      'assistant': 'Assistant',
      'you': 'You',
      'currentConversation': 'Current Conversation',
      'noModelsAvailable': 'No models available',
      'welcomeMessage': 'How can I help you today?',
      'personalizedWelcome': 'Hello {name}, how can I help you today?',
      'sendMessage': 'Send a message...',
      'aiDisclaimer': 'The assistant may make mistakes. Consider checking important information.',
      'about.title': 'About',
      
      // Folders
      'folders.newFolder': 'New Folder',
      'folders.noFolders': 'No folders. Create a new one.',
      'folders.folderName': 'Folder name',
      'folders.create': 'Create',
      'folders.deleteConfirm': 'Delete this folder and all its subfolders?',
      
      // About
      'about.features': 'Features',
      'about.aiChat': 'AI Chat',
      'about.aiChatDesc': 'Intelligent conversations with advanced AI models',
      'about.multiLanguage': 'Multi-language Support',
      'about.multiLanguageDesc': 'Interface available in 7 different languages',
      'about.darkMode': 'Dark Mode',
      'about.darkModeDesc': 'Adaptive interface with light and dark themes',
      'about.folders': 'Folder Organization',
      'about.foldersDesc': 'Organize your conversations in custom folders',
      'about.madeWith': 'Made with',
      'about.withTech': 'using Angular, Electron and Tailwind CSS',
      'about.allRights': 'All rights reserved',
      'settings.aboutAppDesc': 'Local Mind - A desktop application for chatting with artificial intelligence',
      
      // AI Models
      'models.title': 'AI Models',
      'models.status': 'Models Status',
      'models.installed': 'Installed',
      'models.notInstalled': 'Not installed',
      'models.loading': 'Loading models...',
      'models.noModels': 'No models found',
      'models.refresh': 'Refresh List',
      'models.ollamaError': 'Unable to connect to Ollama. Please make sure Ollama is installed and running.',
      'models.size': 'Size',
      'models.lastUsed': 'Last used',
      'models.available': 'Available',
      'models.downloading': 'Downloading...',
      'models.error': 'Loading error',
      'models.noModelsDesc': 'You have no AI models installed. Install Ollama to get started.',
      'models.downloadOllama': 'Download Ollama',
      'models.ollamaNotInstalled': 'Ollama is not installed',
      'models.ollamaInstallPrompt': 'You need to install Ollama to use local AI models.',
      'models.ollamaNotRunning': 'Ollama is installed but not running',
      'models.ollamaStartPrompt': 'Ollama is installed on your system but is not running. You can start it from here.',
      'models.startOllama': 'Start Ollama',
      'models.startingOllama': 'Starting Ollama...',
      'models.ollamaStarted': 'Ollama started successfully',
      'models.ollamaStartError': 'Error starting Ollama',
      'models.checkingOllama': 'Checking Ollama status...',
      'models.ollamaNotRunningError': 'Ollama is installed but not running',
      'models.ollamaNotInstalledError': 'Ollama is not installed on your system',
      'models.exploreModels': 'Explore Models',
      'models.recommendedModels': 'Recommended Models',
      'models.downloadModel': 'Download',
      'models.downloadingModel': 'Downloading...',
      'models.selectModelToDownload': 'Select a model to get started:',
      'models.modelSize': 'Size:',
      
      // Common
      'common.user': 'User',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close'
    },
    pt: {
      // Aplicação
      'app.name': 'Local Mind',
      
      // Navegação
      'nav.chat': 'Voltar ao Chat',
      'nav.profile': 'Meu Perfil',
      'nav.settings': 'Configurações',
      'nav.about': 'Sobre',
      'nav.newChat': 'Novo Chat',
      
      // Perfil
      'profile.title': 'Meu Perfil',
      'profile.name': 'Nome',
      'profile.namePlaceholder': 'Digite seu nome',
      'profile.nameRequired': 'Nome é obrigatório',
      'profile.save': 'Salvar Perfil',
      'profile.saving': 'Salvando...',
      'profile.delete': 'Excluir',
      'profile.back': 'Voltar',
      'profile.saveSuccess': 'Perfil salvo com sucesso',
      'profile.deleteSuccess': 'Perfil excluído com sucesso',
      'profile.saveError': 'Erro ao salvar perfil',
      'profile.deleteError': 'Erro ao excluir perfil',
      'profile.loadError': 'Erro ao carregar perfil',
      'profile.deleteConfirm': 'Tem certeza de que deseja excluir seu perfil?',
      
      // Configurações
      'settings.title': 'Configurações',
      'settings.appearance': 'Aparência',
      'settings.darkMode': 'Modo Escuro',
      'settings.darkModeDesc': 'Alternar entre modo claro e escuro',
      'settings.language': 'Idioma',
      'settings.languageDesc': 'Selecionar idioma da aplicação',
      'settings.information': 'Informações',
      'settings.version': 'Versão',
      'settings.platform': 'Plataforma',
      'settings.aboutApp': 'Sobre a aplicação',
      
      // Chat
      'chat.thinking': 'Pensando...',
      'chat.analyzing': 'Analisando...',
      'chat.writing': 'Escrevendo...',
      'chat.processing': 'Processando...',
      'chat.conversation': 'Conversa',
      'newChat': 'Novo Chat',
      'conversation': 'Conversa',
      'user': 'Usuário',
      'assistant': 'Assistente',
      'you': 'Você',
      'currentConversation': 'Conversa Atual',
      'noModelsAvailable': 'Nenhum modelo disponível',
      'welcomeMessage': 'Como posso ajudá-lo hoje?',
      'personalizedWelcome': 'Olá {name}, como posso ajudá-lo hoje?',
      'sendMessage': 'Envie uma mensagem...',
      'aiDisclaimer': 'O assistente pode cometer erros. Considere verificar informações importantes.',
      'about.title': 'Sobre',
      
      // Pastas
      'folders.newFolder': 'Nova Pasta',
      'folders.noFolders': 'Nenhuma pasta. Crie uma nova.',
      'folders.folderName': 'Nome da pasta',
      'folders.create': 'Criar',
      'folders.deleteConfirm': 'Excluir esta pasta e todas as suas subpastas?',
      
      // Sobre
      'about.features': 'Recursos',
      'about.aiChat': 'Chat com IA',
      'about.aiChatDesc': 'Conversas inteligentes com modelos avançados de IA',
      'about.multiLanguage': 'Suporte Multi-idioma',
      'about.multiLanguageDesc': 'Interface disponível em 7 idiomas diferentes',
      'about.darkMode': 'Modo Escuro',
      'about.darkModeDesc': 'Interface adaptável com temas claro e escuro',
      'about.folders': 'Organização com Pastas',
      'about.foldersDesc': 'Organize suas conversas em pastas personalizadas',
      'about.madeWith': 'Feito com',
      'about.withTech': 'usando Angular, Electron e Tailwind CSS',
      'about.allRights': 'Todos os direitos reservados',
      'settings.aboutAppDesc': 'Local Mind - Uma aplicação desktop para conversar com inteligência artificial',
      
      // Modelos de IA
      'models.title': 'Modelos de IA',
      'models.status': 'Estado dos Modelos',
      'models.installed': 'Instalado',
      'models.notInstalled': 'Não instalado',
      'models.loading': 'Carregando modelos...',
      'models.noModels': 'Nenhum modelo encontrado',
      'models.refresh': 'Atualizar Lista',
      'models.ollamaError': 'Não é possível conectar ao Ollama. Certifique-se de que o Ollama esteja instalado e executando.',
      'models.size': 'Tamanho',
      'models.lastUsed': 'Último uso',
      'models.available': 'Disponível',
      'models.downloading': 'Baixando...',
      'models.error': 'Erro ao carregar',
      'models.noModelsDesc': 'Você não tem modelos de IA instalados. Instale o Ollama para começar.',
      'models.downloadOllama': 'Baixar Ollama',
      'models.recommendedModels': 'Modelos Recomendados',
      'models.downloadModel': 'Baixar',
      'models.downloadingModel': 'Baixando...',
      'models.selectModelToDownload': 'Selecione um modelo para começar:',
      'models.modelSize': 'Tamanho:',
      
      // Comum
      'common.user': 'Usuário',
      'common.cancel': 'Cancelar',
      'common.save': 'Salvar',
      'common.delete': 'Excluir',
      'common.edit': 'Editar',
      'common.close': 'Fechar'
    },
    fr: {
      // Application
      'app.name': 'Local Mind',
      
      // Navigation
      'nav.chat': 'Retour au Chat',
      'nav.profile': 'Mon Profil',
      'nav.settings': 'Paramètres',
      'nav.about': 'À propos',
      'nav.newChat': 'Nouveau Chat',
      
      // Profil
      'profile.title': 'Mon Profil',
      'profile.name': 'Nom',
      'profile.namePlaceholder': 'Entrez votre nom',
      'profile.nameRequired': 'Le nom est requis',
      'profile.save': 'Sauvegarder le Profil',
      'profile.saving': 'Sauvegarde...',
      'profile.delete': 'Supprimer',
      'profile.back': 'Retour',
      'profile.saveSuccess': 'Profil sauvegardé avec succès',
      'profile.deleteSuccess': 'Profil supprimé avec succès',
      'profile.saveError': 'Erreur lors de la sauvegarde du profil',
      'profile.deleteError': 'Erreur lors de la suppression du profil',
      'profile.loadError': 'Erreur lors du chargement du profil',
      'profile.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer votre profil?',
      
      // Paramètres
      'settings.title': 'Paramètres',
      'settings.appearance': 'Apparence',
      'settings.darkMode': 'Mode Sombre',
      'settings.darkModeDesc': 'Basculer entre mode clair et sombre',
      'settings.language': 'Langue',
      'settings.languageDesc': 'Sélectionner la langue de l\'application',
      'settings.information': 'Information',
      'settings.version': 'Version',
      'settings.platform': 'Plateforme',
      'settings.aboutApp': 'À propos de l\'application',
      
      // Chat
      'chat.thinking': 'Réflexion...',
      'chat.analyzing': 'Analyse...',
      'chat.writing': 'Écriture...',
      'chat.processing': 'Traitement...',
      'chat.conversation': 'Conversation',
      'newChat': 'Nouveau Chat',
      'conversation': 'Conversation',
      'user': 'Utilisateur',
      'assistant': 'Assistant',
      'you': 'Vous',
      'currentConversation': 'Conversation Actuelle',
      'noModelsAvailable': 'Aucun modèle disponible',
      'welcomeMessage': 'Comment puis-je vous aider aujourd\'hui?',
      'personalizedWelcome': 'Bonjour {name}, comment puis-je vous aider aujourd\'hui?',
      'sendMessage': 'Envoyer un message...',
      'aiDisclaimer': 'L\'assistant peut faire des erreurs. Pensez à vérifier les informations importantes.',
      'about.title': 'À propos',
      
      // Dossiers
      'folders.newFolder': 'Nouveau Dossier',
      'folders.noFolders': 'Aucun dossier. Créez-en un nouveau.',
      'folders.folderName': 'Nom du dossier',
      'folders.create': 'Créer',
      'folders.deleteConfirm': 'Supprimer ce dossier et tous ses sous-dossiers?',
      
      // À propos
      'about.features': 'Fonctionnalités',
      'about.aiChat': 'Chat avec IA',
      'about.aiChatDesc': 'Conversations intelligentes avec des modèles d\'IA avancés',
      'about.multiLanguage': 'Support Multi-langue',
      'about.multiLanguageDesc': 'Interface disponible en 7 langues différentes',
      'about.darkMode': 'Mode Sombre',
      'about.darkModeDesc': 'Interface adaptable avec thèmes clair et sombre',
      'about.folders': 'Organisation par Dossiers',
      'about.foldersDesc': 'Organisez vos conversations dans des dossiers personnalisés',
      'about.madeWith': 'Fait avec',
      'about.withTech': 'en utilisant Angular, Electron et Tailwind CSS',
      'about.allRights': 'Tous droits réservés',
      'settings.aboutAppDesc': 'Local Mind - Une application desktop pour discuter avec l\'intelligence artificielle',
      
      // Modèles IA
      'models.title': 'Modèles d\'IA',
      'models.status': 'État des Modèles',
      'models.statusDesc': 'Surveillez l\'état des modèles d\'IA installés localement',
      'models.installed': 'Modèles Installés',
      'models.loading': 'Chargement des modèles...',
      'models.noModels': 'Aucun modèle installé',
      'models.noModelsDesc': 'Pour utiliser Local Mind, vous avez besoin de modèles d\'IA installés',
      'models.downloadOllama': 'Télécharger Ollama',
      'models.recommendedModels': 'Modèles Recommandés',
      'models.downloadModel': 'Télécharger',
      'models.downloadingModel': 'Téléchargement...',
      'models.selectModelToDownload': 'Sélectionnez un modèle pour commencer:',
      'models.modelSize': 'Taille:',
      'models.size': 'Taille',
      'models.lastUsed': 'Dernière utilisation',
      'models.available': 'Disponible',
      'models.downloading': 'Téléchargement en cours...',
      'models.error': 'Erreur lors du chargement',
      'models.connectionError': 'Impossible de se connecter à Ollama',
      'models.connectionErrorDesc': 'Assurez-vous qu\'Ollama soit installé et en cours d\'exécution',
      'models.refresh': 'Actualiser',
      'models.ollamaError': 'Impossible de se connecter à Ollama. Assurez-vous qu\'Ollama soit installé et en cours d\'exécution.',
      
      // Commun
      'common.user': 'Utilisateur',
      'common.cancel': 'Annuler',
      'common.save': 'Sauvegarder',
      'common.delete': 'Supprimer',
      'common.edit': 'Éditer',
      'common.close': 'Fermer'
    },
    de: {
      // Anwendung
      'app.name': 'Local Mind',
      
      // Navigation
      'nav.chat': 'Zurück zum Chat',
      'nav.profile': 'Mein Profil',
      'nav.settings': 'Einstellungen',
      'nav.about': 'Über',
      'nav.newChat': 'Neuer Chat',
      
      // Profil
      'profile.title': 'Mein Profil',
      'profile.name': 'Name',
      'profile.namePlaceholder': 'Geben Sie Ihren Namen ein',
      'profile.nameRequired': 'Name ist erforderlich',
      'profile.save': 'Profil Speichern',
      'profile.saving': 'Speichern...',
      'profile.delete': 'Löschen',
      'profile.back': 'Zurück',
      'profile.saveSuccess': 'Profil erfolgreich gespeichert',
      'profile.deleteSuccess': 'Profil erfolgreich gelöscht',
      'profile.saveError': 'Fehler beim Speichern des Profils',
      'profile.deleteError': 'Fehler beim Löschen des Profils',
      'profile.loadError': 'Fehler beim Laden des Profils',
      'profile.deleteConfirm': 'Sind Sie sicher, dass Sie Ihr Profil löschen möchten?',
      
      // Einstellungen
      'settings.title': 'Einstellungen',
      'settings.appearance': 'Erscheinungsbild',
      'settings.darkMode': 'Dunkler Modus',
      'settings.darkModeDesc': 'Zwischen hellem und dunklem Modus wechseln',
      'settings.language': 'Sprache',
      'settings.languageDesc': 'Anwendungssprache auswählen',
      'settings.information': 'Information',
      'settings.version': 'Version',
      'settings.platform': 'Plattform',
      'settings.aboutApp': 'Über die Anwendung',
      
      // Chat
      'chat.thinking': 'Denken...',
      'chat.analyzing': 'Analysieren...',
      'chat.writing': 'Schreiben...',
      'chat.processing': 'Verarbeiten...',
      'chat.conversation': 'Gespräch',
      'newChat': 'Neuer Chat',
      'conversation': 'Gespräch',
      'user': 'Benutzer',
      'assistant': 'Assistent',
      'you': 'Sie',
      'currentConversation': 'Aktuelles Gespräch',
      'noModelsAvailable': 'Keine Modelle verfügbar',
      'welcomeMessage': 'Wie kann ich Ihnen heute helfen?',
      'personalizedWelcome': 'Hallo {name}, wie kann ich Ihnen heute helfen?',
      'sendMessage': 'Eine Nachricht senden...',
      'aiDisclaimer': 'Der Assistent kann Fehler machen. Überprüfen Sie wichtige Informationen.',
      'about.title': 'Über',
      
      // Ordner
      'folders.newFolder': 'Neuer Ordner',
      'folders.noFolders': 'Keine Ordner. Erstellen Sie einen neuen.',
      'folders.folderName': 'Ordnername',
      'folders.create': 'Erstellen',
      'folders.deleteConfirm': 'Diesen Ordner und alle Unterordner löschen?',
      
      // Über
      'about.features': 'Funktionen',
      'about.aiChat': 'KI-Chat',
      'about.aiChatDesc': 'Intelligente Gespräche mit fortschrittlichen KI-Modellen',
      'about.multiLanguage': 'Mehrsprachige Unterstützung',
      'about.multiLanguageDesc': 'Oberfläche in 7 verschiedenen Sprachen verfügbar',
      'about.darkMode': 'Dunkler Modus',
      'about.darkModeDesc': 'Anpassbare Oberfläche mit hellen und dunklen Themen',
      'about.folders': 'Ordner-Organisation',
      'about.foldersDesc': 'Organisieren Sie Ihre Gespräche in benutzerdefinierten Ordnern',
      'about.madeWith': 'Erstellt mit',
      'about.withTech': 'mit Angular, Electron und Tailwind CSS',
      'about.allRights': 'Alle Rechte vorbehalten',
      'settings.aboutAppDesc': 'Local Mind - Eine Desktop-Anwendung zum Chatten mit künstlicher Intelligenz',
      
      // KI-Modelle
      'models.title': 'KI-Modelle',
      'models.status': 'Modell-Status',
      'models.statusDesc': 'Überwachen Sie den Status lokal installierter KI-Modelle',
      'models.installed': 'Installierte Modelle',
      'models.loading': 'Modelle werden geladen...',
      'models.noModels': 'Keine Modelle installiert',
      'models.noModelsDesc': 'Um Local Mind zu verwenden, benötigen Sie installierte KI-Modelle',
      'models.downloadOllama': 'Ollama herunterladen',
      'models.recommendedModels': 'Empfohlene Modelle',
      'models.downloadModel': 'Herunterladen',
      'models.downloadingModel': 'Wird heruntergeladen...',
      'models.selectModelToDownload': 'Wählen Sie ein Modell zum Starten:',
      'models.modelSize': 'Größe:',
      'models.size': 'Größe',
      'models.lastUsed': 'Zuletzt verwendet',
      'models.available': 'Verfügbar',
      'models.downloading': 'Wird heruntergeladen...',
      'models.error': 'Fehler beim Laden',
      'models.connectionError': 'Verbindung zu Ollama nicht möglich',
      'models.connectionErrorDesc': 'Stellen Sie sicher, dass Ollama installiert ist und läuft',
      'models.refresh': 'Aktualisieren',
      'models.ollamaError': 'Verbindung zu Ollama nicht möglich. Stellen Sie sicher, dass Ollama installiert ist und läuft.',
      
      // Allgemein
      'common.user': 'Benutzer',
      'common.cancel': 'Abbrechen',
      'common.save': 'Speichern',
      'common.delete': 'Löschen',
      'common.edit': 'Bearbeiten',
      'common.close': 'Schließen'
    },
    zh: {
      // 应用程序
      'app.name': 'Local Mind',
      
      // 导航
      'nav.chat': '返回聊天',
      'nav.profile': '我的资料',
      'nav.settings': '设置',
      'nav.about': '关于',
      'nav.newChat': '新聊天',
      
      // 资料
      'profile.title': '我的资料',
      'profile.name': '姓名',
      'profile.namePlaceholder': '输入您的姓名',
      'profile.nameRequired': '姓名是必需的',
      'profile.save': '保存资料',
      'profile.saving': '保存中...',
      'profile.delete': '删除',
      'profile.back': '返回',
      'profile.saveSuccess': '资料保存成功',
      'profile.deleteSuccess': '资料删除成功',
      'profile.saveError': '保存资料时出错',
      'profile.deleteError': '删除资料时出错',
      'profile.loadError': '加载资料时出错',
      'profile.deleteConfirm': '您确定要删除您的资料吗？',
      
      // 设置
      'settings.title': '设置',
      'settings.appearance': '外观',
      'settings.darkMode': '深色模式',
      'settings.darkModeDesc': '在浅色和深色模式之间切换',
      'settings.language': '语言',
      'settings.languageDesc': '选择应用程序语言',
      'settings.information': '信息',
      'settings.version': '版本',
      'settings.platform': '平台',
      'settings.aboutApp': '关于应用程序',
      
      // 聊天
      'chat.thinking': '思考中...',
      'chat.analyzing': '分析中...',
      'chat.writing': '写作中...',
      'chat.processing': '处理中...',
      'chat.conversation': '对话',
      'newChat': '新聊天',
      'conversation': '对话',
      'user': '用户',
      'assistant': '助手',
      'you': '您',
      'currentConversation': '当前对话',
      'noModelsAvailable': '没有可用的模型',
      'welcomeMessage': '今天我能为您做些什么？',
      'sendMessage': '发送消息...',
      'aiDisclaimer': '助手可能会出错。请考虑验证重要信息。',
      'about.title': '关于',
      
      // 文件夹
      'folders.newFolder': '新建文件夹',
      'folders.noFolders': '没有文件夹。创建一个新的。',
      'folders.folderName': '文件夹名称',
      'folders.create': '创建',
      'folders.deleteConfirm': '删除这个文件夹和所有子文件夹？',
      
      // 关于
      'about.features': '功能特性',
      'about.aiChat': 'AI 聊天',
      'about.aiChatDesc': '与先进 AI 模型的智能对话',
      'about.multiLanguage': '多语言支持',
      'about.multiLanguageDesc': '界面支持 7 种不同语言',
      'about.darkMode': '深色模式',
      'about.darkModeDesc': '适应性界面，支持浅色和深色主题',
      'about.folders': '文件夹组织',
      'about.foldersDesc': '在自定义文件夹中组织您的对话',
      'about.madeWith': '使用技术',
      'about.withTech': '使用 Angular、Electron 和 Tailwind CSS 构建',
      'about.allRights': '保留所有权利',
      'settings.aboutAppDesc': 'Local Mind - 一个用于与人工智能聊天的桌面应用程序',
      
      // AI 模型
      'models.title': 'AI 模型',
      'models.status': '模型状态',
      'models.statusDesc': '监控本地安装的 AI 模型状态',
      'models.installed': '已安装模型',
      'models.loading': '正在加载模型...',
      'models.noModels': '未安装模型',
      'models.noModelsDesc': '要使用 Local Mind，您需要安装 AI 模型',
      'models.downloadOllama': '下载 Ollama',
      'models.recommendedModels': '推荐模型',
      'models.downloadModel': '下载',
      'models.downloadingModel': '下载中...',
      'models.selectModelToDownload': '选择一个模型开始:',
      'models.modelSize': '大小:',
      'models.size': '大小',
      'models.lastUsed': '最后使用',
      'models.available': '可用',
      'models.downloading': '正在下载...',
      'models.error': '加载错误',
      'models.connectionError': '无法连接到 Ollama',
      'models.connectionErrorDesc': '请确保 Ollama 已安装并正在运行',
      'models.refresh': '刷新',
      'models.ollamaError': '无法连接到 Ollama。请确保 Ollama 已安装并正在运行。',
      
      // 通用
      'common.user': '用户',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.close': '关闭'
    },
    ja: {
      // アプリケーション
      'app.name': 'Local Mind',
      
      // ナビゲーション
      'nav.chat': 'チャットに戻る',
      'nav.profile': 'マイプロフィール',
      'nav.settings': '設定',
      'nav.about': 'について',
      'nav.newChat': '新しいチャット',
      
      // プロフィール
      'profile.title': 'マイプロフィール',
      'profile.name': '名前',
      'profile.namePlaceholder': '名前を入力してください',
      'profile.nameRequired': '名前は必須です',
      'profile.save': 'プロフィールを保存',
      'profile.saving': '保存中...',
      'profile.delete': '削除',
      'profile.back': '戻る',
      'profile.saveSuccess': 'プロフィールが正常に保存されました',
      'profile.deleteSuccess': 'プロフィールが正常に削除されました',
      'profile.saveError': 'プロフィールの保存エラー',
      'profile.deleteError': 'プロフィールの削除エラー',
      'profile.loadError': 'プロフィールの読み込みエラー',
      'profile.deleteConfirm': 'プロフィールを削除してもよろしいですか？',
      
      // 設定
      'settings.title': '設定',
      'settings.appearance': '外観',
      'settings.darkMode': 'ダークモード',
      'settings.darkModeDesc': 'ライトモードとダークモードを切り替え',
      'settings.language': '言語',
      'settings.languageDesc': 'アプリケーションの言語を選択',
      'settings.information': '情報',
      'settings.version': 'バージョン',
      'settings.platform': 'プラットフォーム',
      'settings.aboutApp': 'アプリケーションについて',
      
      // チャット
      'chat.thinking': '考え中...',
      'chat.analyzing': '分析中...',
      'chat.writing': '書き中...',
      'chat.processing': '処理中...',
      'chat.conversation': '会話',
      'newChat': '新しいチャット',
      'conversation': '会話',
      'user': 'ユーザー',
      'assistant': 'アシスタント',
      'you': 'あなた',
      'currentConversation': '現在の会話',
      'noModelsAvailable': '利用可能なモデルがありません',
      'welcomeMessage': '今日はどのようなお手伝いができますか？',
      'sendMessage': 'メッセージを送信...',
      'aiDisclaimer': 'アシスタントは間違いを犯す可能性があります。重要な情報は確認することを検討してください。',
      'about.title': 'について',
      
      // フォルダ
      'folders.newFolder': '新しいフォルダ',
      'folders.noFolders': 'フォルダがありません。新しいフォルダを作成してください。',
      'folders.folderName': 'フォルダ名',
      'folders.create': '作成',
      'folders.deleteConfirm': 'このフォルダとすべてのサブフォルダを削除しますか？',
      
      // について
      'about.features': '機能',
      'about.aiChat': 'AI チャット',
      'about.aiChatDesc': '高度なAIモデルとのインテリジェントな会話',
      'about.multiLanguage': '多言語サポート',
      'about.multiLanguageDesc': '7つの異なる言語で利用可能なインターフェース',
      'about.darkMode': 'ダークモード',
      'about.darkModeDesc': 'ライトとダークテーマで適応するインターフェース',
      'about.folders': 'フォルダ整理',
      'about.foldersDesc': 'カスタムフォルダで会話を整理',
      'about.madeWith': '使用技術',
      'about.withTech': 'Angular、Electron、Tailwind CSSで構築',
      'about.allRights': 'すべての権利を保有',
      'settings.aboutAppDesc': 'Local Mind - 人工知能とチャットするためのデスクトップアプリケーション',
      
      // AIモデル
      'models.title': 'AIモデル',
      'models.status': 'モデル状態',
      'models.statusDesc': 'ローカルにインストールされたAIモデルの状態を監視',
      'models.installed': 'インストール済みモデル',
      'models.loading': 'モデルを読み込み中...',
      'models.noModels': 'モデルがインストールされていません',
      'models.noModelsDesc': 'Local Mind を使用するには、AIモデルがインストールされている必要があります',
      'models.downloadOllama': 'Ollama をダウンロード',
      'models.recommendedModels': '推奨モデル',
      'models.downloadModel': 'ダウンロード',
      'models.downloadingModel': 'ダウンロード中...',
      'models.selectModelToDownload': '始めるためのモデルを選択:',
      'models.modelSize': 'サイズ:',
      'models.size': 'サイズ',
      'models.lastUsed': '最後に使用',
      'models.available': '利用可能',
      'models.downloading': 'ダウンロード中...',
      'models.error': '読み込みエラー',
      'models.connectionError': 'Ollama に接続できません',
      'models.connectionErrorDesc': 'Ollama がインストールされ実行されていることを確認してください',
      'models.refresh': '更新',
      'models.ollamaError': 'Ollama に接続できません。Ollama がインストールされ実行されていることを確認してください。',
      
      // 共通
      'common.user': 'ユーザー',
      'common.cancel': 'キャンセル',
      'common.save': '保存',
      'common.delete': '削除',
      'common.edit': '編集',
      'common.close': '閉じる'
    }
  };

  public availableLanguages: Language[] = [
    { code: 'es', name: 'Español', nativeName: 'Español' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'pt', name: 'Português', nativeName: 'Português' },
    { code: 'fr', name: 'Français', nativeName: 'Français' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
  ];

  constructor() {
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  setLanguage(languageCode: string): void {
    if (this.translations[languageCode]) {
      this.currentLanguageSubject.next(languageCode);
      localStorage.setItem('app-language', languageCode);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    const translation = this.translations[currentLang]?.[key];
    return translation || key;
  }

  getLanguageName(code: string): string {
    const language = this.availableLanguages.find(lang => lang.code === code);
    return language ? language.nativeName : code;
  }
}