# DeepDefacementDetection

A deep learning-based system for detecting website defacement using ResNet50 and BiLSTM architectures.

## Project Overview

This project implements a deep learning solution for detecting website defacement, combining the power of ResNet50 for image feature extraction and BiLSTM for sequence modeling. The system is designed to identify unauthorized modifications to website content through visual analysis.

## Project Structure

```
DeepDefacementDetection/
├── backend/                    # Backend server implementation
│   ├── models/                # Pre-trained model files
│   │   ├── BiLSTM.h5         # BiLSTM model weights
│   │   ├── ResNet50_defaced_clf.h5  # ResNet50 model weights
│   │   └── tokenizer.pickle  # Text tokenizer for BiLSTM
│   ├── connect_dtb.py        # Database connection utilities
│   ├── main.py              # Main FastAPI application
│   └── requirements.txt     # Python dependencies
│
├── frontend/                  # Next.js frontend application
│   ├── public/              # Static assets
│   ├── src/                # Source code
│   │   └── app/           # Next.js app directory
│   ├── .gitignore         # Git ignore rules
│   ├── eslint.config.mjs  # ESLint configuration
│   ├── next.config.ts     # Next.js configuration
│   ├── package.json       # NPM dependencies
│   ├── postcss.config.mjs # PostCSS configuration
│   └── tsconfig.json      # TypeScript configuration
│
└── defaced-clf-resnet50-bilstm.ipynb  # Model training notebook
```

## Features

- Deep learning-based defacement detection
- ResNet50 for image feature extraction
- BiLSTM for sequence modeling
- Modern Next.js frontend with TypeScript
- FastAPI backend with RESTful endpoints
- Pre-trained models included
- Database integration support

## Technical Stack

### Backend
- Python 3.8+
- FastAPI
- TensorFlow 2.x
- PyTorch
- SQL Database (via connect_dtb.py)

### Frontend
- Next.js
- TypeScript
- Modern React
- TailwindCSS (via PostCSS)

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- TensorFlow 2.x
- PyTorch

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
python main.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
# or
yarn dev
```

3. Access the web interface at `http://localhost:3000`

## Model Architecture

The system uses a hybrid architecture combining:
- ResNet50 for extracting visual features from website screenshots
- BiLSTM for processing sequential patterns in the data
- Classification head for final defacement detection

### Pre-trained Models
- `ResNet50_defaced_clf.h5`: Pre-trained ResNet50 model for image classification
- `BiLSTM.h5`: Pre-trained BiLSTM model for sequence processing
- `tokenizer.pickle`: Text tokenizer for BiLSTM input processing

## Development

### Backend Development
- The main application logic is in `main.py`
- Database connection utilities are in `connect_dtb.py`
- Models are stored in the `models/` directory

### Frontend Development
- Next.js app directory structure in `src/app/`
- TypeScript configuration in `tsconfig.json`
- ESLint for code quality
- PostCSS for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.