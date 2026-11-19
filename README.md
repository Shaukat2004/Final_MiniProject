# OncoLink

OncoLink is a full-stack oral-cancer screening and care-coordination application. It combines a React patient/doctor portal with an Express API, MongoDB Atlas authentication and appointments, Minimoth OTP login, nearby cancer-hospital discovery, and a PyTorch/OpenCV oral-image screening pipeline.

> **Medical safety:** OncoLink is a screening and care-navigation prototype. It is not a diagnosis and must not replace examination, histopathology, biopsy, or advice from a qualified clinician.

## Features

- Patient email/password registration with phone number capture.
- Patient phone login through Minimoth OTP.
- Doctor-only login and doctor management.
- Role-based patient and doctor dashboards.
- Open-mouth image upload and image gatekeeping.
- Trained binary CNN screening model: benign/non-cancer vs malignant/cancer.
- Grad-CAM visualization and risk score.
- Nearby cancer-hospital directory with browser location support.
- Appointment booking through the in-app booking chatbot.
- MongoDB Atlas persistence for users and appointments.
- Responsive React UI with protected navigation.

## Technology

- Frontend: React 18, Vite, Tailwind CSS, Axios, Leaflet.
- Backend: Node.js, Express, Multer, Mongoose.
- Authentication: signed access tokens, email/password, Minimoth OTP.
- Vision: Python, PyTorch, OpenCV, Pillow, custom `OralCancerCNN`.
- Database: MongoDB Atlas.

## Requirements

- Node.js 20 or newer.
- Python 3.12 or compatible Python 3 environment.
- MongoDB Atlas account and database user.
- Minimoth credentials for SMS OTP login.
- Google Maps/Places API key if live Google hospital search is required.

## Installation

```bash
git clone <your-github-repository-url>
cd VESIT_PROJECT
npm install
```

Create the environment file:

```bash
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead.

Fill in `.env`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5174
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/oncolink?retryWrites=true&w=majority
JWT_SECRET=<random-secret-at-least-32-characters>

MINIMOTH_API_KEY=<your-minimoth-key>
MINIMOTH_API_URL=<your-minimoth-endpoint>
MINIMOTH_SENDER_ID=<your-sender-id>
MINIMOTH_TEMPLATE_ID=<your-template-id>

GOOGLE_MAPS_API_KEY=<your-google-places-key>
MODEL_WEIGHTS_PATH=models/oral_cancer_cnn.pth
PYTHON_BIN=python
VITE_API_BASE_URL=http://localhost:5000/api
```

Never commit `.env`. If a real MongoDB password has been exposed, rotate it in MongoDB Atlas immediately.

## Run locally

Use two terminals from the project root.

Terminal 1 — backend:

```bash
npm run server
```

Terminal 2 — frontend:

```bash
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5174
```

Check the backend:

```text
http://localhost:5000/api/health
```

The health response should report `MongoDB Live` when Atlas is connected.

## Model training

The repository includes the training script at [training/train_oral_cancer.py](training/train_oral_cancer.py). The supplied image archives are organized under `training_data/` into binary labels:

```text
benign / non-cancer
malignant / cancer
```

Install the Python packages used by the training pipeline:

```bash
python -m pip install numpy pillow opencv-python torch
```

Train the model:

```bash
python training/train_oral_cancer.py --epochs 3 --batch-size 64 --image-size 160
```

The best checkpoint is written to:

```text
models/oral_cancer_cnn.pth
```

The backend loads this checkpoint through `MODEL_WEIGHTS_PATH`. The current model was trained as a binary screening model, not as a clinically validated diagnostic system. Before real deployment, retrain and validate with independently collected, consented, clinically labeled data and patient-level splits.

The latest supplied-data run achieved 70.23% accuracy on the external archive, with 81.61% sensitivity and 47.73% specificity. These figures are dataset-specific and are not clinical performance claims.

## Project structure

```text
src/                    React frontend and dashboards
server/                 Express API, authentication, routes, ML runner
server/ml_pipeline.py   Oral-image validation, CNN inference, Grad-CAM
training/               Model training code
training_data/          Supplied labeled training images
models/                 Trained model checkpoint
uploads/                Runtime uploads; ignored by Git
.env.example            Safe environment-variable template
```

## API overview

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login-password
POST /api/auth/send-otp
POST /api/auth/verify-otp
GET  /api/hospitals
POST /api/screenings/analyze
GET  /api/appointments
POST /api/appointments
PUT  /api/appointments/:id/reschedule
```

Protected routes require:

```http
Authorization: Bearer <access-token>
```

## Production checklist

- Replace all development secrets and rotate any previously exposed credentials.
- Set `NODE_ENV=production`.
- Use a strong `JWT_SECRET` stored in the deployment secret manager.
- Restrict MongoDB Atlas network access and database permissions.
- Configure a production `CORS_ORIGIN`.
- Configure a real Minimoth SMS template and delivery sender.
- Configure Google Places API restrictions and billing limits.
- Keep `MODEL_WEIGHTS_PATH` pointed to a versioned, verified checkpoint.
- Add rate limiting, HTTPS, secure headers, structured logs, backups, and monitoring.
- Do not store unnecessary patient-identifying information in image metadata.
- Obtain clinical, privacy, consent, and regulatory review before using real patient care data.

## License and data

Confirm the license and permitted use of every image dataset before redistributing this repository or using the model commercially. Patient images must be consented, de-identified, access-controlled, and handled according to applicable privacy and healthcare regulations.
