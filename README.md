# PDF Annotator - Full-stack (React + Node.js + MongoDB)

This repository is a scaffold for a PDF annotator application:
- Users can register/login (JWT).
- Upload PDF files (stored on server local filesystem).
- View PDFs in the browser and highlight text selections.
- Highlights are saved to MongoDB with page number, selected text and bounding rects (normalized).
- Each PDF is tracked using a UUID.

This ZIP contains two folders: `server/` and `client/`.

## Quick setup (local)

### Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB (local) *or* MongoDB Atlas (connection string)
- Optional: nodemon for development

### Backend (server)
1. Open terminal:
```bash
cd server
npm install
```
2. Create `.env` (copy from `.env.example`) and set:
```
MONGO_URI=mongodb://localhost:27017/pdf-annotator
JWT_SECRET=replace_with_a_secret
PORT=5000
```
3. Start server:
```bash
npm run dev   # if you have nodemon
# or
npm start
```
Server listens on PORT (default 5000). Uploads are saved to `server/uploads`.

### Frontend (client)
1. Open another terminal:
```bash
cd client
npm install
```
2. Start client:
```bash
npm start
```
The React app runs on http://localhost:3000 and talks to the backend at http://localhost:5000/api by default. To change API URL, set `REACT_APP_API_URL` environment variable.

## Notes & Implementation details
- Backend uses Express, Mongoose, Multer (for file upload), JWT for auth.
- PDF viewer uses `react-pdf` (which depends on `pdfjs-dist`) for rendering PDF pages.
- Highlighting approach:
  - When user selects text on a rendered page, we capture the selection `Range` client rects.
  - Rects are normalized to the page's bounding box (x,y,w,h in 0..1).
  - Highlights are persisted in MongoDB and re-rendered as positioned overlays when the PDF is opened again.
- Security:
  - This scaffold includes basic JWT-based auth. For production, add input validation, rate limiting, HTTPS, stronger CORS settings, and secure cookie/session handling.

## What to do next (recommended)
- Test upload and highlighting with simple PDFs.
- Improve the viewer overlay sync (the current scaffold provides the core idea and endpoint wiring).
- Add rename, edit highlight (notes) UI.
- Add search and export features if required.

Good luck! If you want, I can now:
- Walk you step-by-step through running this locally on your machine (commands and troubleshooting).
- Add more polished UI and complete overlay sync so highlights exactly match positions at different zoom levels.
