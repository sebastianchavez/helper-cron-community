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
      'settings.viewTerms': 'Ver términos y condiciones',
      
      // Terminal
      'settings.terminal': 'Terminal',
      'settings.terminalDesc': 'Terminal integrada para comandos de sistema',
      'settings.showTerminal': 'Mostrar Terminal',
      'settings.hideTerminal': 'Ocultar Terminal',
      
      // Ollama
      'settings.stopOllama': 'Detener Ollama',
      'settings.stopOllamaDesc': 'Detiene el servicio de Ollama si está ejecutándose',
      'settings.stopOllamaBtn': 'Detener Ollama',
      
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
      'models.ollamaInstallRequired': 'Para usar modelos de IA locales, primero debes instalar Ollama.',
      'models.refreshAfterInstall': 'Después de instalar, haz clic en "Actualizar" para ver los modelos disponibles.',
      'models.ollamaNotRunning': 'Ollama está instalado pero no se está ejecutando',
      'models.ollamaStartPrompt': 'Ollama está instalado en tu sistema pero no se está ejecutando. Puedes iniciarlo desde aquí.',
      'models.startOllama': 'Iniciar Ollama',
      'models.startingOllama': 'Iniciando Ollama...',
      'models.ollamaStarted': 'Ollama se ha iniciado correctamente',
      'models.ollamaStartError': 'Error al iniciar Ollama',
      'models.checkingOllama': 'Verificando estado de Ollama...',
      'models.ollamaNotRunningError': 'Ollama está instalado pero no se está ejecutando',
      'models.ollamaNotInstalledError': 'Ollama no está instalado en tu sistema',
      'models.exploreModels': 'Explorar más modelos',
      'models.showLess': 'Mostrar menos',
      'models.additionalModels': 'Modelos Adicionales',
      'models.browseAllModels': 'Ver todos los modelos en Ollama',
      'models.recommendedModels': 'Modelos Recomendados',
      'models.downloadModel': 'Descargar',
      'models.deleteModel': 'Eliminar modelo',
      'models.downloadingModel': 'Descargando...',
      'models.downloadError': 'Error en la descarga, intente más tarde',
      'models.selectModelToDownload': 'Selecciona un modelo para empezar:',
      'models.modelSize': 'Tamaño:',
      
      // Modal de inicio de Ollama
      'startup.ollamaRequired': 'Ollama Requerido',
      'startup.ollamaNotRunningTitle': 'Ollama no está ejecutándose',
      'startup.ollamaNotRunningDesc': 'Para usar LocalMind necesitas tener Ollama ejecutándose. Puedes iniciarlo automáticamente desde aquí.',
      'startup.ollamaNotInstalledTitle': 'Ollama no está instalado',
      'startup.ollamaNotInstalledDesc': 'Para usar LocalMind necesitas instalar Ollama primero. Es un motor de IA local gratuito.',
      'startup.startOllama': 'Iniciar Ollama',
      'startup.installOllama': 'Instalar Ollama',
      'startup.downloadOllama': 'Descargar Ollama',
      'startup.goToSettings': 'Ir a Configuración',
      'startup.continueAnyway': 'Continuar sin Ollama',
      'startup.startingOllama': 'Iniciando Ollama...',
      
      // Pantalla de bienvenida
      'welcome.title': 'Bienvenido a LocalMind',
      'welcome.subtitle': 'Tu asistente de inteligencia artificial completamente local',
      'welcome.aiChatTitle': 'Chat con IA Avanzada',
      'welcome.aiChatDesc': 'Conversa con modelos de IA de última generación como Llama, Mistral y más, todo ejecutándose localmente en tu computadora.',
      'welcome.offlineTitle': 'Funciona Sin Internet',
      'welcome.offlineDesc': 'Toda la inteligencia artificial se ejecuta localmente. Tus conversaciones nunca salen de tu dispositivo, garantizando total privacidad.',
      'welcome.organizeTitle': 'Organiza tus Conversaciones',
      'welcome.organizeDesc': 'Crea carpetas personalizadas para organizar tus chats por proyecto, tema o cualquier categoría que necesites.',
      'welcome.privacyTitle': 'Privacidad Total',
      'welcome.privacyDesc': 'Sin servidores externos, sin tracking, sin compartir datos. Tu información permanece completamente privada y segura.',
      'welcome.multilangTitle': 'Múltiples Idiomas',
      'welcome.multilangDesc': 'Interfaz disponible en español, inglés, portugués, francés, alemán, chino y japonés para usuarios de todo el mundo.',
      'welcome.setupTitle': '¡Casi listo!',
      'welcome.setupDesc': 'Solo necesitamos conocer tu nombre para personalizar tu experiencia',
      'welcome.nameLabel': 'Tu nombre',
      'welcome.namePlaceholder': 'Ej: María García',
      'welcome.dontShowAgain': 'No volver a mostrar esta pantalla de bienvenida',
      'welcome.enterName': 'Cuéntanos tu nombre para personalizar la experiencia',
      'welcome.previous': 'Anterior',
      'welcome.next': 'Siguiente',
      'welcome.skip': 'Omitir',
      'welcome.getStarted': '¡Comenzar!',
      'welcome.settingUp': 'Configurando...',
      
      // Mensajes generales
      'common.user': 'Usuario',
      'common.cancel': 'Cancelar',
      'common.save': 'Guardar',
      
      // Modal sin modelos
      'noModels.title': 'Sin Modelos de IA',
      'noModels.subtitle': 'Instala un modelo para chatear',
      'noModels.description': 'Para poder conversar con el asistente, necesitas instalar al menos un modelo de IA. Te recomendamos empezar con un modelo ligero como Llama 3.2.',
      'noModels.installModels': 'Instalar Modelos',
      'noModels.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.close': 'Cerrar',
      'common.back': 'Volver',
      'common.continue': 'Continuar',
      
      // Términos y Condiciones
      'terms.title': 'Términos y Condiciones',
      'terms.fullTitle': 'TÉRMINOS Y CONDICIONES DE USO',
      'terms.lastUpdate': 'Última actualización',
      'terms.footer.thanks': 'Gracias por usar LocalMind',
      
      // Sección 1
      'terms.section1.title': 'Aceptación de los Términos',
      'terms.section1.content': 'Al descargar, instalar o utilizar LocalMind (en adelante, "la Aplicación"), el usuario acepta expresamente estos Términos y Condiciones. Si no está de acuerdo con alguno de ellos, debe abstenerse de utilizar la Aplicación.',
      
      // Sección 2
      'terms.section2.title': 'Descripción del Servicio',
      'terms.section2.content1': 'LocalMind es una aplicación de escritorio que permite interactuar con modelos de inteligencia artificial ejecutados localmente en el dispositivo del usuario, incluyendo modelos compatibles con Ollama.',
      'terms.section2.content2': 'La Aplicación funciona de manera local, sin enviar información a servidores externos operados por el desarrollador.',
      
      // Sección 3
      'terms.section3.title': 'Almacenamiento Local de Datos',
      'terms.section3.intro': 'La Aplicación permite almacenar de forma local información generada por el usuario, incluyendo pero no limitándose a:',
      'terms.section3.data1': 'Conversaciones con modelos de inteligencia artificial',
      'terms.section3.data2': 'Nombres o títulos definidos por el usuario para dichas conversaciones',
      'terms.section3.storage': 'Estos datos se almacenan exclusivamente en el dispositivo del usuario mediante una base de datos local (SQLite).',
      'terms.section3.developer': 'El desarrollador:',
      'terms.section3.no1': 'No accede a dichos datos',
      'terms.section3.no2': 'No recopila ni transmite información a servidores externos',
      'terms.section3.no3': 'No comparte información con terceros',
      'terms.section3.responsibility': 'La gestión, respaldo y eliminación de estos datos es responsabilidad exclusiva del usuario.',
      
      // Sección 4
      'terms.section4.title': 'Uso Permitido',
      'terms.section4.intro': 'El usuario se compromete a utilizar la Aplicación únicamente para fines legales, éticos y legítimos, tales como:',
      'terms.section4.use1': 'Productividad personal',
      'terms.section4.use2': 'Asistencia en programación',
      'terms.section4.use3': 'Escritura y análisis de texto',
      'terms.section4.use4': 'Investigación y aprendizaje',
      'terms.section4.use5': 'Creatividad y uso general de inteligencia artificial',
      
      // Sección 5
      'terms.section5.title': 'Uso Prohibido',
      'terms.section5.intro': 'Queda estrictamente prohibido utilizar la Aplicación para:',
      'terms.section5.prohibited1': 'Actividades ilegales o ilícitas',
      'terms.section5.prohibited2': 'Generación o facilitación de malware, fraudes, estafas o phishing',
      'terms.section5.prohibited3': 'Violación de derechos de autor, privacidad o propiedad intelectual',
      'terms.section5.prohibited4': 'Producción, distribución o promoción de contenido ilegal',
      'terms.section5.prohibited5': 'Cualquier uso que infrinja leyes locales, nacionales o internacionales',
      'terms.section5.responsibility': 'El usuario es el único responsable del contenido que genere y del uso que haga de la Aplicación.',
      
      // Sección 6
      'terms.section6.title': 'Responsabilidad del Usuario',
      'terms.section6.intro': 'El usuario reconoce y acepta que:',
      'terms.section6.responsibility1': 'Todo el contenido generado, almacenado o gestionado dentro de la Aplicación es de su exclusiva responsabilidad.',
      'terms.section6.responsibility2': 'El desarrollador de LocalMind no controla, supervisa ni modera el contenido generado o almacenado localmente.',
      'terms.section6.responsibility3': 'El uso de modelos de inteligencia artificial y la interpretación de sus resultados depende únicamente del usuario.',
      
      // Sección 7
      'terms.section7.title': 'Exclusión de Responsabilidad',
      'terms.section7.intro': 'La Aplicación se proporciona "tal cual", sin garantías de ningún tipo.',
      'terms.section7.notResponsible': 'El desarrollador no será responsable por:',
      'terms.section7.disclaimer1': 'Daños directos o indirectos derivados del uso de la Aplicación',
      'terms.section7.disclaimer2': 'Pérdida, corrupción o eliminación de datos almacenados localmente',
      'terms.section7.disclaimer3': 'Fallos del sistema, errores del modelo de IA o resultados incorrectos',
      'terms.section7.disclaimer4': 'Uso indebido, ilegal o no autorizado por parte del usuario',
      'terms.section7.disclaimer5': 'Decisiones tomadas por el usuario basadas en contenido generado por IA',
      
      // Sección 8
      'terms.section8.title': 'Inteligencia Artificial y Limitaciones',
      'terms.section8.intro': 'El usuario entiende y acepta que:',
      'terms.section8.limitation1': 'Los modelos de inteligencia artificial pueden generar información incorrecta, incompleta o imprecisa.',
      'terms.section8.limitation2': 'El contenido generado no constituye asesoría legal, médica, financiera ni profesional.',
      'terms.section8.limitation3': 'El usuario debe verificar de forma independiente cualquier información relevante.',
      
      // Sección 9
      'terms.section9.title': 'Privacidad',
      'terms.section9.privacy1': 'LocalMind respeta la privacidad del usuario.',
      'terms.section9.privacy2': 'Los datos se almacenan únicamente de forma local en el dispositivo del usuario.',
      'terms.section9.privacy3': 'El desarrollador no recopila información personal ni contenido generado.',
      'terms.section9.privacy4': 'No existe transmisión automática de datos a servidores externos.',
      
      // Sección 10
      'terms.section10.title': 'Propiedad Intelectual',
      'terms.section10.ownership': 'La Aplicación, su nombre, logotipo y código fuente (excepto librerías de terceros) son propiedad del desarrollador de LocalMind.',
      'terms.section10.rights': 'El uso de la Aplicación no otorga al usuario ningún derecho de propiedad intelectual sobre la misma.',
      
      // Sección 11
      'terms.section11.title': 'Modificaciones',
      'terms.section11.rights': 'El desarrollador se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.',
      'terms.section11.effective': 'Las modificaciones entrarán en vigor desde su publicación o incorporación en versiones futuras de la Aplicación.',
      
      // Sección 12
      'terms.section12.title': 'Terminación',
      'terms.section12.suspension': 'El desarrollador podrá suspender o limitar el uso de la Aplicación si el usuario incumple estos Términos.',
      'terms.section12.uninstall': 'El usuario puede dejar de utilizar la Aplicación en cualquier momento desinstalándola.',
      
      // Sección 13
      'terms.section13.title': 'Legislación Aplicable',
      'terms.section13.law': 'Estos Términos y Condiciones se rigen por las leyes de la República de Chile.',
      'terms.section13.jurisdiction': 'Cualquier controversia será sometida a los tribunales competentes de dicho país.',
      
      // Sección 14
      'terms.section14.title': 'Contacto',
      'terms.section14.contact': 'Para consultas relacionadas con estos Términos, el usuario puede contactar al desarrollador a través de los canales oficiales de LocalMind.'
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
      'settings.viewTerms': 'View terms and conditions',
      
      // Terminal
      'settings.terminal': 'Terminal',
      'settings.terminalDesc': 'Integrated terminal for system commands',
      'settings.showTerminal': 'Show Terminal',
      'settings.hideTerminal': 'Hide Terminal',
      
      // Ollama
      'settings.stopOllama': 'Stop Ollama',
      'settings.stopOllamaDesc': 'Stops the Ollama service if it is running',
      'settings.stopOllamaBtn': 'Stop Ollama',
      
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
      'models.ollamaInstallRequired': 'To use local AI models, you must first install Ollama.',
      'models.refreshAfterInstall': 'After installation, click "Refresh" to see available models.',
      'models.ollamaNotRunning': 'Ollama is installed but not running',
      'models.ollamaStartPrompt': 'Ollama is installed on your system but is not running. You can start it from here.',
      'models.startOllama': 'Start Ollama',
      'models.startingOllama': 'Starting Ollama...',
      'models.ollamaStarted': 'Ollama started successfully',
      'models.ollamaStartError': 'Error starting Ollama',
      'models.checkingOllama': 'Checking Ollama status...',
      'models.ollamaNotRunningError': 'Ollama is installed but not running',
      'models.ollamaNotInstalledError': 'Ollama is not installed on your system',
      'models.exploreModels': 'Explore more models',
      'models.showLess': 'Show less',
      'models.additionalModels': 'Additional Models',
      'models.browseAllModels': 'Browse all models on Ollama',
      'models.recommendedModels': 'Recommended Models',
      'models.downloadModel': 'Download',
      'models.deleteModel': 'Delete model',
      'models.downloadingModel': 'Downloading...',
      'models.downloadError': 'Download error, please try again later',
      'models.selectModelToDownload': 'Select a model to get started:',
      'models.modelSize': 'Size:',
      
      // Ollama startup modal
      'startup.ollamaRequired': 'Ollama Required',
      'startup.ollamaNotRunningTitle': 'Ollama is not running',
      'startup.ollamaNotRunningDesc': 'To use LocalMind you need to have Ollama running. You can start it automatically from here.',
      'startup.ollamaNotInstalledTitle': 'Ollama is not installed',
      'startup.ollamaNotInstalledDesc': 'To use LocalMind you need to install Ollama first. It is a free local AI engine.',
      'startup.startOllama': 'Start Ollama',
      'startup.installOllama': 'Install Ollama',
      'startup.downloadOllama': 'Download Ollama',
      'startup.goToSettings': 'Go to Settings',
      'startup.continueAnyway': 'Continue without Ollama',
      'startup.startingOllama': 'Starting Ollama...',
      
      // Welcome screen
      'welcome.title': 'Welcome to LocalMind',
      'welcome.subtitle': 'Your completely local artificial intelligence assistant',
      'welcome.aiChatTitle': 'Advanced AI Chat',
      'welcome.aiChatDesc': 'Chat with state-of-the-art AI models like Llama, Mistral and more, all running locally on your computer.',
      'welcome.offlineTitle': 'Works Offline',
      'welcome.offlineDesc': 'All artificial intelligence runs locally. Your conversations never leave your device, ensuring total privacy.',
      'welcome.organizeTitle': 'Organize Your Conversations',
      'welcome.organizeDesc': 'Create custom folders to organize your chats by project, topic or any category you need.',
      'welcome.privacyTitle': 'Total Privacy',
      'welcome.privacyDesc': 'No external servers, no tracking, no data sharing. Your information remains completely private and secure.',
      'welcome.multilangTitle': 'Multiple Languages',
      'welcome.multilangDesc': 'Interface available in Spanish, English, Portuguese, French, German, Chinese and Japanese for users worldwide.',
      'welcome.setupTitle': 'Almost Ready!',
      'welcome.setupDesc': 'We just need to know your name to personalize your experience',
      'welcome.nameLabel': 'Your name',
      'welcome.namePlaceholder': 'E.g: John Smith',
      'welcome.dontShowAgain': 'Don\'t show this welcome screen again',
      'welcome.enterName': 'Tell us your name to personalize the experience',
      'welcome.previous': 'Previous',
      'welcome.next': 'Next',
      'welcome.skip': 'Skip',
      'welcome.getStarted': 'Get Started!',
      'welcome.settingUp': 'Setting up...',
      
      // Common
      'common.user': 'User',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'common.back': 'Back',
      'common.continue': 'Continue',
      
      // Terms and Conditions
      'terms.title': 'Terms and Conditions',
      'terms.fullTitle': 'TERMS AND CONDITIONS OF USE',
      'terms.lastUpdate': 'Last updated',
      'terms.footer.thanks': 'Thank you for using LocalMind',
      
      // Section 1
      'terms.section1.title': 'Acceptance of Terms',
      'terms.section1.content': 'By downloading, installing or using LocalMind (hereinafter, "the Application"), the user expressly agrees to these Terms and Conditions. If you do not agree with any of them, you must refrain from using the Application.',
      
      // Section 2
      'terms.section2.title': 'Service Description',
      'terms.section2.content1': 'LocalMind is a desktop application that allows interaction with artificial intelligence models running locally on the user\'s device, including models compatible with Ollama.',
      'terms.section2.content2': 'The Application works locally, without sending information to external servers operated by the developer.',
      
      // Section 3
      'terms.section3.title': 'Local Data Storage',
      'terms.section3.intro': 'The Application allows local storage of user-generated information, including but not limited to:',
      'terms.section3.data1': 'Conversations with artificial intelligence models',
      'terms.section3.data2': 'Names or titles defined by the user for such conversations',
      'terms.section3.storage': 'This data is stored exclusively on the user\'s device through a local database (SQLite).',
      'terms.section3.developer': 'The developer:',
      'terms.section3.no1': 'Does not access such data',
      'terms.section3.no2': 'Does not collect or transmit information to external servers',
      'terms.section3.no3': 'Does not share information with third parties',
      'terms.section3.responsibility': 'The management, backup and deletion of this data is the exclusive responsibility of the user.',
      
      // Section 4
      'terms.section4.title': 'Permitted Use',
      'terms.section4.intro': 'The user agrees to use the Application only for legal, ethical and legitimate purposes, such as:',
      'terms.section4.use1': 'Personal productivity',
      'terms.section4.use2': 'Programming assistance',
      'terms.section4.use3': 'Writing and text analysis',
      'terms.section4.use4': 'Research and learning',
      'terms.section4.use5': 'Creativity and general use of artificial intelligence',
      
      // Section 5
      'terms.section5.title': 'Prohibited Use',
      'terms.section5.intro': 'It is strictly prohibited to use the Application for:',
      'terms.section5.prohibited1': 'Illegal or illicit activities',
      'terms.section5.prohibited2': 'Generation or facilitation of malware, fraud, scams or phishing',
      'terms.section5.prohibited3': 'Violation of copyright, privacy or intellectual property rights',
      'terms.section5.prohibited4': 'Production, distribution or promotion of illegal content',
      'terms.section5.prohibited5': 'Any use that violates local, national or international laws',
      'terms.section5.responsibility': 'The user is solely responsible for the content they generate and the use they make of the Application.',
      
      // Section 6
      'terms.section6.title': 'User Responsibility',
      'terms.section6.intro': 'The user acknowledges and accepts that:',
      'terms.section6.responsibility1': 'All content generated, stored or managed within the Application is their exclusive responsibility.',
      'terms.section6.responsibility2': 'The LocalMind developer does not control, supervise or moderate content generated or stored locally.',
      'terms.section6.responsibility3': 'The use of artificial intelligence models and interpretation of their results depends solely on the user.',
      
      // Section 7
      'terms.section7.title': 'Disclaimer',
      'terms.section7.intro': 'The Application is provided "as is", without warranties of any kind.',
      'terms.section7.notResponsible': 'The developer shall not be responsible for:',
      'terms.section7.disclaimer1': 'Direct or indirect damages arising from use of the Application',
      'terms.section7.disclaimer2': 'Loss, corruption or deletion of locally stored data',
      'terms.section7.disclaimer3': 'System failures, AI model errors or incorrect results',
      'terms.section7.disclaimer4': 'Improper, illegal or unauthorized use by the user',
      'terms.section7.disclaimer5': 'Decisions made by the user based on AI-generated content',
      
      // Section 8
      'terms.section8.title': 'Artificial Intelligence and Limitations',
      'terms.section8.intro': 'The user understands and accepts that:',
      'terms.section8.limitation1': 'Artificial intelligence models may generate incorrect, incomplete or inaccurate information.',
      'terms.section8.limitation2': 'Generated content does not constitute legal, medical, financial or professional advice.',
      'terms.section8.limitation3': 'The user must independently verify any relevant information.',
      
      // Section 9
      'terms.section9.title': 'Privacy',
      'terms.section9.privacy1': 'LocalMind respects user privacy.',
      'terms.section9.privacy2': 'Data is stored only locally on the user\'s device.',
      'terms.section9.privacy3': 'The developer does not collect personal information or generated content.',
      'terms.section9.privacy4': 'There is no automatic transmission of data to external servers.',
      
      // Section 10
      'terms.section10.title': 'Intellectual Property',
      'terms.section10.ownership': 'The Application, its name, logo and source code (except third-party libraries) are owned by the LocalMind developer.',
      'terms.section10.rights': 'Use of the Application does not grant the user any intellectual property rights over it.',
      
      // Section 11
      'terms.section11.title': 'Modifications',
      'terms.section11.rights': 'The developer reserves the right to modify these Terms and Conditions at any time.',
      'terms.section11.effective': 'Modifications will take effect from their publication or incorporation in future versions of the Application.',
      
      // Section 12
      'terms.section12.title': 'Termination',
      'terms.section12.suspension': 'The developer may suspend or limit use of the Application if the user violates these Terms.',
      'terms.section12.uninstall': 'The user may stop using the Application at any time by uninstalling it.',
      
      // Section 13
      'terms.section13.title': 'Applicable Law',
      'terms.section13.law': 'These Terms and Conditions are governed by the laws of the Republic of Chile.',
      'terms.section13.jurisdiction': 'Any dispute will be submitted to the competent courts of said country.',
      
      // Section 14
      'terms.section14.title': 'Contact',
      'terms.section14.contact': 'For inquiries related to these Terms, the user may contact the developer through LocalMind\'s official channels.',
      
      // Modal sin modelos
      'noModels.title': 'No AI Models',
      'noModels.subtitle': 'Install a model to chat',
      'noModels.description': 'To chat with the assistant, you need to install at least one AI model. We recommend starting with a lightweight model like Llama 3.2.',
      'noModels.installModels': 'Install Models',
      'noModels.cancel': 'Cancel',
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
      'settings.viewTerms': 'Ver termos e condições',
      
      // Terminal
      'settings.terminal': 'Terminal',
      'settings.terminalDesc': 'Terminal integrado para comandos do sistema',
      'settings.showTerminal': 'Mostrar Terminal',
      'settings.hideTerminal': 'Ocultar Terminal',
      
      // Ollama
      'settings.stopOllama': 'Parar Ollama',
      'settings.stopOllamaDesc': 'Para o serviço Ollama se estiver em execução',
      'settings.stopOllamaBtn': 'Parar Ollama',
      
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
      'models.exploreModels': 'Explorar mais modelos',
      'models.showLess': 'Mostrar menos',
      'models.additionalModels': 'Modelos Adicionais',
      'models.browseAllModels': 'Ver todos os modelos no Ollama',
      'models.downloadModel': 'Baixar',
      'models.deleteModel': 'Excluir modelo',
      'models.downloadingModel': 'Baixando...',
      'models.downloadError': 'Erro no download, tente novamente mais tarde',
      'models.selectModelToDownload': 'Selecione um modelo para começar:',
      'models.modelSize': 'Tamanho:',
      
      // Modal de início do Ollama
      'startup.ollamaRequired': 'Ollama Necessário',
      'startup.ollamaNotRunningTitle': 'Ollama não está em execução',
      'startup.ollamaNotRunningDesc': 'Para usar LocalMind você precisa ter o Ollama em execução. Você pode iniciá-lo automaticamente aqui.',
      'startup.ollamaNotInstalledTitle': 'Ollama não está instalado',
      'startup.ollamaNotInstalledDesc': 'Para usar LocalMind você precisa instalar o Ollama primeiro. É um motor de IA local gratuito.',
      'startup.startOllama': 'Iniciar Ollama',
      'startup.installOllama': 'Instalar Ollama',
      'startup.goToSettings': 'Ir para Configurações',
      'startup.continueAnyway': 'Continuar sem Ollama',
      'startup.startingOllama': 'Iniciando Ollama...',
      
      // Tela de boas-vindas
      'welcome.title': 'Bem-vindo ao LocalMind',
      'welcome.subtitle': 'Seu assistente de inteligência artificial completamente local',
      'welcome.aiChatTitle': 'Chat com IA Avançada',
      'welcome.aiChatDesc': 'Converse com modelos de IA de última geração como Llama, Mistral e mais, tudo executando localmente no seu computador.',
      'welcome.offlineTitle': 'Funciona Offline',
      'welcome.offlineDesc': 'Toda a inteligência artificial executa localmente. Suas conversas nunca saem do seu dispositivo, garantindo total privacidade.',
      'welcome.organizeTitle': 'Organize suas Conversas',
      'welcome.organizeDesc': 'Crie pastas personalizadas para organizar seus chats por projeto, tópico ou qualquer categoria que precisar.',
      'welcome.privacyTitle': 'Privacidade Total',
      'welcome.privacyDesc': 'Sem servidores externos, sem rastreamento, sem compartilhamento de dados. Suas informações permanecem completamente privadas e seguras.',
      'welcome.multilangTitle': 'Múltiplos Idiomas',
      'welcome.multilangDesc': 'Interface disponível em espanhol, inglês, português, francês, alemão, chinês e japonês para usuários do mundo todo.',
      'welcome.setupTitle': 'Quase pronto!',
      'welcome.setupDesc': 'Só precisamos saber seu nome para personalizar sua experiência',
      'welcome.nameLabel': 'Seu nome',
      'welcome.namePlaceholder': 'Ex: Maria Silva',
      'welcome.dontShowAgain': 'Não mostrar esta tela de boas-vindas novamente',
      'welcome.previous': 'Anterior',
      'welcome.next': 'Próximo',
      'welcome.skip': 'Pular',
      'welcome.getStarted': 'Começar!',
      'welcome.settingUp': 'Configurando...',
      
      'common.user': 'Usuário',
      'common.cancel': 'Cancelar',
      'common.save': 'Salvar',
      'common.delete': 'Excluir',
      'common.edit': 'Editar',
      'common.close': 'Fechar',
      'common.back': 'Voltar',
      'common.continue': 'Continuar',
      
      // Termos e Condições
      'terms.title': 'Termos e Condições',
      'terms.fullTitle': 'TERMOS E CONDIÇÕES DE USO',
      'terms.lastUpdate': 'Última atualização',
      'terms.footer.thanks': 'Obrigado por usar o LocalMind',
      
      // Seção 1
      'terms.section1.title': 'Aceitação dos Termos',
      'terms.section1.content': 'Ao baixar, instalar ou usar o LocalMind (doravante, "a Aplicação"), o usuário aceita expressamente estes Termos e Condições. Se não concordar com algum deles, deve abster-se de usar a Aplicação.',
      
      // Seção 2
      'terms.section2.title': 'Descrição do Serviço',
      'terms.section2.content1': 'LocalMind é uma aplicação desktop que permite interagir com modelos de inteligência artificial executados localmente no dispositivo do usuário, incluindo modelos compatíveis com Ollama.',
      'terms.section2.content2': 'A Aplicação funciona localmente, sem enviar informações para servidores externos operados pelo desenvolvedor.',
      
      // Seção 3
      'terms.section3.title': 'Armazenamento Local de Dados',
      'terms.section3.intro': 'A Aplicação permite armazenar localmente informações geradas pelo usuário, incluindo mas não se limitando a:',
      'terms.section3.data1': 'Conversas com modelos de inteligência artificial',
      'terms.section3.data2': 'Nomes ou títulos definidos pelo usuário para tais conversas',
      'terms.section3.storage': 'Estes dados são armazenados exclusivamente no dispositivo do usuário através de um banco de dados local (SQLite).',
      'terms.section3.developer': 'O desenvolvedor:',
      'terms.section3.no1': 'Não acessa tais dados',
      'terms.section3.no2': 'Não coleta nem transmite informações para servidores externos',
      'terms.section3.no3': 'Não compartilha informações com terceiros',
      'terms.section3.responsibility': 'O gerenciamento, backup e exclusão desses dados é de responsabilidade exclusiva do usuário.',
      
      // Seção 4
      'terms.section4.title': 'Uso Permitido',
      'terms.section4.intro': 'O usuário compromete-se a usar a Aplicação apenas para fins legais, éticos e legítimos, tais como:',
      'terms.section4.use1': 'Produtividade pessoal',
      'terms.section4.use2': 'Assistência em programação',
      'terms.section4.use3': 'Escrita e análise de texto',
      'terms.section4.use4': 'Pesquisa e aprendizagem',
      'terms.section4.use5': 'Criatividade e uso geral de inteligência artificial',
      
      // Seção 5
      'terms.section5.title': 'Uso Proibido',
      'terms.section5.intro': 'É estritamente proibido usar a Aplicação para:',
      'terms.section5.prohibited1': 'Atividades ilegais ou ilícitas',
      'terms.section5.prohibited2': 'Geração ou facilitação de malware, fraudes, golpes ou phishing',
      'terms.section5.prohibited3': 'Violação de direitos autorais, privacidade ou propriedade intelectual',
      'terms.section5.prohibited4': 'Produção, distribuição ou promoção de conteúdo ilegal',
      'terms.section5.prohibited5': 'Qualquer uso que infrinja leis locais, nacionais ou internacionais',
      'terms.section5.responsibility': 'O usuário é o único responsável pelo conteúdo que gerar e pelo uso que fizer da Aplicação.',
      
      // Seção 6
      'terms.section6.title': 'Responsabilidade do Usuário',
      'terms.section6.intro': 'O usuário reconhece e aceita que:',
      'terms.section6.responsibility1': 'Todo o conteúdo gerado, armazenado ou gerenciado dentro da Aplicação é de sua exclusiva responsabilidade.',
      'terms.section6.responsibility2': 'O desenvolvedor do LocalMind não controla, supervisiona nem modera o conteúdo gerado ou armazenado localmente.',
      'terms.section6.responsibility3': 'O uso de modelos de inteligência artificial e a interpretação de seus resultados depende unicamente do usuário.',
      
      // Seção 7
      'terms.section7.title': 'Exclusão de Responsabilidade',
      'terms.section7.intro': 'A Aplicação é fornecida "como está", sem garantias de qualquer tipo.',
      'terms.section7.notResponsible': 'O desenvolvedor não será responsável por:',
      'terms.section7.disclaimer1': 'Danos diretos ou indiretos decorrentes do uso da Aplicação',
      'terms.section7.disclaimer2': 'Perda, corrupção ou exclusão de dados armazenados localmente',
      'terms.section7.disclaimer3': 'Falhas do sistema, erros do modelo de IA ou resultados incorretos',
      'terms.section7.disclaimer4': 'Uso indevido, ilegal ou não autorizado pelo usuário',
      'terms.section7.disclaimer5': 'Decisões tomadas pelo usuário baseadas em conteúdo gerado por IA',
      
      // Seção 8
      'terms.section8.title': 'Inteligência Artificial e Limitações',
      'terms.section8.intro': 'O usuário entende e aceita que:',
      'terms.section8.limitation1': 'Os modelos de inteligência artificial podem gerar informações incorretas, incompletas ou imprecisas.',
      'terms.section8.limitation2': 'O conteúdo gerado não constitui assessoria legal, médica, financeira ou profissional.',
      'terms.section8.limitation3': 'O usuário deve verificar independentemente qualquer informação relevante.',
      
      // Seção 9
      'terms.section9.title': 'Privacidade',
      'terms.section9.privacy1': 'LocalMind respeita a privacidade do usuário.',
      'terms.section9.privacy2': 'Os dados são armazenados apenas localmente no dispositivo do usuário.',
      'terms.section9.privacy3': 'O desenvolvedor não coleta informações pessoais nem conteúdo gerado.',
      'terms.section9.privacy4': 'Não existe transmissão automática de dados para servidores externos.',
      
      // Seção 10
      'terms.section10.title': 'Propriedade Intelectual',
      'terms.section10.ownership': 'A Aplicação, seu nome, logotipo e código-fonte (exceto bibliotecas de terceiros) são propriedade do desenvolvedor do LocalMind.',
      'terms.section10.rights': 'O uso da Aplicação não concede ao usuário nenhum direito de propriedade intelectual sobre ela.',
      
      // Seção 11
      'terms.section11.title': 'Modificações',
      'terms.section11.rights': 'O desenvolvedor reserva-se o direito de modificar estes Termos e Condições a qualquer momento.',
      'terms.section11.effective': 'As modificações entrarão em vigor a partir de sua publicação ou incorporação em versões futuras da Aplicação.',
      
      // Seção 12
      'terms.section12.title': 'Terminação',
      'terms.section12.suspension': 'O desenvolvedor poderá suspender ou limitar o uso da Aplicação se o usuário descumprir estes Termos.',
      'terms.section12.uninstall': 'O usuário pode parar de usar a Aplicação a qualquer momento desinstalando-a.',
      
      // Seção 13
      'terms.section13.title': 'Legislação Aplicável',
      'terms.section13.law': 'Estes Termos e Condições são regidos pelas leis da República do Chile.',
      'terms.section13.jurisdiction': 'Qualquer controvérsia será submetida aos tribunais competentes do referido país.',
      
      // Seção 14
      'terms.section14.title': 'Contato',
      'terms.section14.contact': 'Para consultas relacionadas a estes Termos, o usuário pode entrar em contato com o desenvolvedor através dos canais oficiais do LocalMind.',
      
      // Modal sem modelos
      'noModels.title': 'Sem Modelos de IA',
      'noModels.subtitle': 'Instale um modelo para conversar',
      'noModels.description': 'Para conversar com o assistente, você precisa instalar pelo menos um modelo de IA. Recomendamos começar com um modelo leve como Llama 3.2.',
      'noModels.installModels': 'Instalar Modelos',
      'noModels.cancel': 'Cancelar'
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
      'settings.viewTerms': 'Voir les conditions d\'utilisation',
      
      // Terminal
      'settings.terminal': 'Terminal',
      'settings.terminalDesc': 'Terminal intégré pour les commandes système',
      'settings.showTerminal': 'Afficher Terminal',
      'settings.hideTerminal': 'Masquer Terminal',
      
      // Ollama
      'settings.stopOllama': 'Arrêter Ollama',
      'settings.stopOllamaDesc': 'Arrête le service Ollama s\'il est en cours d\'exécution',
      'settings.stopOllamaBtn': 'Arrêter Ollama',
      
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
      'models.exploreModels': 'Explorer plus de modèles',
      'models.showLess': 'Afficher moins',
      'models.additionalModels': 'Modèles Supplémentaires',
      'models.browseAllModels': 'Voir tous les modèles sur Ollama',
      'models.downloadModel': 'Télécharger',
      'models.deleteModel': 'Supprimer le modèle',
      'models.downloadingModel': 'Téléchargement...',
      'models.downloadError': 'Erreur de téléchargement, veuillez réessayer plus tard',
      'models.selectModelToDownload': 'Sélectionnez un modèle pour commencer:',
      'models.modelSize': 'Taille:',
      
      // Modal de démarrage Ollama
      'startup.ollamaRequired': 'Ollama Requis',
      'startup.ollamaNotRunningTitle': 'Ollama ne fonctionne pas',
      'startup.ollamaNotRunningDesc': 'Pour utiliser LocalMind, vous devez avoir Ollama en cours d’exécution. Vous pouvez le démarrer automatiquement d’ici.',
      'startup.ollamaNotInstalledTitle': 'Ollama n’est pas installé',
      'startup.ollamaNotInstalledDesc': 'Pour utiliser LocalMind, vous devez d’abord installer Ollama. C’est un moteur IA local gratuit.',
      'startup.startOllama': 'Démarrer Ollama',
      'startup.installOllama': 'Installer Ollama',
      'startup.goToSettings': 'Aller aux Paramètres',
      'startup.continueAnyway': 'Continuer sans Ollama',
      'startup.startingOllama': 'Démarrage d’Ollama...',      
      // Écran de bienvenue
      'welcome.title': 'Bienvenue dans LocalMind',
      'welcome.subtitle': 'Votre assistant d\'intelligence artificielle entièrement local',
      'welcome.aiChatTitle': 'Chat IA Avancé',
      'welcome.aiChatDesc': 'Chattez avec des modèles d\'IA de pointe comme Llama, Mistral et plus, le tout s\'exécutant localement sur votre ordinateur.',
      'welcome.offlineTitle': 'Fonctionne Hors Ligne',
      'welcome.offlineDesc': 'Toute l\'intelligence artificielle s\'exécute localement. Vos conversations ne quittent jamais votre appareil, garantissant une confidentialité totale.',
      'welcome.organizeTitle': 'Organisez vos Conversations',
      'welcome.organizeDesc': 'Créez des dossiers personnalisés pour organiser vos chats par projet, sujet ou toute catégorie dont vous avez besoin.',
      'welcome.privacyTitle': 'Confidentialité Totale',
      'welcome.privacyDesc': 'Pas de serveurs externes, pas de suivi, pas de partage de données. Vos informations restent complètement privées et sécurisées.',
      'welcome.multilangTitle': 'Multiples Langues',
      'welcome.multilangDesc': 'Interface disponible en espagnol, anglais, portugais, français, allemand, chinois et japonais pour les utilisateurs du monde entier.',
      'welcome.setupTitle': 'Presque prêt !',
      'welcome.setupDesc': 'Nous avons juste besoin de connaître votre nom pour personnaliser votre expérience',
      'welcome.nameLabel': 'Votre nom',
      'welcome.namePlaceholder': 'Ex: Marie Dupont',
      'welcome.dontShowAgain': 'Ne plus afficher cet écran de bienvenue',
      'welcome.previous': 'Précédent',
      'welcome.next': 'Suivant',
      'welcome.skip': 'Ignorer',
      'welcome.getStarted': 'Commencer !',
      'welcome.settingUp': 'Configuration...',      'models.size': 'Taille',
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
      'common.close': 'Fermer',
      'common.back': 'Retour',
      'common.continue': 'Continuer',
      
      // Termes et Conditions
      'terms.title': 'Termes et Conditions',
      'terms.fullTitle': 'TERMES ET CONDITIONS D\'UTILISATION',
      'terms.lastUpdate': 'Dernière mise à jour',
      'terms.footer.thanks': 'Merci d\'utiliser LocalMind',
      
      // Section 1
      'terms.section1.title': 'Acceptation des Termes',
      'terms.section1.content': 'En téléchargeant, installant ou utilisant LocalMind (ci-après, "l\'Application"), l\'utilisateur accepte expressément ces Termes et Conditions. S\'il n\'est pas d\'accord avec l\'un d\'entre eux, il doit s\'abstenir d\'utiliser l\'Application.',
      
      // Section 2
      'terms.section2.title': 'Description du Service',
      'terms.section2.content1': 'LocalMind est une application de bureau qui permet d\'interagir avec des modèles d\'intelligence artificielle exécutés localement sur l\'appareil de l\'utilisateur, y compris les modèles compatibles avec Ollama.',
      'terms.section2.content2': 'L\'Application fonctionne localement, sans envoyer d\'informations à des serveurs externes exploités par le développeur.',
      
      // Section 3
      'terms.section3.title': 'Stockage Local des Données',
      'terms.section3.intro': 'L\'Application permet de stocker localement les informations générées par l\'utilisateur, incluant mais sans s\'y limiter à:',
      'terms.section3.data1': 'Conversations avec les modèles d\'intelligence artificielle',
      'terms.section3.data2': 'Noms ou titres définis par l\'utilisateur pour ces conversations',
      'terms.section3.storage': 'Ces données sont stockées exclusivement sur l\'appareil de l\'utilisateur via une base de données locale (SQLite).',
      'terms.section3.developer': 'Le développeur:',
      'terms.section3.no1': 'N\'accède pas à ces données',
      'terms.section3.no2': 'Ne collecte ni ne transmet d\'informations vers des serveurs externes',
      'terms.section3.no3': 'Ne partage pas d\'informations avec des tiers',
      'terms.section3.responsibility': 'La gestion, la sauvegarde et la suppression de ces données relèvent de la seule responsabilité de l\'utilisateur.',
      
      // Section 4
      'terms.section4.title': 'Utilisation Autorisée',
      'terms.section4.intro': 'L\'utilisateur s\'engage à utiliser l\'Application uniquement à des fins légales, éthiques et légitimes, telles que:',
      'terms.section4.use1': 'Productivité personnelle',
      'terms.section4.use2': 'Assistance à la programmation',
      'terms.section4.use3': 'Rédaction et analyse de texte',
      'terms.section4.use4': 'Recherche et apprentissage',
      'terms.section4.use5': 'Créativité et utilisation générale de l\'intelligence artificielle',
      
      // Section 5
      'terms.section5.title': 'Utilisation Interdite',
      'terms.section5.intro': 'Il est strictement interdit d\'utiliser l\'Application pour:',
      'terms.section5.prohibited1': 'Activités illégales ou illicites',
      'terms.section5.prohibited2': 'Génération ou facilitation de malware, fraudes, arnaques ou phishing',
      'terms.section5.prohibited3': 'Violation de droits d\'auteur, de confidentialité ou de propriété intellectuelle',
      'terms.section5.prohibited4': 'Production, distribution ou promotion de contenu illégal',
      'terms.section5.prohibited5': 'Toute utilisation qui enfreint les lois locales, nationales ou internationales',
      'terms.section5.responsibility': 'L\'utilisateur est seul responsable du contenu qu\'il génère et de l\'usage qu\'il fait de l\'Application.',
      
      // Section 6
      'terms.section6.title': 'Responsabilité de l\'Utilisateur',
      'terms.section6.intro': 'L\'utilisateur reconnaît et accepte que:',
      'terms.section6.responsibility1': 'Tout le contenu généré, stocké ou géré dans l\'Application relève de sa seule responsabilité.',
      'terms.section6.responsibility2': 'Le développeur de LocalMind ne contrôle, ne supervise ni ne modère le contenu généré ou stocké localement.',
      'terms.section6.responsibility3': 'L\'utilisation des modèles d\'intelligence artificielle et l\'interprétation de leurs résultats dépend uniquement de l\'utilisateur.',
      
      // Section 7
      'terms.section7.title': 'Exclusion de Responsabilité',
      'terms.section7.intro': 'L\'Application est fournie "en l\'état", sans garanties d\'aucune sorte.',
      'terms.section7.notResponsible': 'Le développeur ne sera pas responsable de:',
      'terms.section7.disclaimer1': 'Dommages directs ou indirects résultant de l\'utilisation de l\'Application',
      'terms.section7.disclaimer2': 'Perte, corruption ou suppression de données stockées localement',
      'terms.section7.disclaimer3': 'Pannes du système, erreurs du modèle IA ou résultats incorrects',
      'terms.section7.disclaimer4': 'Utilisation inappropriée, illégale ou non autorisée par l\'utilisateur',
      'terms.section7.disclaimer5': 'Décisions prises par l\'utilisateur basées sur du contenu généré par IA',
      
      // Section 8
      'terms.section8.title': 'Intelligence Artificielle et Limitations',
      'terms.section8.intro': 'L\'utilisateur comprend et accepte que:',
      'terms.section8.limitation1': 'Les modèles d\'intelligence artificielle peuvent générer des informations incorrectes, incomplètes ou imprécises.',
      'terms.section8.limitation2': 'Le contenu généré ne constitue pas un conseil juridique, médical, financier ou professionnel.',
      'terms.section8.limitation3': 'L\'utilisateur doit vérifier indépendamment toute information pertinente.',
      
      // Section 9
      'terms.section9.title': 'Confidentialité',
      'terms.section9.privacy1': 'LocalMind respecte la confidentialité de l\'utilisateur.',
      'terms.section9.privacy2': 'Les données sont stockées uniquement localement sur l\'appareil de l\'utilisateur.',
      'terms.section9.privacy3': 'Le développeur ne collecte pas d\'informations personnelles ni de contenu généré.',
      'terms.section9.privacy4': 'Il n\'y a pas de transmission automatique de données vers des serveurs externes.',
      
      // Section 10
      'terms.section10.title': 'Propriété Intellectuelle',
      'terms.section10.ownership': 'L\'Application, son nom, son logo et son code source (à l\'exception des bibliothèques tierces) appartiennent au développeur de LocalMind.',
      'terms.section10.rights': 'L\'utilisation de l\'Application n\'accorde à l\'utilisateur aucun droit de propriété intellectuelle sur celle-ci.',
      
      // Section 11
      'terms.section11.title': 'Modifications',
      'terms.section11.rights': 'Le développeur se réserve le droit de modifier ces Termes et Conditions à tout moment.',
      'terms.section11.effective': 'Les modifications prendront effet dès leur publication ou incorporation dans les versions futures de l\'Application.',
      
      // Section 12
      'terms.section12.title': 'Résiliation',
      'terms.section12.suspension': 'Le développeur peut suspendre ou limiter l\'utilisation de l\'Application si l\'utilisateur viole ces Termes.',
      'terms.section12.uninstall': 'L\'utilisateur peut cesser d\'utiliser l\'Application à tout moment en la désinstallant.',
      
      // Section 13
      'terms.section13.title': 'Loi Applicable',
      'terms.section13.law': 'Ces Termes et Conditions sont régis par les lois de la République du Chili.',
      'terms.section13.jurisdiction': 'Tout litige sera soumis aux tribunaux compétents dudit pays.',
      
      // Section 14
      'terms.section14.title': 'Contact',
      'terms.section14.contact': 'Pour les demandes liées à ces Termes, l\'utilisateur peut contacter le développeur via les canaux officiels de LocalMind.',
      
      // Modal sans modèles
      'noModels.title': 'Aucun Modèle IA',
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
      'settings.viewTerms': 'Nutzungsbedingungen anzeigen',
      
      // Terminal
      'settings.terminal': 'Terminal',
      'settings.terminalDesc': 'Integriertes Terminal für Systembefehle',
      'settings.showTerminal': 'Terminal anzeigen',
      'settings.hideTerminal': 'Terminal ausblenden',
      
      // Ollama
      'settings.stopOllama': 'Ollama stoppen',
      'settings.stopOllamaDesc': 'Stoppt den Ollama-Dienst, wenn er ausgeführt wird',
      'settings.stopOllamaBtn': 'Ollama stoppen',
      
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
      'models.exploreModels': 'Weitere Modelle erkunden',
      'models.showLess': 'Weniger anzeigen',
      'models.additionalModels': 'Zusätzliche Modelle',
      'models.browseAllModels': 'Alle Modelle auf Ollama durchsuchen',
      'models.downloadModel': 'Herunterladen',
      'models.deleteModel': 'Modell löschen',
      'models.downloadingModel': 'Wird heruntergeladen...',
      'models.downloadError': 'Download-Fehler, bitte versuchen Sie es später erneut',
      'models.selectModelToDownload': 'Wählen Sie ein Modell zum Starten:',
      'models.modelSize': 'Größe:',
      
      // Ollama Startup Modal
      'startup.ollamaRequired': 'Ollama Erforderlich',
      'startup.ollamaNotRunningTitle': 'Ollama läuft nicht',
      'startup.ollamaNotRunningDesc': 'Um LocalMind zu verwenden, muss Ollama laufen. Sie können es automatisch von hier starten.',
      'startup.ollamaNotInstalledTitle': 'Ollama ist nicht installiert',
      'startup.ollamaNotInstalledDesc': 'Um LocalMind zu verwenden, müssen Sie zuerst Ollama installieren. Es ist eine kostenlose lokale KI-Engine.',
      'startup.startOllama': 'Ollama starten',
      'startup.installOllama': 'Ollama installieren',
      'startup.goToSettings': 'Zu Einstellungen gehen',
      'startup.continueAnyway': 'Ohne Ollama fortfahren',
      'startup.startingOllama': 'Starte Ollama...',
      
      // Willkommensbildschirm
      'welcome.title': 'Willkommen bei LocalMind',
      'welcome.subtitle': 'Ihr vollständig lokaler KI-Assistent',
      'welcome.aiChatTitle': 'Erweiterte KI-Chat',
      'welcome.aiChatDesc': 'Chatten Sie mit modernsten KI-Modellen wie Llama, Mistral und mehr, alles läuft lokal auf Ihrem Computer.',
      'welcome.offlineTitle': 'Funktioniert Offline',
      'welcome.offlineDesc': 'Alle künstliche Intelligenz läuft lokal. Ihre Gespräche verlassen nie Ihr Gerät und gewährleisten totale Privatsphäre.',
      'welcome.organizeTitle': 'Organisieren Sie Ihre Gespräche',
      'welcome.organizeDesc': 'Erstellen Sie benutzerdefinierte Ordner, um Ihre Chats nach Projekt, Thema oder jeder beliebigen Kategorie zu organisieren.',
      'welcome.privacyTitle': 'Totale Privatsphäre',
      'welcome.privacyDesc': 'Keine externen Server, kein Tracking, keine Datenfreigabe. Ihre Informationen bleiben vollständig privat und sicher.',
      'welcome.multilangTitle': 'Mehrere Sprachen',
      'welcome.multilangDesc': 'Oberfläche verfügbar in Spanisch, Englisch, Portugiesisch, Französisch, Deutsch, Chinesisch und Japanisch für Benutzer weltweit.',
      'welcome.setupTitle': 'Fast fertig!',
      'welcome.setupDesc': 'Wir müssen nur Ihren Namen wissen, um Ihr Erlebnis zu personalisieren',
      'welcome.nameLabel': 'Ihr Name',
      'welcome.namePlaceholder': 'z.B.: Maria Schmidt',
      'welcome.dontShowAgain': 'Diesen Willkommensbildschirm nicht mehr anzeigen',
      'welcome.previous': 'Zurück',
      'welcome.next': 'Weiter',
      'welcome.skip': 'Überspringen',
      'welcome.getStarted': 'Loslegen!',
      'welcome.settingUp': 'Einrichtung...',
      
      // Allgemein
      'common.user': 'Benutzer',
      'common.cancel': 'Abbrechen',
      'common.save': 'Speichern',
      'common.delete': 'Löschen',
      'common.edit': 'Bearbeiten',
      'common.close': 'Schließen',
      'common.back': 'Zurück',
      'common.continue': 'Weiter',
      
      // Nutzungsbedingungen
      'terms.title': 'Nutzungsbedingungen',
      'terms.fullTitle': 'NUTZUNGSBEDINGUNGEN',
      'terms.lastUpdate': 'Letzte Aktualisierung',
      'terms.footer.thanks': 'Vielen Dank für die Nutzung von LocalMind',
      
      // Abschnitt 1
      'terms.section1.title': 'Annahme der Bedingungen',
      'terms.section1.content': 'Durch das Herunterladen, Installieren oder Verwenden von LocalMind (im Folgenden "die Anwendung") stimmt der Benutzer diesen Nutzungsbedingungen ausdrücklich zu. Wenn er mit einem von ihnen nicht einverstanden ist, muss er sich der Nutzung der Anwendung enthalten.',
      
      // Abschnitt 2
      'terms.section2.title': 'Servicebeschreibung',
      'terms.section2.content1': 'LocalMind ist eine Desktop-Anwendung, die es ermöglicht, mit künstlichen Intelligenzmodellen zu interagieren, die lokal auf dem Gerät des Benutzers ausgeführt werden, einschließlich Modellen, die mit Ollama kompatibel sind.',
      'terms.section2.content2': 'Die Anwendung funktioniert lokal, ohne Informationen an externe Server zu senden, die vom Entwickler betrieben werden.',
      
      // Abschnitt 3
      'terms.section3.title': 'Lokale Datenspeicherung',
      'terms.section3.intro': 'Die Anwendung ermöglicht die lokale Speicherung von benutzergenerierte Informationen, einschließlich aber nicht beschränkt auf:',
      'terms.section3.data1': 'Gespräche mit künstlichen Intelligenzmodellen',
      'terms.section3.data2': 'Vom Benutzer definierte Namen oder Titel für solche Gespräche',
      'terms.section3.storage': 'Diese Daten werden ausschließlich auf dem Gerät des Benutzers über eine lokale Datenbank (SQLite) gespeichert.',
      'terms.section3.developer': 'Der Entwickler:',
      'terms.section3.no1': 'Greift nicht auf solche Daten zu',
      'terms.section3.no2': 'Sammelt oder überträgt keine Informationen an externe Server',
      'terms.section3.no3': 'Teilt keine Informationen mit Dritten',
      'terms.section3.responsibility': 'Die Verwaltung, Sicherung und Löschung dieser Daten liegt in der alleinigen Verantwortung des Benutzers.',
      
      // Abschnitt 4
      'terms.section4.title': 'Erlaubte Nutzung',
      'terms.section4.intro': 'Der Benutzer verpflichtet sich, die Anwendung nur für legale, ethische und legitime Zwecke zu verwenden, wie:',
      'terms.section4.use1': 'Persönliche Produktivität',
      'terms.section4.use2': 'Programmierungsunterstützung',
      'terms.section4.use3': 'Schreiben und Textanalyse',
      'terms.section4.use4': 'Forschung und Lernen',
      'terms.section4.use5': 'Kreativität und allgemeine Nutzung künstlicher Intelligenz',
      
      // Abschnitt 5
      'terms.section5.title': 'Verbotene Nutzung',
      'terms.section5.intro': 'Es ist strengstens verboten, die Anwendung zu verwenden für:',
      'terms.section5.prohibited1': 'Illegale oder unerlaubte Aktivitäten',
      'terms.section5.prohibited2': 'Generierung oder Erleichterung von Malware, Betrug, Betrügereien oder Phishing',
      'terms.section5.prohibited3': 'Verletzung von Urheberrechten, Datenschutz oder geistigen Eigentumsrechten',
      'terms.section5.prohibited4': 'Produktion, Verteilung oder Förderung illegaler Inhalte',
      'terms.section5.prohibited5': 'Jede Nutzung, die lokale, nationale oder internationale Gesetze verletzt',
      'terms.section5.responsibility': 'Der Benutzer ist allein verantwortlich für die Inhalte, die er generiert, und für die Nutzung, die er von der Anwendung macht.',
      
      // Abschnitt 6
      'terms.section6.title': 'Benutzerverantwortung',
      'terms.section6.intro': 'Der Benutzer erkennt an und akzeptiert, dass:',
      'terms.section6.responsibility1': 'Alle innerhalb der Anwendung generierten, gespeicherten oder verwalteten Inhalte in seiner alleinigen Verantwortung liegen.',
      'terms.section6.responsibility2': 'Der Entwickler von LocalMind kontrolliert, überwacht oder moderiert keine lokal generierten oder gespeicherten Inhalte.',
      'terms.section6.responsibility3': 'Die Nutzung von künstlichen Intelligenzmodellen und die Interpretation ihrer Ergebnisse hängt ausschließlich vom Benutzer ab.',
      
      // Abschnitt 7
      'terms.section7.title': 'Haftungsausschluss',
      'terms.section7.intro': 'Die Anwendung wird "wie sie ist" bereitgestellt, ohne Garantien jeglicher Art.',
      'terms.section7.notResponsible': 'Der Entwickler haftet nicht für:',
      'terms.section7.disclaimer1': 'Direkte oder indirekte Schäden, die aus der Nutzung der Anwendung entstehen',
      'terms.section7.disclaimer2': 'Verlust, Beschädigung oder Löschung lokal gespeicherter Daten',
      'terms.section7.disclaimer3': 'Systemfehler, KI-Modell-Fehler oder falsche Ergebnisse',
      'terms.section7.disclaimer4': 'Unsachgemäße, illegale oder unbefugte Nutzung durch den Benutzer',
      'terms.section7.disclaimer5': 'Entscheidungen des Benutzers basierend auf KI-generierten Inhalten',
      
      // Abschnitt 8
      'terms.section8.title': 'Künstliche Intelligenz und Einschränkungen',
      'terms.section8.intro': 'Der Benutzer versteht und akzeptiert, dass:',
      'terms.section8.limitation1': 'Künstliche Intelligenzmodelle können falsche, unvollständige oder ungenaue Informationen generieren.',
      'terms.section8.limitation2': 'Generierte Inhalte stellen keine rechtliche, medizinische, finanzielle oder professionelle Beratung dar.',
      'terms.section8.limitation3': 'Der Benutzer muss alle relevanten Informationen unabhängig verifizieren.',
      
      // Abschnitt 9
      'terms.section9.title': 'Datenschutz',
      'terms.section9.privacy1': 'LocalMind respektiert die Privatsphäre des Benutzers.',
      'terms.section9.privacy2': 'Daten werden nur lokal auf dem Gerät des Benutzers gespeichert.',
      'terms.section9.privacy3': 'Der Entwickler sammelt keine persönlichen Informationen oder generierte Inhalte.',
      'terms.section9.privacy4': 'Es gibt keine automatische Übertragung von Daten an externe Server.',
      
      // Abschnitt 10
      'terms.section10.title': 'Geistiges Eigentum',
      'terms.section10.ownership': 'Die Anwendung, ihr Name, Logo und Quellcode (außer Drittanbieter-Bibliotheken) sind Eigentum des LocalMind-Entwicklers.',
      'terms.section10.rights': 'Die Nutzung der Anwendung gewährt dem Benutzer keine geistigen Eigentumsrechte daran.',
      
      // Abschnitt 11
      'terms.section11.title': 'Änderungen',
      'terms.section11.rights': 'Der Entwickler behält sich das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern.',
      'terms.section11.effective': 'Änderungen treten ab ihrer Veröffentlichung oder Einbindung in zukünftige Versionen der Anwendung in Kraft.',
      
      // Abschnitt 12
      'terms.section12.title': 'Beendigung',
      'terms.section12.suspension': 'Der Entwickler kann die Nutzung der Anwendung aussetzen oder einschränken, wenn der Benutzer gegen diese Bedingungen verstößt.',
      'terms.section12.uninstall': 'Der Benutzer kann die Nutzung der Anwendung jederzeit durch Deinstallation beenden.',
      
      // Abschnitt 13
      'terms.section13.title': 'Anwendbares Recht',
      'terms.section13.law': 'Diese Nutzungsbedingungen unterliegen den Gesetzen der Republik Chile.',
      'terms.section13.jurisdiction': 'Jede Streitigkeit wird den zuständigen Gerichten des genannten Landes unterbreitet.',
      
      // Abschnitt 14
      'terms.section14.title': 'Kontakt',
      'terms.section14.contact': 'Für Anfragen zu diesen Bedingungen kann der Benutzer den Entwickler über die offiziellen Kanäle von LocalMind kontaktieren.',
      
      // Modal ohne Modelle
      'noModels.title': 'Keine KI-Modelle',
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
      'settings.viewTerms': '查看使用条款',
      
      // Terminal
      'settings.terminal': '终端',
      'settings.terminalDesc': '用于系统命令的集成终端',
      'settings.showTerminal': '显示终端',
      'settings.hideTerminal': '隐藏终端',
      
      // Ollama
      'settings.stopOllama': '停止Ollama',
      'settings.stopOllamaDesc': '如果Ollama正在运行，停止该服务',
      'settings.stopOllamaBtn': '停止Ollama',
      
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
      'models.exploreModels': '探索更多模型',
      'models.showLess': '显示更少',
      'models.additionalModels': '附加模型',
      'models.browseAllModels': '在Ollama上浏览所有模型',
      'models.downloadModel': '下载',
      'models.deleteModel': '删除模型',
      'models.downloadingModel': '下载中...',
      'models.downloadError': '下载错误，请稍后重试',
      'models.selectModelToDownload': '选择一个模型开始:',
      'models.modelSize': '大小:',      
      // Ollama 启动模态框
      'startup.ollamaRequired': '需要 Ollama',
      'startup.ollamaNotRunningTitle': 'Ollama 未运行',
      'startup.ollamaNotRunningDesc': '要使用 LocalMind，您需要运行 Ollama。您可以从这里自动启动它。',
      'startup.ollamaNotInstalledTitle': '未安装 Ollama',
      'startup.ollamaNotInstalledDesc': '要使用 LocalMind，您需要先安装 Ollama。它是一个免费的本地 AI 引擎。',
      'startup.startOllama': '启动 Ollama',
      'startup.installOllama': '安装 Ollama',
      'startup.goToSettings': '转到设置',
      'startup.continueAnyway': '继续不使用 Ollama',
      'startup.startingOllama': '正在启动 Ollama...',
      
      // 欢迎屏幕
      'welcome.title': '欢迎使用 LocalMind',
      'welcome.subtitle': '您的完全本地人工智能助手',
      'welcome.aiChatTitle': '高级 AI 聊天',
      'welcome.aiChatDesc': '与最先进的 AI 模型如 Llama、Mistral 等聊天，全部在您的计算机上本地运行。',
      'welcome.offlineTitle': '离线工作',
      'welcome.offlineDesc': '所有人工智能都在本地运行。您的对话永远不会离开您的设备，确保完全隐私。',
      'welcome.organizeTitle': '整理您的对话',
      'welcome.organizeDesc': '创建自定义文件夹，按项目、主题或任何您需要的类别来组织您的聊天。',
      'welcome.privacyTitle': '完全隐私',
      'welcome.privacyDesc': '无外部服务器，无跟踪，无数据共享。您的信息保持完全私密和安全。',
      'welcome.multilangTitle': '多语言',
      'welcome.multilangDesc': '界面支持西班牙语、英语、葡萄牙语、法语、德语、中文和日语，面向全球用户。',
      'welcome.setupTitle': '即将完成！',
      'welcome.setupDesc': '我们只需要知道您的姓名来个性化您的体验',
      'welcome.nameLabel': '您的姓名',
      'welcome.namePlaceholder': '例如：张小明',
      'welcome.dontShowAgain': '不再显示此欢迎屏幕',
      'welcome.previous': '上一步',
      'welcome.next': '下一步',
      'welcome.skip': '跳过',
      'welcome.getStarted': '开始使用！',
      'welcome.settingUp': '设置中...',      'models.size': '大小',
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
      'common.close': '关闭',
      'common.back': '返回',
      'common.continue': '继续',
      
      // 使用条款
      'terms.title': '使用条款',
      'terms.fullTitle': '使用条款和条件',
      'terms.lastUpdate': '最后更新',
      'terms.footer.thanks': '感谢您使用LocalMind',
      
      // 第一条
      'terms.section1.title': '条款的接受',
      'terms.section1.content': '通过下载、安装或使用LocalMind（以下简称"应用程序"），用户明确同意这些使用条款和条件。如果不同意其中任何一条，必须停止使用该应用程序。',
      
      // 第二条
      'terms.section2.title': '服务描述',
      'terms.section2.content1': 'LocalMind是一个桌面应用程序，允许与在用户设备上本地运行的人工智能模型进行交互，包括与Ollama兼容的模型。',
      'terms.section2.content2': '应用程序在本地运行，不会向开发者运营的外部服务器发送信息。',
      
      // 第三条
      'terms.section3.title': '本地数据存储',
      'terms.section3.intro': '应用程序允许本地存储用户生成的信息，包括但不限于：',
      'terms.section3.data1': '与人工智能模型的对话',
      'terms.section3.data2': '用户为此类对话定义的名称或标题',
      'terms.section3.storage': '这些数据通过本地数据库（SQLite）专门存储在用户的设备上。',
      'terms.section3.developer': '开发者：',
      'terms.section3.no1': '不访问这些数据',
      'terms.section3.no2': '不收集或传输信息到外部服务器',
      'terms.section3.no3': '不与第三方共享信息',
      'terms.section3.responsibility': '这些数据的管理、备份和删除完全由用户负责。',
      
      // 第四条
      'terms.section4.title': '允许的使用',
      'terms.section4.intro': '用户承诺仅将应用程序用于合法、道德和正当的目的，例如：',
      'terms.section4.use1': '个人生产力',
      'terms.section4.use2': '编程辅助',
      'terms.section4.use3': '写作和文本分析',
      'terms.section4.use4': '研究和学习',
      'terms.section4.use5': '创造力和人工智能的一般使用',
      
      // 第五条
      'terms.section5.title': '禁止的使用',
      'terms.section5.intro': '严格禁止将应用程序用于：',
      'terms.section5.prohibited1': '非法或不当活动',
      'terms.section5.prohibited2': '生成或促进恶意软件、欺诈、诈骗或钓鱼',
      'terms.section5.prohibited3': '侵犯版权、隐私或知识产权',
      'terms.section5.prohibited4': '制作、分发或推广非法内容',
      'terms.section5.prohibited5': '任何违反地方、国家或国际法律的使用',
      'terms.section5.responsibility': '用户对其生成的内容和对应用程序的使用承担全部责任。',
      
      // 第六条
      'terms.section6.title': '用户责任',
      'terms.section6.intro': '用户承认并接受：',
      'terms.section6.responsibility1': '在应用程序内生成、存储或管理的所有内容完全由其负责。',
      'terms.section6.responsibility2': 'LocalMind的开发者不控制、监督或审核本地生成或存储的内容。',
      'terms.section6.responsibility3': '人工智能模型的使用和对其结果的解释完全取决于用户。',
      
      // 第七条
      'terms.section7.title': '免责声明',
      'terms.section7.intro': '应用程序按"现状"提供，不提供任何形式的保证。',
      'terms.section7.notResponsible': '开发者不对以下情况负责：',
      'terms.section7.disclaimer1': '使用应用程序引起的直接或间接损害',
      'terms.section7.disclaimer2': '本地存储数据的丢失、损坏或删除',
      'terms.section7.disclaimer3': '系统故障、AI模型错误或错误结果',
      'terms.section7.disclaimer4': '用户的不当、非法或未经授权的使用',
      'terms.section7.disclaimer5': '用户基于AI生成内容做出的决定',
      
      // 第八条
      'terms.section8.title': '人工智能和限制',
      'terms.section8.intro': '用户理解并接受：',
      'terms.section8.limitation1': '人工智能模型可能生成不正确、不完整或不准确的信息。',
      'terms.section8.limitation2': '生成的内容不构成法律、医疗、财务或专业建议。',
      'terms.section8.limitation3': '用户必须独立验证任何相关信息。',
      
      // 第九条
      'terms.section9.title': '隐私',
      'terms.section9.privacy1': 'LocalMind尊重用户隐私。',
      'terms.section9.privacy2': '数据仅在用户设备上本地存储。',
      'terms.section9.privacy3': '开发者不收集个人信息或生成的内容。',
      'terms.section9.privacy4': '不会自动向外部服务器传输数据。',
      
      // 第十条
      'terms.section10.title': '知识产权',
      'terms.section10.ownership': '应用程序、其名称、标志和源代码（第三方库除外）属于LocalMind开发者所有。',
      'terms.section10.rights': '使用应用程序不授予用户对其任何知识产权。',
      
      // 第十一条
      'terms.section11.title': '修改',
      'terms.section11.rights': '开发者保留随时修改这些使用条款和条件的权利。',
      'terms.section11.effective': '修改将在发布或纳入应用程序未来版本时生效。',
      
      // 第十二条
      'terms.section12.title': '终止',
      'terms.section12.suspension': '如果用户违反这些条款，开发者可以暂停或限制应用程序的使用。',
      'terms.section12.uninstall': '用户可以通过卸载随时停止使用应用程序。',
      
      // 第十三条
      'terms.section13.title': '适用法律',
      'terms.section13.law': '这些使用条款和条件受智利共和国法律管辖。',
      'terms.section13.jurisdiction': '任何争议将提交给该国的主管法院。',
      
      // 第十四条
      'terms.section14.title': '联系',
      'terms.section14.contact': '对于与这些条款相关的咨询，用户可以通过LocalMind的官方渠道联系开发者。',
      
      // 无模型对话框
      'noModels.title': '无AI模型',
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
      'settings.viewTerms': '利用規約を表示',
      
      // Terminal
      'settings.terminal': 'ターミナル',
      'settings.terminalDesc': 'システムコマンド用の統合ターミナル',
      'settings.showTerminal': 'ターミナルを表示',
      'settings.hideTerminal': 'ターミナルを非表示',
      
      // Ollama
      'settings.stopOllama': 'Ollama を停止',
      'settings.stopOllamaDesc': 'Ollama が実行されている場合はサービスを停止します',
      'settings.stopOllamaBtn': 'Ollama を停止',
      
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
      'models.exploreModels': 'その他のモデルを探索',
      'models.showLess': '少なく表示',
      'models.additionalModels': '追加モデル',
      'models.browseAllModels': 'Ollamaで全モデルを閲覧',
      'models.downloadModel': 'ダウンロード',
      'models.deleteModel': 'モデルを削除',
      'models.downloadingModel': 'ダウンロード中...',
      'models.downloadError': 'ダウンロードエラー、後でもう一度お試しください',
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
      
      // Ollama 起動モーダル
      'startup.ollamaRequired': 'Ollama 必須',
      'startup.ollamaNotRunningTitle': 'Ollama が動作していません',
      'startup.ollamaNotRunningDesc': 'LocalMind を使用するには、Ollama が動作している必要があります。ここから自動的に開始できます。',
      'startup.ollamaNotInstalledTitle': 'Ollama がインストールされていません',
      'startup.ollamaNotInstalledDesc': 'LocalMind を使用するには、まず Ollama をインストールする必要があります。これは無料のローカル AI エンジンです。',
      'startup.startOllama': 'Ollama を開始',
      'startup.installOllama': 'Ollama をインストール',
      'startup.goToSettings': '設定に移動',
      'startup.continueAnyway': 'Ollama なしで続行',
      'startup.startingOllama': 'Ollama を開始中...',
      
      // ウェルカム画面
      'welcome.title': 'LocalMind へようこそ',
      'welcome.subtitle': '完全にローカルな人工知能アシスタント',
      'welcome.aiChatTitle': '高度な AI チャット',
      'welcome.aiChatDesc': 'Llama、Mistral など最先端の AI モデルとチャットしながら、すべてをコンピューター上でローカルに実行します。',
      'welcome.offlineTitle': 'オフラインで動作',
      'welcome.offlineDesc': 'すべての人工知能がローカルで動作します。会話がデバイスから外に出ることはなく、完全なプライバシーを保証します。',
      'welcome.organizeTitle': '会話を整理',
      'welcome.organizeDesc': 'プロジェクト、トピック、または必要な任意のカテゴリでチャットを整理するためのカスタムフォルダを作成します。',
      'welcome.privacyTitle': '完全なプライバシー',
      'welcome.privacyDesc': '外部サーバーなし、トラッキングなし、データ共有なし。あなたの情報は完全にプライベートで安全に保たれます。',
      'welcome.multilangTitle': '多言語',
      'welcome.multilangDesc': '世界中のユーザー向けにスペイン語、英語、ポルトガル語、フランス語、ドイツ語、中国語、日本語でインターフェースが利用可能です。',
      'welcome.setupTitle': 'もうすぐ完了！',
      'welcome.setupDesc': 'あなたの体験をパーソナライズするためにお名前を教えてください',
      'welcome.nameLabel': 'お名前',
      'welcome.namePlaceholder': '例：田中太郎',
      'welcome.dontShowAgain': 'このウェルカム画面を再度表示しない',
      'welcome.previous': '前へ',
      'welcome.next': '次へ',
      'welcome.skip': 'スキップ',
      'welcome.getStarted': '開始！',
      'welcome.settingUp': '設定中...',
      
      // 共通
      'common.user': 'ユーザー',
      'common.cancel': 'キャンセル',
      'common.save': '保存',
      'common.delete': '削除',
      'common.edit': '編集',
      'common.close': '閉じる',
      'common.back': '戻る',
      'common.continue': '続行',
      
      // 利用規約
      'terms.title': '利用規約',
      'terms.fullTitle': '利用規約および使用条件',
      'terms.lastUpdate': '最終更新',
      'terms.footer.thanks': 'LocalMindをご利用いただきありがとうございます',
      
      // 第1条
      'terms.section1.title': '規約の同意',
      'terms.section1.content': 'LocalMind（以下「アプリケーション」）をダウンロード、インストール、または使用することにより、ユーザーはこれらの利用規約に明示的に同意するものとします。いずれかに同意しない場合は、アプリケーションの使用を控えなければなりません。',
      
      // 第2条
      'terms.section2.title': 'サービスの説明',
      'terms.section2.content1': 'LocalMindは、Ollamaと互換性のあるモデルを含む、ユーザーのデバイス上でローカルに実行される人工知能モデルとのやり取りを可能にするデスクトップアプリケーションです。',
      'terms.section2.content2': 'アプリケーションは、開発者が運営する外部サーバーに情報を送信することなく、ローカルで動作します。',
      
      // 第3条
      'terms.section3.title': 'ローカルデータストレージ',
      'terms.section3.intro': 'アプリケーションは、以下を含むがこれらに限定されない、ユーザー生成情報のローカルストレージを可能にします：',
      'terms.section3.data1': '人工知能モデルとの会話',
      'terms.section3.data2': 'そのような会話に対してユーザーが定義した名前またはタイトル',
      'terms.section3.storage': 'これらのデータは、ローカルデータベース（SQLite）を通じてユーザーのデバイス上に専ら保存されます。',
      'terms.section3.developer': '開発者は：',
      'terms.section3.no1': 'そのようなデータにアクセスしません',
      'terms.section3.no2': '外部サーバーに情報を収集または送信しません',
      'terms.section3.no3': '第三者と情報を共有しません',
      'terms.section3.responsibility': 'これらのデータの管理、バックアップ、削除は、ユーザーの排他的責任です。',
      
      // 第4条
      'terms.section4.title': '許可された使用',
      'terms.section4.intro': 'ユーザーは、以下のような合法、倫理的、正当な目的でのみアプリケーションを使用することを約束します：',
      'terms.section4.use1': '個人の生産性',
      'terms.section4.use2': 'プログラミング支援',
      'terms.section4.use3': '文章作成とテキスト分析',
      'terms.section4.use4': '研究と学習',
      'terms.section4.use5': '創造性と人工知能の一般的な使用',
      
      // 第5条
      'terms.section5.title': '禁止された使用',
      'terms.section5.intro': '以下の目的でアプリケーションを使用することは厳格に禁止されています：',
      'terms.section5.prohibited1': '違法または不正な活動',
      'terms.section5.prohibited2': 'マルウェア、詐欺、詐取、またはフィッシングの生成または促進',
      'terms.section5.prohibited3': '著作権、プライバシー、または知的財産権の侵害',
      'terms.section5.prohibited4': '違法コンテンツの制作、配布、または宣伝',
      'terms.section5.prohibited5': '地域、国内、または国際法に違反する使用',
      'terms.section5.responsibility': 'ユーザーは、生成するコンテンツとアプリケーションの使用について、唯一の責任を負います。',
      
      // 第6条
      'terms.section6.title': 'ユーザーの責任',
      'terms.section6.intro': 'ユーザーは以下を認識し、同意します：',
      'terms.section6.responsibility1': 'アプリケーション内で生成、保存、または管理されるすべてのコンテンツは、その排他的責任です。',
      'terms.section6.responsibility2': 'LocalMindの開発者は、ローカルで生成または保存されたコンテンツを制御、監督、またはモデレートしません。',
      'terms.section6.responsibility3': '人工知能モデルの使用とその結果の解釈は、ユーザーにのみ依存します。',
      
      // 第7条
      'terms.section7.title': '責任の除外',
      'terms.section7.intro': 'アプリケーションは「現状のまま」提供され、いかなる種類の保証もありません。',
      'terms.section7.notResponsible': '開発者は以下について責任を負いません：',
      'terms.section7.disclaimer1': 'アプリケーションの使用から生じる直接的または間接的な損害',
      'terms.section7.disclaimer2': 'ローカルに保存されたデータの損失、破損、または削除',
      'terms.section7.disclaimer3': 'システムの故障、AIモデルのエラー、または誤った結果',
      'terms.section7.disclaimer4': 'ユーザーによる不適切、違法、または無許可の使用',
      'terms.section7.disclaimer5': 'AI生成コンテンツに基づいてユーザーが行った決定',
      
      // 第8条
      'terms.section8.title': '人工知能と制限',
      'terms.section8.intro': 'ユーザーは以下を理解し、同意します：',
      'terms.section8.limitation1': '人工知能モデルは、不正確、不完全、または不正確な情報を生成する可能性があります。',
      'terms.section8.limitation2': '生成されたコンテンツは、法的、医学的、財務的、または専門的な助言を構成しません。',
      'terms.section8.limitation3': 'ユーザーは、関連する情報を独立して検証しなければなりません。',
      
      // 第9条
      'terms.section9.title': 'プライバシー',
      'terms.section9.privacy1': 'LocalMindはユーザーのプライバシーを尊重します。',
      'terms.section9.privacy2': 'データはユーザーのデバイス上にのみローカルに保存されます。',
      'terms.section9.privacy3': '開発者は個人情報や生成されたコンテンツを収集しません。',
      'terms.section9.privacy4': '外部サーバーへのデータの自動送信はありません。',
      
      // 第10条
      'terms.section10.title': '知的財産',
      'terms.section10.ownership': 'アプリケーション、その名前、ロゴ、およびソースコード（サードパーティライブラリを除く）は、LocalMind開発者の所有物です。',
      'terms.section10.rights': 'アプリケーションの使用は、ユーザーにその知的財産権を付与しません。',
      
      // 第11条
      'terms.section11.title': '変更',
      'terms.section11.rights': '開発者は、これらの利用規約をいつでも変更する権利を留保します。',
      'terms.section11.effective': '変更は、公開またはアプリケーションの将来のバージョンへの組み込みから有効になります。',
      
      // 第12条
      'terms.section12.title': '終了',
      'terms.section12.suspension': 'ユーザーがこれらの規約に違反した場合、開発者はアプリケーションの使用を停止または制限することができます。',
      'terms.section12.uninstall': 'ユーザーは、アンインストールすることでいつでもアプリケーションの使用を停止できます。',
      
      // 第13条
      'terms.section13.title': '適用法',
      'terms.section13.law': 'これらの利用規約は、チリ共和国の法律に準拠します。',
      'terms.section13.jurisdiction': 'いかなる紛争も、当該国の管轄裁判所に提出されます。',
      
      // 第14条
      'terms.section14.title': '連絡先',
      'terms.section14.contact': 'これらの規約に関するお問い合わせについては、ユーザーはLocalMindの公式チャネルを通じて開発者に連絡することができます。',
      
      // モデルなしのモーダル
      'noModels.title': 'AIモデルなし',
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