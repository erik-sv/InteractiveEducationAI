# HeyGen Interactive Avatar NextJS Demo

![HeyGen Interactive Avatar NextJS Demo Screenshot](./public/demo.png)

This is a sample project and was bootstrapped using [NextJS](https://nextjs.org/).
Feel free to play around with the existing code and please leave any feedback for the SDK [here](https://github.com/HeyGen-Official/StreamingAvatarSDK/discussions).

## Getting Started FAQ

### Setting up the demo

1. Clone this repo

2. Navigate to the repo folder in your terminal

3. Run `npm install` (assuming you have npm installed. If not, please follow these instructions: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)

4. Enter your HeyGen Enterprise API Token or Trial Token in the `.env` file. Replace `HEYGEN_API_KEY` with your API key. This will allow the Client app to generate secure Access Tokens with which to create interactive sessions.

   You can retrieve either the API Key or Trial Token by logging in to HeyGen and navigating to this page in your settings: [https://app.heygen.com/settings?nav=API]. NOTE: use the trial token if you don't have an enterprise API token yet.

5. (Optional) If you would like to use the OpenAI features, enter your OpenAI Api Key in the `.env` file.

6. Run `npm run dev`

### Difference between Trial Token and Enterprise API Token

The HeyGen Trial Token is available to all users, not just Enterprise users, and allows for testing of the Interactive Avatar API, as well as other HeyGen API endpoints.

Each Trial Token is limited to 3 concurrent interactive sessions. However, every interactive session you create with the Trial Token is free of charge, no matter how many tasks are sent to the avatar. Please note that interactive sessions will automatically close after 10 minutes of no tasks sent.

If you do not 'close' the interactive sessions and try to open more than 3, you will encounter errors including stuttering and freezing of the Interactive Avatar. Please endeavor to only have 3 sessions open at any time while you are testing the Interactive Avatar API with your Trial Token.

### Starting sessions

NOTE: Make sure you have enter your token into the `.env` file and run `npm run dev`.

To start your 'session' with a Interactive Avatar, first click the 'start' button. If your HeyGen API key is entered into the Server's .env file, then you should see our demo Interactive Avatar (Monica!) appear.

After you see Monica appear on the screen, you can enter text into the input labeled 'Repeat', and then hit Enter. The Interactive Avatar will say the text you enter.

If you want to see a different Avatar or try a different voice, you can close the session and enter the IDs and then 'start' the session again. Please see below for information on where to retrieve different Avatar and voice IDs that you can use.

### Which Avatars can I use with this project?

By default, there are several Public Avatars that can be used in Interactive Avatar. (AKA Interactive Avatars.) You can find the Avatar IDs for these Public Avatars by navigating to [app.heygen.com/interactive-avatar](https://app.heygen.com/interactive-avatar) and clicking 'Select Avatar' and copying the avatar id.

In order to use a private Avatar created under your own account in Interactive Avatar, it must be upgraded to be a Interactive Avatar. Only 1. Finetune Instant Avatars and 2. Studio Avatars are able to be upgraded to Interactive Avatars. This upgrade is a one-time fee and can be purchased by navigating to [app.heygen.com/interactive-avatar] and clicking 'Select Avatar'.

Please note that Photo Avatars are not compatible with Interactive Avatar and cannot be used.

### Where can I read more about enterprise-level usage of the Interactive Avatar API?

Please read our Interactive Avatar 101 article for more information on pricing and how to increase your concurrent session limit: https://help.heygen.com/en/articles/9182113-interactive-avatar-101-your-ultimate-guide

## Overview

An advanced educational platform built with Next.js that leverages HeyGen's Interactive Avatar technology to create engaging, interactive learning experiences. This project follows strict development guidelines ensuring consistency, quality, and security while maintaining a mobile-first approach.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Authentication**: JWT
- **API Integration**: HeyGen Interactive Avatar API

## Project Structure

```
/
├── app/                # Next.js app directory
├── components/         # React components
│   ├── ui/            # Shadcn/UI components
│   └── shared/        # Shared components
├── lib/               # Third-party library configs
├── styles/            # Global styles and Tailwind
├── utils/             # Utility functions
├── public/            # Static files
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- HeyGen Enterprise API Token or Trial Token
- (Optional) OpenAI API Key

### Installation

1. Clone this repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
   - Copy `.env.example` to `.env.local`
   - Add your HeyGen API Token
   - (Optional) Add OpenAI API Key

4. Start development server
```bash
npm run dev
```

### Available Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "type-check": "tsc --noEmit"
}
```

## HeyGen Interactive Avatar Integration

### Token Types

#### Trial Token
- Available to all users
- Limited to 3 concurrent interactive sessions
- Sessions auto-close after 10 minutes of inactivity
- Free of charge for testing

#### Enterprise API Token
- Full access to Interactive Avatar API
- No concurrent session limits
- Production-ready usage

### Starting an Interactive Session

1. Ensure your API token is configured in `.env.local`
2. Start the development server
3. Click the 'Start' button to initialize Monica (demo avatar)
4. Use the 'Repeat' input field to interact

### Important Notes
- Maximum 3 concurrent sessions with Trial Token
- Close unused sessions to prevent performance issues
- Monitor session activity to avoid auto-closure

## API Standards

### Response Format

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string,
    "details": object | null
  } | null
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Mobile Responsiveness

- Mobile-first design approach
- Responsive breakpoints:
  - sm: 640px (Mobile landscape)
  - md: 768px (Tablets)
  - lg: 1024px (Laptops)
  - xl: 1280px (Desktops)
  - 2xl: 1536px (Large screens)

## Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting any changes.

## Security

- All inputs are sanitized
- Secure password hashing implemented
- Rate limiting on API endpoints
- Proper handling of sensitive data
- Regular security audits

## License

This project is licensed under the terms of the license included in the repository.

## Support

For HeyGen API support, visit: [https://app.heygen.com/settings?nav=API]

For project-specific issues, please create an issue in the repository.

---

## PRD: Next.js Startup & Runtime Error Troubleshooting (2025-05-01)

### Objective
Troubleshoot and resolve all blocking errors preventing the Next.js app from running locally, ensuring a clean, maintainable, and reproducible dev environment.

### Tasklist
- [x] 1. **Port Conflict**: App tries to use port 3000, switches to 3001. Confirm no zombie processes or port conflicts.
- [x] 2. **MODULE_NOT_FOUND: 'next/dist/server/app-render/work-async-storage.external.js'**: Investigate and resolve missing Next.js internal module error.
- [x] 3. **Invalid Hook Call**: Resolve React/ReactDOM version mismatch or duplicate React issues.
- [x] 4. **Multiple React Copies**: Ensure only one copy of React is installed and used.
- [-] 5. **Check node_modules and .next**: Cleaned directories, but `npm install` failed. (`protobufjs` postinstall error: `node` not found, `EPERM` on cleanup).
- [-] 6. **Verify Node.js Installation & PATH**: Verified paths. Issue likely due to Conda/NVM/System path conflicts for subprocesses. Deactivated Conda.
- [-] 7. **Check NVM Status**: Run `nvm ls` to check for conflicts.
- [-] 8. **Attempt `conda install nodejs=18`**: Failed due to conflicts with core Conda dependencies in `base` environment.
- [-] 9. **Update Conda**: Failed, `base` environment appears inconsistent/corrupted (RemoveError on core dependencies).
- [-] 10. **Retry `conda install nodejs=18`**: Skipped due to `base` environment issues.
- [-] 11. **Create dedicated Conda environment**: Run `conda create -n interactive-ai python=3.11 -y` as `base` env is unstable.
- [-] 12. **Activate new environment**: `conda activate interactive-ai`.
- [-] 13. **Install Node.js in new environment**: `conda install nodejs=18 -c conda-forge -y`.
- [-] 14. **Re-attempt `npm install`**: Failed again within the new environment (`protobufjs` postinstall still cannot find `node`).
- [-] 15. **Verify `node` path in new env**: Skipped.
- [-] 16. **Inspect `$env:PATH` in new env**: Skipped.
- [-] 17. **(Alternative) Temporarily Simplify PATH**: Skipped - Host environment issues persist.
- [ ] 18. **Dockerize Application**: Create `Dockerfile` and `.dockerignore` to bypass host environment issues.
- [ ] 19. **Build Docker Image**: Run `docker build -t interactive-education-ai .`
- [ ] 20. **Run Docker Container**: Run `docker run -p 3000:3000 interactive-education-ai`
- [ ] 21. **Verify App in Docker**: Access `http://localhost:3000`
- [ ] 22. **Check for global vs local Next.js version conflicts**: (If Docker fails, reconsider)
- [ ] 23. **Verify package.json for correct versions of next, react, react-dom**: (If Docker fails, reconsider)
- [ ] 24. **Document all steps and mark as completed in this PRD.**

---

## Railway Docker Deployment & Persistent Transcriptions

### Overview
This project uses Docker Compose to orchestrate a Next.js app and an Nginx reverse proxy for subdomain routing. Cloudflare provides SSL for all subdomains, so all internal traffic is HTTP-only.

### Architecture
| Layer        | Protocol | SSL Cert Needed? | Notes                                             |
|--------------|----------|------------------|---------------------------------------------------|
| Cloudflare   | HTTPS    | Yes (managed)    | Covers all subdomains, user-facing SSL            |
| Nginx/Docker | HTTP     | No               | Proxies subdomains to app, no certs needed        |
| App (Next.js)| HTTP     | No               | Listens on 3000, receives proxied traffic         |

### Subdomain Routing
- `demos.advantageintegrationai.com/` → main page (`/`)
- `education.advantageintegrationai.com/` → `/education`
- `healthcare.advantageintegrationai.com/` → `/healthcare`

### Key Files
- `docker-compose.yml`: Orchestrates `web` (Next.js) and `nginx` services.
- `nginx/nginx.conf`: Nginx configuration for subdomain routing.

### Setup Steps
1. Ensure Cloudflare proxy is enabled for all subdomains (SSL handled at edge).
2. Deploy to Railway using the provided `docker-compose.yml` and `nginx/nginx.conf`.
3. Only expose port 80 (HTTP) from Nginx; do **not** configure SSL in Docker/Nginx.
4. Point DNS for all subdomains to your Railway app via Cloudflare.

### Example Nginx Config (see `nginx/nginx.conf`)
```nginx
server {
    listen 80;
    server_name demos.advantageintegrationai.com;
    location / {
        proxy_pass http://web:3000;
        ...
    }
}
# ...other subdomains...
```

### Notes
- If you disable Cloudflare proxy, you must add SSL termination to Nginx.
- For local testing, you can run `docker-compose up` and access via `localhost`.

---

## 🧪 Local Subdomain Simulation

To test subdomain routing locally with Docker Compose and Nginx:

1. **Edit your hosts file:**
   - On Windows: `C:\Windows\System32\drivers\etc\hosts`
   - On Mac/Linux: `/etc/hosts`
   - Add:
     ```
     127.0.0.1   demos.localtest.me
     127.0.0.1   education.localtest.me
     127.0.0.1   healthcare.localtest.me
     ```
2. **Ensure Nginx config includes these local domains** (see `nginx/nginx.conf`).
3. **Run locally:**
   ```sh
   docker-compose up --build
   ```
4. **Test in your browser:**
   - http://demos.localtest.me
   - http://education.localtest.me
   - http://healthcare.localtest.me

Each subdomain should route to the correct section of your app.

---

## DeepInfra ASR Integration

User speech is captured using MediaRecorder in the browser. When the user stops speaking, the audio is sent to `/api/transcribe-audio` as a `multipart/form-data` POST request. The backend saves the audio, calls DeepInfra's AutomaticSpeechRecognition API, and returns the transcript in a structured JSON response:

```
{
  "success": true,
  "transcription": "<transcribed text>",
  "audioPath": "<server path to audio file>"
}
```

If an error occurs, the response will be:

```
{
  "error": "Failed to process audio"
}
```

### API Endpoint: `/api/transcribe-audio`
- **Method:** POST
- **Body:** `multipart/form-data` with fields:
  - `audio`: Audio file (webm/mp3/wav)
  - `type`: String (e.g. "user")
  - `streamId`: String (unique session/stream identifier)
- **Returns:** Transcript and audio path, or error

### Feature Checklist
- [x] Dynamic audio playback integration
- [x] Gender filter for voices
- [x] User transcript generation with DeepInfra ASR

See full PRD in `docs/` for more details.

---

## Changelog

### [2025-05-01] Voice Browser API & UI Refactor
- /api/get-voices now returns { success, data: { voices: [...] }, error } for easier frontend integration.
- Voice Browser filter controls and voice cards are now modular components.
- Improved error handling and accessibility.

### [2025-05-01] API/Frontend Contract Update
- Updated API documentation to reflect new flat response shape for /api/get-voices.
- Marked Voice Browser filter refactor as complete in the PRD.

## API Reference

### GET /api/get-voices
### Response:
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "voice_id": "string",
        "language": "string",
        "gender": "string",
        "name": "string",
        "preview_audio": "string",
        "support_pause": true,
        "emotion_support": false,
        "support_interactive_avatar": false,
        "support_locale": false
      }
    ]
  },
  "error": null
}
```

## Product Requirements Doc (PRD)

- [x] Modularize filter controls and voice card components
- [x] Flatten API response for /api/get-voices
- [x] Update frontend fetch logic for new API shape
- [x] Add accessibility improvements to filter controls and results
- [ ] Add/expand tests for API and UI
- [ ] Finalize documentation and changelog

---

## Healthcare Page Group

### Overview
- A new page group `/healthcare` is available, modeled after the MBA group.
- Healthcare instructions are loaded from XML files in `app/ai_instructions/healthcare/`.
- Example names are formatted user-friendly (e.g., `memory_care_example_1.xml` → "Memory Care Example 1").
- The page is mobile-first and accessible.

### API Endpoints
- `GET /api/get-healthcare-instructions` — Lists available healthcare instruction XML files.
- `GET /api/get-healthcare-knowledge-base?file=FILENAME` — Returns the XML content for a selected file.

### Extensibility
- New XML files can be added to `app/ai_instructions/healthcare/` and will automatically appear in the UI.

---

## Completed Tasks
- [x] Healthcare page group created and styled
- [x] API endpoints for listing and fetching healthcare instructions
- [x] Standardized API response format
- [x] Modular, maintainable, and accessible implementation

## Next Steps
- Add more healthcare instruction XMLs as needed
- Expand test coverage
- Continue accessibility and UX improvements

---

## 🚀 Docker Compose + Nginx Deployment (Railway/Cloudflare)

### Overview
This project uses Docker Compose to orchestrate a Next.js app and an Nginx reverse proxy for subdomain routing. Cloudflare provides SSL for all subdomains, so all internal traffic is HTTP-only.

### Architecture
| Layer        | Protocol | SSL Cert Needed? | Notes                                             |
|--------------|----------|------------------|---------------------------------------------------|
| Cloudflare   | HTTPS    | Yes (managed)    | Covers all subdomains, user-facing SSL            |
| Nginx/Docker | HTTP     | No               | Proxies subdomains to app, no certs needed        |
| App (Next.js)| HTTP     | No               | Listens on 3000, receives proxied traffic         |

### Subdomain Routing
- `demos.advantageintegrationai.com/` → main page (`/`)
- `education.advantageintegrationai.com/` → `/education`
- `healthcare.advantageintegrationai.com/` → `/healthcare`

### Key Files
- `docker-compose.yml`: Orchestrates `web` (Next.js) and `nginx` services.
- `nginx/nginx.conf`: Nginx configuration for subdomain routing.

### Setup Steps
1. Ensure Cloudflare proxy is enabled for all subdomains (SSL handled at edge).
2. Deploy to Railway using the provided `docker-compose.yml` and `nginx/nginx.conf`.
3. Only expose port 80 (HTTP) from Nginx; do **not** configure SSL in Docker/Nginx.
4. Point DNS for all subdomains to your Railway app via Cloudflare.

### Example Nginx Config (see `nginx/nginx.conf`)
```nginx
server {
    listen 80;
    server_name demos.advantageintegrationai.com;
    location / {
        proxy_pass http://web:3000;
        ...
    }
}
# ...other subdomains...
```

### Notes
- If you disable Cloudflare proxy, you must add SSL termination to Nginx.
- For local testing, you can run `docker-compose up` and access via `localhost`.
