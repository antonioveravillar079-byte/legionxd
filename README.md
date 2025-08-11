# Nova Dark Legion - Sistema de Gestión de Clan

Sistema completo de gestión para el clan Nova Dark Legion de Roblox, con frontend en React y backend en Node.js con MySQL/MariaDB.

## 🚀 Características

- **Autenticación completa** con JWT
- **Sistema de solicitudes** con preguntas personalizables
- **Sorteos exclusivos** para miembros
- **Sistema de tickets** de soporte
- **Panel de administración** completo
- **Gestión de usuarios** (ban/unban/eliminar)
- **Base de datos MySQL/MariaDB**

## 📋 Requisitos Previos

- Node.js 18+ 
- MySQL 8.0+ o MariaDB 10.3+
- npm o yarn

## 🛠️ Instalación

### 1. Configurar la Base de Datos

```bash
# Conectar a MySQL/MariaDB
mysql -u root -p

# Ejecutar el script de creación de base de datos
source server/database/schema.sql
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del servidor
cd server

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales de base de datos
nano .env
```

Configurar las variables en `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=nova_dark_legion

PORT=3001
NODE_ENV=development

JWT_SECRET=tu_clave_secreta_jwt_muy_segura
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

### 3. Configurar el Frontend

```bash
# Volver al directorio raíz
cd ..

# Copiar archivo de configuración del frontend
cp .env.example .env

# Editar .env del frontend
nano .env
```

Configurar las variables en `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

### 4. Instalar dependencias del frontend

```bash
npm install
```

## 🚀 Ejecutar la Aplicación

### Desarrollo

```bash
# Terminal 1: Ejecutar el backend
cd server
npm run dev

# Terminal 2: Ejecutar el frontend
npm run dev
```

### Producción

```bash
# Construir el frontend
npm run build

# Construir el backend
cd server
npm run build

# Ejecutar en producción
npm start
```

## 📊 Estructura de la Base de Datos

La base de datos incluye las siguientes tablas:

- **users**: Información de usuarios y administradores
- **questions**: Preguntas personalizables para solicitudes
- **applications**: Solicitudes de ingreso al clan
- **raffles**: Sorteos exclusivos para miembros
- **tickets**: Sistema de soporte y tickets
- **ticket_responses**: Respuestas a los tickets

## 🔐 Usuario Administrador por Defecto

El sistema crea automáticamente un usuario administrador:

- **Email**: admin@novalegion.pro
- **Contraseña**: admin123
- **Usuario**: AdminLegion

**⚠️ IMPORTANTE**: Cambiar esta contraseña inmediatamente en producción.

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (admin)
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/:id/ban` - Banear usuario (admin)
- `PUT /api/users/:id/unban` - Desbanear usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### Preguntas
- `GET /api/questions` - Obtener todas las preguntas
- `POST /api/questions` - Crear pregunta (admin)
- `PUT /api/questions/:id` - Actualizar pregunta (admin)
- `DELETE /api/questions/:id` - Eliminar pregunta (admin)

### Aplicaciones
- `GET /api/applications` - Obtener todas las aplicaciones (admin)
- `GET /api/applications/my-application` - Obtener mi aplicación
- `POST /api/applications` - Crear aplicación
- `PUT /api/applications/:id/status` - Actualizar estado (admin)

### Sorteos
- `GET /api/raffles` - Obtener todos los sorteos
- `POST /api/raffles` - Crear sorteo (admin)
- `PUT /api/raffles/:id` - Actualizar sorteo (admin)
- `DELETE /api/raffles/:id` - Eliminar sorteo (admin)
- `POST /api/raffles/:id/join` - Unirse a sorteo
- `POST /api/raffles/:id/draw-winner` - Sortear ganador (admin)

### Tickets
- `GET /api/tickets/my-tickets` - Obtener mis tickets
- `GET /api/tickets` - Obtener todos los tickets (admin)
- `POST /api/tickets` - Crear ticket
- `POST /api/tickets/:id/responses` - Agregar respuesta
- `PUT /api/tickets/:id/close` - Cerrar ticket (admin)

## 🔧 Comandos Útiles

```bash
# Verificar salud de la API
curl http://localhost:3001/api/health

# Reiniciar base de datos (¡CUIDADO! Elimina todos los datos)
mysql -u root -p nova_dark_legion < server/database/schema.sql

# Ver logs del servidor
cd server && npm run dev

# Construir para producción
npm run build
cd server && npm run build
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT con expiración
- Validación de entrada en frontend y backend
- Protección CORS configurada
- Sanitización de datos SQL

## 📝 Notas de Desarrollo

- El frontend usa React con TypeScript y Tailwind CSS
- El backend usa Express.js con TypeScript
- Base de datos MySQL/MariaDB con pool de conexiones
- Sistema de middleware para autenticación y autorización
- Manejo de errores centralizado

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:

1. Verifica que MySQL/MariaDB esté ejecutándose
2. Confirma que las credenciales en `.env` sean correctas
3. Revisa los logs del servidor para errores específicos
4. Asegúrate de que los puertos 3001 y 5173 estén disponibles

Para más ayuda, abre un issue en el repositorio.