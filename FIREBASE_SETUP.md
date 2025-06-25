# 🔥 Configuración de Firebase para ELMEC

## 1. Configurar proyecto en Firebase Console

### Paso 1: Crear/Configurar el proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto existente o crea uno nuevo
3. En el dashboard, haz clic en "⚙️ Configuración del proyecto"

### Paso 2: Agregar aplicación web
1. En "Tus aplicaciones", haz clic en "</> Web"
2. Registra tu app con nombre: "ELMEC Mobile App"
3. **NO marques** "También configurar Firebase Hosting"
4. Copia la configuración que aparece (la necesitarás en el paso 3)

## 2. Habilitar servicios de Firebase

### Authentication
1. Ve a "Authentication" → "Sign-in method"
2. Habilita **"Correo electrónico/contraseña"**
3. No habilites "Enlace de correo electrónico" por ahora

### Firestore Database
1. Ve a "Firestore Database" → "Crear base de datos"
2. Selecciona **"Empezar en modo de prueba"**
3. Elige una ubicación cercana (por ejemplo: us-central1)

### Realtime Database
1. Ve a "Realtime Database" → "Crear base de datos"
2. Selecciona **"Empezar en modo bloqueado"**
3. Elige la misma ubicación que Firestore

### Cloud Messaging (Push Notifications)
1. Ve a "Cloud Messaging"
2. Ve a "Configuración" → pestaña "Cloud Messaging"
3. En "Configuración web", genera un par de claves VAPID
4. Guarda la clave pública (la necesitarás)

### Analytics
1. Ve a "Analytics" → "Dashboard"
2. Si no está habilitado, sigue las instrucciones para habilitarlo

## 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz de tu proyecto con la configuración de tu proyecto Firebase:

```env
# Firebase Configuration (reemplaza con tus valores reales)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com/
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
EXPO_PUBLIC_FIREBASE_VAPID_KEY=tu-clave-vapid-publica

# API Configuration (mantén tu API existente si la sigues usando)
EXPO_PUBLIC_API_BASE_URL=https://api.elmec.com/api/v1

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
```

### ¿Dónde encontrar cada valor?

**En Firebase Console → Configuración del proyecto → General:**
- `API_KEY`: Clave de API web
- `AUTH_DOMAIN`: Dominio de autenticación
- `PROJECT_ID`: ID del proyecto
- `STORAGE_BUCKET`: Bucket de almacenamiento
- `MESSAGING_SENDER_ID`: ID del remitente
- `APP_ID`: ID de la aplicación

**En Firebase Console → Configuración del proyecto → Cloud Messaging:**
- `VAPID_KEY`: Clave pública de las claves web VAPID

**Para Realtime Database:**
- `DATABASE_URL`: Ve a Realtime Database, la URL aparece en la parte superior

**Para Analytics:**
- `MEASUREMENT_ID`: Ve a Analytics → Configuración → Flujos de datos

## 4. Configurar reglas de seguridad

### Firestore Security Rules
Ve a "Firestore Database" → "Reglas" y reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read all users (for directory)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Requests - customers can create, read their own; agents can read assigned
    match /requests/{requestId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && (
        resource.data.usuarioId == request.auth.uid ||
        resource.data.agenteId == request.auth.uid
      );
    }
    
    // Chat rooms - participants can read/write
    match /chatRooms/{roomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages - participants can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications - users can read their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Analytics - authenticated users can write
    match /analytics/{docId} {
      allow write: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules
Ve a "Realtime Database" → "Reglas" y reemplaza con:

```json
{
  "rules": {
    "presence": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "typing": {
      "$chatRoomId": {
        "$uid": {
          ".read": true,
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

## 5. Verificar instalación de dependencias

Las dependencias ya están agregadas al `package.json`. Ejecuta:

```bash
npm install
```

## 6. Probar la configuración

### Verificar configuración básica:
1. Inicia la aplicación: `npm run dev`
2. Ve a la página de registro/login
3. Intenta crear una cuenta nueva
4. Revisa Firebase Console para ver si el usuario se creó

### Verificar servicios:
- **Authentication**: ¿Se creó el usuario en la sección Authentication?
- **Firestore**: ¿Se creó el documento en la colección "users"?
- **Realtime Database**: ¿Aparece información de presencia?
- **Analytics**: ¿Se registran eventos en Analytics?

## 7. Migración de datos existentes (Opcional)

Si tienes datos en tu API actual que quieres migrar a Firebase:

```typescript
import MigrationService from './services/migrationService';

// Ejecutar migración completa
await MigrationService.runFullMigration();
```

## 8. Configuración para producción

### Para deployment:
1. Cambia las reglas de Firestore a modo producción
2. Configura dominios autorizados en Authentication → Settings
3. Actualiza las variables de entorno con valores de producción

### Variables de entorno de producción:
```env
EXPO_PUBLIC_ENVIRONMENT=production
# ... resto de variables con valores de producción
```

## 9. Solución de problemas comunes

### Error: "Firebase Configuration object is invalid"
- Verifica que todas las variables EXPO_PUBLIC_ estén definidas
- Revisa que no haya espacios extra en el archivo .env

### Error: "Auth domain is not authorized"
- Ve a Authentication → Settings → Authorized domains
- Agrega tu dominio de desarrollo/producción

### Error de permisos en Firestore
- Revisa las reglas de seguridad
- Asegúrate de que el usuario esté autenticado

### Push notifications no funcionan
- Verifica que tengas la clave VAPID configurada
- Revisa que los permisos de notificación estén habilitados

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación ELMEC estará completamente integrada con Firebase y tendrás:

✅ Autenticación en tiempo real  
✅ Base de datos sincronizada  
✅ Push notifications  
✅ Analytics automático  
✅ Sistema de presencia  
✅ Chat en tiempo real