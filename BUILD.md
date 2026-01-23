# Scripts de Compilación - HelperCron

## Scripts disponibles para compilar la aplicación Electron:

### **Compilación para una plataforma específica:**

```bash
# Compilar solo para Windows
npm run dist:win

# Compilar solo para macOS  
npm run dist:mac

# Compilar solo para Linux
npm run dist:linux
```

### **Compilación para todas las plataformas:**

```bash
# Compilar para Windows, macOS y Linux
npm run dist:all
```

### **Compilación general:**

```bash
# Compilación general (detecta plataforma actual)
npm run dist
```

## **Formatos de salida por plataforma:**

### **Windows:**
- **NSIS Installer** (.exe) - Instalador ejecutable para Windows
- **Portable** (.exe) - Versión portable que no requiere instalación
- **Arquitectura:** x64 únicamente (evita problemas con rutas con espacios)

### **macOS:**
- **DMG** (.dmg) - Imagen de disco para macOS
- **ZIP** (.zip) - Archivo comprimido
- **Arquitecturas:** x64 (Intel) y arm64 (Apple Silicon)
- **⚠️ Nota:** Solo puede compilarse desde macOS

### **Linux:**
- **TAR.GZ** (.tar.gz) - Archivo comprimido multiplataforma
- **Arquitectura:** x64
- **Nota:** Se cambió de AppImage a TAR.GZ para evitar problemas de symlinks en Windows

## **Directorio de salida:**
Los archivos compilados se guardarán en el directorio `release/`

## **Soluciones implementadas:**

### **Problemas resueltos:**
1. **Main entry point corregido:** Cambiado de `electron/main.js` a `electron-dist/main.js`
2. **Campo author agregado:** Requerido por electron-builder
3. **Script postinstall añadido:** Maneja automáticamente las dependencias nativas
4. **Conflictos de tipos resueltos:** `skipLibCheck: true` en electron/tsconfig.json
5. **Arquitectura ia32 removida:** Evita problemas con rutas que contienen espacios
6. **electron-rebuild removido:** Ya incluido en electron-builder
7. **Linux: AppImage → TAR.GZ:** Evita problemas de symlinks al compilar desde Windows
8. **Iconos opcionales:** Removidas referencias a iconos inexistentes para evitar errores

### **Configuración optimizada:**
- Compilación automática de TypeScript de Electron antes del build
- Manejo automático de better-sqlite3 para compatibilidad nativa
- Configuración NSIS personalizada con instalador no-oneClick

## **Iconos opcionales:**
Para personalizar los iconos, coloca los siguientes archivos en el directorio `assets/`:

- `icon.ico` - Icono para Windows (256x256 o múltiples tamaños)
- `icon.icns` - Icono para macOS (múltiples tamaños)  
- `icon.png` - Icono para Linux (512x512 recomendado)

*Nota: Si no se proporcionan iconos, se usará el icono predeterminado de Electron.*

## **Requisitos:**
- Node.js instalado
- Dependencias instaladas (`npm install`)
- **Para Windows:** Compilación exitosa desde Windows ✅
- **Para Linux:** Compilación exitosa desde Windows ✅ (formato TAR.GZ)
- **Para macOS:** Solo puede compilarse desde macOS (limitación de Apple)
- Evitar rutas de proyecto con espacios en ia32 builds (limitación de node-gyp)

## **Estado actual de compilación desde Windows:**
- ✅ **Windows:** NSIS Installer + Portable funcionando
- ✅ **Linux:** TAR.GZ funcionando 
- ❌ **macOS:** Requiere compilación desde macOS (limitación del sistema)