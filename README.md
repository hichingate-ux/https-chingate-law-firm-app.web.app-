# Aplicación de Gestión Jurídica y Empresarial

Esta es una aplicación web de uso privado para la firma de abogados, desarrollada con Vite, React, TypeScript y Firebase. Está diseñada de manera corporativa y sobria, totalmente responsiva y en español, tal como fue solicitado.

## Estructura de Módulos Operativos:
La aplicación cuenta con las interfaces estructurales de los 12 ejes solicitados en la meta principal:
1. Configuración empresarial
2. Usuarios internos
3. Clientes
4. Asuntos (Casos)
5. Notas internas por cliente y por asunto
6. Documentos
7. Agenda
8. Facturación
9. Pagos y cartera (Incluido en módulo de Facturación/Invoices y Layout)
10. Inventario
11. Panel gerencial (Dashboard)
12. Búsqueda global (Ubicada en el Header General y Layout)

## Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18+ recomendada).

## Instrucciones para Ejecutar Localmente

Siga los pasos a continuación:

1. **Abra una terminal en la raíz de este proyecto.** (Ej. `/Users/isaacchingate/.gemini/antigravity/scratch/law-firm-app`)
2. Instale las dependencias del proyecto ejecutando:
   ```bash
   npm install
   ```
3. Ejecute el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Abra la ruta provista en su navegador (generalmente `http://localhost:5173`).


## Arquitectura de Firebase 

El proyecto cuenta con el patrón `DAO` (`src/services/db.ts`) el cual administra los CRUD a Firebase.
Para permitir que evalúes la interfaz sin configuraciones complejas, **el servicio DAO detecta si no has configurado las credenciales de Firebase**, y en dicho caso proveerá **Mock Data** local (datos de prueba pre-cargados para navegar todos los módulos libremente).

Para activarlo en modo producción:
1. Cree un proyecto real de Firebase (Auth habilitado, Cloud Firestore Modo Entorno/Producción).
2. Modifique `src/services/firebase.ts` colocando sus claves reales.
3. El Flag interno `USE_MOCKS` se apagará y se conectará de inmediato a la Nube.
4. Para inicializar la nube, llame a la función expuesta en `src/services/seed.ts` (puede importarla y ejecutarla desde la consola de su navegador web local durante el desarrollo: `import('./src/services/seed.ts').then(s => s.injectSeedData())`).

## Despliegue (Producción)
Se recomienda Firebase Hosting para desplegar el front.
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
