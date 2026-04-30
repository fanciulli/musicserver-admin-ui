# musicserver-admin-ui

Web-based administration interface for **MusicServer**, built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

This UI allows you to monitor and manage the MusicServer instance: view logs, manage plugins, trigger library scans, and inspect system statistics through an intuitive dashboard.

> For the full project entry point, including backend setup and architecture documentation, refer to the main repository:
> **[https://github.com/fanciulli/musicserver](https://github.com/fanciulli/musicserver)**

---

## Requirements

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A running instance of MusicServer (see the main repository above)

---

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root and set the MusicServer backend URL:

```env
MUSICSERVER_API_BASE_URL=http://localhost:3000
```

Adjust the URL to match your local MusicServer instance.

### 3. Start the development server

```bash
npm run dev
```

The UI will be available at [http://localhost:3001](http://localhost:3001).

---

## Build for production

```bash
npm run build
npm run start
```

The production server runs on port **3001**.

---

## Docker

A `Dockerfile` is provided to build and run the application in a container:

```bash
docker build -t musicserver-admin-ui .
docker run -p 3001:3001 -e MUSICSERVER_API_BASE_URL=http://<BACKEND_IP>:<BACKEND_PORT> musicserver-admin-ui
```

The repository https://github.com/fanciulli/musicserver contains a Docker Compose file which easily allows you to run Music Server and its dependencies.
