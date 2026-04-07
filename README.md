# CareConnect

A full-stack healthcare web application that combines **community-driven medical storytelling** with **AI-powered symptom analysis**.

Built with **React (Vite)** for the frontend, **Node.js + Express** for the backend, **MongoDB** for the database, and **Ollama (Gemma 3:1B)** for local AI processing.

---

## 🚀 Features

* User authentication (Signup/Login)
* Medical story blogging
* AI-based symptom analysis
* Community interaction & awareness

---

## 🧠 AI Setup (Ollama)

CareConnect uses **local AI via Ollama**, so no API key is required.

### 1. Install Ollama

Download from: [https://ollama.com](https://ollama.com)

After installation, verify:

```bash
ollama --version
```

---

### 2. Pull the Model

We use:

```
gemma3:1b
```

Run:

```bash
ollama pull gemma3:1b
```

---

### 3. Run Ollama

Start the Ollama server:

```bash
ollama run gemma3:1b
```

Or keep it running in background:

```bash
ollama serve
```

---

### 4. Backend Integration

Your backend should call Ollama API:

```
http://localhost:11434/api/generate
```
---

## ⚙️ Backend Setup

Navigate to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Run backend server:

```bash
npm start dev
```

(or)

```bash
nodemon server.js
```

---

## 💻 Frontend Setup (React + Vite)

From root folder:

```bash
npm install
npm run dev
```

---

## 🏃 Running the Full Project

You need **4 things running simultaneously**:

### 1. Start MongoDB

```bash
mongod
```

### 2. Start Ollama

```bash
ollama serve
```

### 3. Start Backend

```bash
npm start dev
```

### 4. Start Frontend

```bash
cd FrontEnd-folder
npm run dev
```

---

## 🌐 Access the App

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```

Ollama API:

```
http://localhost:11434
```

---

## Notes

* No API key required (Ollama runs locally)
* Ensure all services are running before testing AI features

---
