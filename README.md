# OBS Local Overlays

Aplicación local con `Node.js`, `Express`, `Socket.io` y `GSAP` para controlar un overlay en tiempo real.

Incluye:
- Vista de inicio para generar sesión por hash (`pass`)
- Vista `controller` para enviar mensaje, posición y tamaño de letra
- Vista `overlay` transparente para usar en OBS
- Descubrimiento mDNS (`overlays.local`)

## Requisitos

- Node.js 18+
- Yarn 1.x o 4.x

## Instalación

```bash
yarn install
```

## Ejecutar

Producción/local:

```bash
yarn start
```

Desarrollo (watch):

```bash
yarn dev
```

## Variables de entorno

- `PORT` (default: `3000`): puerto HTTP
- `BIND_HOST` (default: `0.0.0.0`): interfaz/IP para escuchar
- `MDNS_HOSTNAME` (default: `overlays.local`): hostname publicado por mDNS

Ejemplo:

```bash
PORT=3010 BIND_HOST=0.0.0.0 MDNS_HOSTNAME=overlays.local yarn start
```

Al iniciar, el servidor muestra:
- URL local
- URL por IP LAN
- URL por mDNS

## Flujo de uso

1. Abre `http://<host>:<port>/`
2. Si no existe `?pass=...`, pulsa **Generar hash**
3. Copia los enlaces:
- `overlay`: para OBS browser source
- `controller`: para controlar el mensaje
4. En `controller`:
- Escribe mensaje
- Ajusta tamaño de letra (`A-`, slider, `A+`)
- Mantén presionado `Arriba`, `Centro` o `Abajo` para mostrar
- Suelta el botón para ocultar

## Endpoints y vistas

- `/` inicio y generación de enlaces
- `/overlay?pass=<hash>` vista overlay
- `/controller?pass=<hash>` vista controlador
- `/api/hash` genera hash de sesión

## Estructura

```text
.
├── public/
│   ├── controller.html
│   ├── controller.js
│   ├── index.html
│   ├── index.js
│   ├── overlay.html
│   ├── overlay.js
│   └── styles.css
├── server.js
├── package.json
└── yarn.lock
```

## Notas de red

- `BIND_HOST=0.0.0.0` permite acceso desde la red local.
- Si `overlays.local` no resuelve en otros equipos, verifica soporte mDNS del cliente (Bonjour/Avahi).
