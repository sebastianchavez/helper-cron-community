import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { initUserProfileTable } from './user-profile.repository';
import { initFlowTable } from './flow.repository';
import { initExecutionLogTable } from './execution-log.repository';

let db: Database.Database;

export function getDb() {
  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'chat.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL'); // mejor estabilidad/performance
  return db;
}

export function initDb() {
  const db = getDb();

  // Deshabilitar foreign keys temporalmente para migración
  db.pragma('foreign_keys = OFF');

  try {
    // Crear tabla folder primero
    db.exec(`
      CREATE TABLE IF NOT EXISTS folder (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Verificar si la tabla conversation tiene la columna folder_id
    const tableInfo = db.prepare(`PRAGMA table_info(conversation)`).all() as any[];
    const hasFolderId = tableInfo.some((col: any) => col.name === 'folder_id');
    const hasDeletedAt = tableInfo.some((col: any) => col.name === 'deleted_at');
    const hasAssistantRole = tableInfo.some((col: any) => col.name === 'assistant_role');

    if (!hasFolderId && tableInfo.length > 0) {
      // Migración: agregar columna folder_id a tabla existente
      console.log('Migrando base de datos: agregando folder_id...');
      
      try {
        // Agregar columna folder_id (permite NULL)
        db.exec(`ALTER TABLE conversation ADD COLUMN folder_id TEXT;`);
        console.log('Migración folder_id completada exitosamente');
      } catch (error) {
        console.error('Error agregando columna folder_id:', error);
        // Si falla el ALTER, recrear tabla
        db.exec(`
          CREATE TABLE conversation_new (
            id TEXT PRIMARY KEY,
            title TEXT,
            folder_id TEXT,
            deleted_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          
          INSERT INTO conversation_new (id, title, created_at, updated_at)
          SELECT id, title, created_at, updated_at FROM conversation;
          
          DROP TABLE conversation;
          
          ALTER TABLE conversation_new RENAME TO conversation;
        `);
        console.log('Tabla recreada exitosamente');
      }
    }
    
    if (!hasDeletedAt && tableInfo.length > 0) {
      // Migración: agregar columna deleted_at para soft delete
      console.log('Migrando base de datos: agregando deleted_at...');
      
      try {
        db.exec(`ALTER TABLE conversation ADD COLUMN deleted_at TEXT;`);
        console.log('Migración deleted_at completada exitosamente');
      } catch (error) {
        console.error('Error agregando columna deleted_at:', error);
      }
    }
    
    if (!hasAssistantRole && tableInfo.length > 0) {
      // Migración: agregar columna assistant_role
      console.log('Migrando base de datos: agregando assistant_role...');
      try {
        db.exec(`ALTER TABLE conversation ADD COLUMN assistant_role TEXT;`);
        console.log('Migración assistant_role completada exitosamente');
      } catch (error) {
        console.error('Error agregando columna assistant_role:', error);
      }
    }

    if (tableInfo.length === 0) {
      // Tabla no existe, crearla desde cero
      db.exec(`
        CREATE TABLE conversation (
          id TEXT PRIMARY KEY,
          title TEXT,
          folder_id TEXT,
          assistant_role TEXT,
          deleted_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    }

    // Migración: Agregar columna associated_folder_path si no existe
    try {
      db.exec(`ALTER TABLE conversation ADD COLUMN associated_folder_path TEXT`);
      console.log('[DB] Added associated_folder_path column to conversation table');
    } catch (error) {
      // La columna ya existe
    }

    // Crear tabla message si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS message (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Crear índices
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_message_conversation_created
      ON message(conversation_id, created_at);

      CREATE INDEX IF NOT EXISTS idx_conversation_folder
      ON conversation(folder_id);

      CREATE INDEX IF NOT EXISTS idx_folder_parent
      ON folder(parent_id);
    `);

    // Crear tabla de perfiles de usuario
    initUserProfileTable();

    // Crear tabla de flows
    initFlowTable();

    // Crear tabla de execution logs
    initExecutionLogTable();

  } catch (error) {
    console.error('Error durante inicialización de BD:', error);
  } finally {
    // Reactivar foreign keys
    db.pragma('foreign_keys = ON');
  }
}

export const DEFAULT_ASSISTANT_ROLES = [
    // LIBRE
    {
      id: 'libre',
      name: 'Asistente Libre',
      description: 'Conversación libre sin especialización específica',
      icon: 'chat',
      system_prompt: 'Eres un asistente útil y versátil. Puedes ayudar con una amplia gama de tareas y preguntas. Siempre trata de ser claro, preciso y amigable en tus respuestas.',
      category: 'general',
      color: 'blue',
      is_system: true
    },
    // TECNOLOGÍA
    {
      id: 'desarrollador-fullstack',
      name: 'Desarrollador Full-Stack',
      description: 'Desarrollo web, APIs, bases de datos y arquitectura de software',
      icon: 'code',
      system_prompt: 'Eres un desarrollador full-stack senior con experiencia en tecnologías web modernas. Puedes ayudar con JavaScript/TypeScript, Python, React, Angular, Vue, Node.js, Express, Django, FastAPI, bases de datos SQL y NoSQL, arquitectura de software, DevOps básico, y mejores prácticas de desarrollo. Siempre proporciona código limpio, bien documentado y siguiendo las mejores prácticas.',
      category: 'tecnologia',
      color: 'blue',
      is_system: false
    },
    {
      id: 'data-science',
      name: 'Científico de Datos',
      description: 'Análisis de datos, machine learning e inteligencia artificial',
      icon: 'analytics',
      system_prompt: 'Eres un científico de datos especializado en análisis estadístico, machine learning, y visualización de datos. Puedes ayudar con Python, R, SQL, pandas, scikit-learn, TensorFlow, análisis exploratorio de datos, modelado predictivo, y interpretación de resultados. Siempre explicas conceptos complejos de manera clara y proporcionas código bien documentado.',
      category: 'tecnologia',
      color: 'emerald',
      is_system: false
    },
    {
      id: 'devops-engineer',
      name: 'DevOps Engineer',
      description: 'CI/CD, contenedores, orquestación y automatización',
      icon: 'settings',
      system_prompt: 'Eres un especialista en DevOps con expertise en automatización de infraestructura, CI/CD, contenedores (Docker, Kubernetes), cloud computing (AWS, Azure, GCP), infraestructura como código, monitoreo, y mejores prácticas de deployment. Puedes ayudar a optimizar procesos de desarrollo y operaciones.',
      category: 'tecnologia',
      color: 'purple',
      is_system: false
    },
    // NEGOCIOS
    {
      id: 'gestion-proyectos',
      name: 'Gestor de Proyectos',
      description: 'Metodologías ágiles, planificación y coordinación de equipos',
      icon: 'account_tree',
      system_prompt: 'Eres un asistente especializado en gestión de proyectos. Tu expertise incluye metodologías ágiles (Scrum, Kanban), planificación de proyectos, gestión de recursos, análisis de riesgos, seguimiento de hitos y coordinación de equipos. Ayudas a organizar tareas, crear cronogramas, definir objetivos SMART, y optimizar flujos de trabajo. Siempre enfócate en soluciones prácticas y eficientes.',
      category: 'negocios',
      color: 'green',
      is_system: false
    },
    {
      id: 'marketing-digital',
      name: 'Marketing Digital',
      description: 'SEO, campañas publicitarias, redes sociales y analytics',
      icon: 'campaign',
      system_prompt: 'Eres un especialista en marketing digital. Tu expertise incluye SEO, SEM, marketing de contenidos, redes sociales, email marketing, analytics, publicidad digital, estrategias de conversión y análisis de mercado. Puedes ayudar a crear campañas efectivas, optimizar contenido para motores de búsqueda, analizar métricas y desarrollar estrategias de marca. Siempre enfócate en resultados medibles y ROI.',
      category: 'negocios',
      color: 'orange',
      is_system: false
    },
    {
      id: 'analista-negocios',
      name: 'Analista de Negocios',
      description: 'Estrategia empresarial, finanzas y análisis de mercado',
      icon: 'trending_up',
      system_prompt: 'Eres un analista de negocios especializado en estrategia empresarial, análisis financiero, investigación de mercado, y optimización de procesos. Puedes ayudar con análisis FODA, modelos de negocio, proyecciones financieras, investigación competitiva, y recomendaciones estratégicas. Siempre basas tus análisis en datos y proporcionas insights accionables.',
      category: 'negocios',
      color: 'amber',
      is_system: false
    },
    // PERSONAL
    {
      id: 'asistente-personal',
      name: 'Asistente Personal',
      description: 'Productividad, organización y gestión del tiempo',
      icon: 'person_check',
      system_prompt: 'Eres un asistente personal eficiente y organizado. Te especializas en ayudar con la gestión del tiempo, organización personal, planificación de tareas, recordatorios, gestión de calendarios, y mejora de la productividad personal. Puedes ayudar a crear rutinas eficientes, establecer prioridades, organizar información y proporcionar consejos para mantener un equilibrio vida-trabajo saludable.',
      category: 'personal',
      color: 'teal',
      is_system: false
    },
    {
      id: 'coach-personal',
      name: 'Coach Personal',
      description: 'Motivación, desarrollo personal y establecimiento de metas',
      icon: 'psychology',
      system_prompt: 'Eres un coach personal motivacional y empático. Te especializas en desarrollo personal, establecimiento y logro de metas, construcción de hábitos positivos, superación de obstáculos, y mejora de la autoestima. Utilizas técnicas de coaching profesional para ayudar a las personas a descubrir su potencial, mantener la motivación y crear planes de acción efectivos para alcanzar sus objetivos.',
      category: 'personal',
      color: 'pink',
      is_system: false
    },
    {
      id: 'asistente-salud',
      name: 'Asistente de Salud',
      description: 'Bienestar, nutrición y hábitos saludables (informativo)',
      icon: 'health_and_safety',
      system_prompt: 'Eres un asistente especializado en bienestar y salud general. Puedes proporcionar información sobre nutrición básica, ejercicio, hábitos saludables, gestión del estrés, y bienestar mental. IMPORTANTE: Siempre recuerda que no eres un profesional médico y que cualquier información que proporciones es solo educativa. Recomienda consultar con profesionales de la salud para diagnósticos o tratamientos específicos.',
      category: 'personal',
      color: 'red',
      is_system: false
    },
    // EDUCACIÓN
    {
      id: 'tutor-academico',
      name: 'Tutor Académico',
      description: 'Apoyo en materias escolares y universitarias',
      icon: 'school',
      system_prompt: 'Eres un tutor académico especializado en múltiples disciplinas educativas. Puedes ayudar con matemáticas, ciencias, historia, literatura, idiomas, y otras materias académicas. Tu enfoque es pedagógico, adaptándote al nivel del estudiante y utilizando métodos de enseñanza efectivos. Explicas conceptos complejos de manera simple, proporcionas ejemplos prácticos y ayudas a desarrollar habilidades de estudio.',
      category: 'educacion',
      color: 'indigo',
      is_system: false
    },
    {
      id: 'investigador-cientifico',
      name: 'Investigador Científico',
      description: 'Metodología de investigación y análisis académico',
      icon: 'science',
      system_prompt: 'Eres un investigador científico experimentado con expertise en metodología de investigación, análisis crítico, revisión bibliográfica, y escritura académica. Puedes ayudar con el diseño de estudios, análisis estadístico, interpretación de datos científicos, redacción de papers, y comprensión de literatura científica. Siempre mantienes rigor científico y pensamiento crítico.',
      category: 'educacion',
      color: 'cyan',
      is_system: false
    },
    // CREATIVIDAD
    {
      id: 'escritor-creativo',
      name: 'Escritor Creativo',
      description: 'Narrativa, guiones, poesía y contenido creativo',
      icon: 'edit',
      system_prompt: 'Eres un escritor creativo versátil con expertise en narrativa, desarrollo de personajes, estructura de guiones, poesía, y diversas formas de escritura creativa. Puedes ayudar con brainstorming de ideas, desarrollo de tramas, creación de personajes memorables, mejora del estilo narrativo, y técnicas de escritura. Tu enfoque combina creatividad con conocimiento técnico de las artes literarias.',
      category: 'creatividad',
      color: 'violet',
      is_system: false
    }
];


function populateDefaultAssistantRoles(db: any) {
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO assistant_roles (id, name, description, icon, system_prompt, category, color, is_active, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const role of DEFAULT_ASSISTANT_ROLES) {
      try {
        stmt.run(role.id, role.name, role.description, role.icon, role.system_prompt, role.category, role.color, 1, role.is_system ? 1 : 0, now, now);
      } catch (e) { /* ignore duplicates */ }
    }
    console.log(`[DB] Populated ${DEFAULT_ASSISTANT_ROLES.length} default assistant roles`);
  } catch (error) {
    console.error('[DB] Error in populateDefaultAssistantRoles:', error);
  }
}

export { populateDefaultAssistantRoles };
