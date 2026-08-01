# Puro Deporte - Frontend

Aplicación web pública y dashboard administrativo de **Puro Deporte**, desarrollada con [Next.js 16 (App Router)](https://nextjs.org), TypeScript y TailwindCSS.

---

## 🚀 Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno copiando `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🐳 Despliegue con Docker

El proyecto está configurado para compilación optimizada `standalone` en contenedores Docker.

### Construir y Levantar el Contenedor

1. Crear el archivo `.env` en el servidor basándote en `.env.example`:
   ```env
   NEXT_PUBLIC_API_URL=https://purodeporte.co/api
   ```

2. Construir la imagen y ejecutar el servicio:
   ```bash
   docker compose build
   docker compose up -d
   ```

3. El contenedor escuchará internamente en el puerto `3000` y se mapeará al puerto `3001` del host.

### 🌐 Arquitectura de Dominio y Reverse Proxy (Nginx)

Este proyecto se despliega en el mismo servidor VPS junto al backend (`puro-deportes-backend`). Ambos comparten el mismo dominio público (`https://purodeporte.co`) mediante **Nginx**:

- **Ruta Raíz (`/`)**: Enrutada por Nginx al frontend (puerto `3001` del host).
- **Ruta API (`/api/*`) y Archivos (`/uploads/*`)**: Enrutados por Nginx al backend (puerto `3000` del host).

> Para más detalles sobre la configuración de Nginx y SSL en el VPS, consulta el archivo `DEPLOY.md` en el repositorio del backend.
