# NextMedi 🩺

**An AI-powered application for predicting adverse medical events from phone call transcriptions.**

This project is a modern web application built with Next.js 14 (App Router) that provides a user interface for analyzing medical call transcripts. It leverages a large language model (like Google's Gemini) via an API to predict potential adverse medical events, assess severity, and provide recommendations based on the call's content.

## ✨ Features

* **AI-Powered Analysis:** Securely sends call transcriptions to an AI backend to analyze symptoms and predict medical events.

* **Structured Output:** Displays a clear, structured prediction, including the potential event, confidence score, and severity.

* **Actionable Recommendations:** Provides a list of recommended next steps for the healthcare provider or patient.

* **Modern UI/UX:** Built with **shadcn/ui** and **Tailwind CSS** for a clean, responsive, and accessible user experience.

* **Type-Safe:** Fully written in **TypeScript** for better code quality and maintainability.

* **High-Performance:** Uses **Bun** as the fast runtime and package manager.

## 🚀 How It Works

1. **Input:** A user (e.g., a nurse, doctor, or call center agent) pastes a transcription of a phone call into the text area.

2. **Analyze:** The user clicks "Analyze," and the transcription is securely sent to a Next.js API route.

3. **Predict:** The API route forwards the text to an AI model (like Google's Gemini) with a specific prompt to evaluate the medical context.

4. **Display:** The AI's structured JSON response is parsed and displayed in a clean, easy-to-read format on the dashboard.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https.nextjs.org/) (App Router)

* **Language:** [TypeScript](https://www.typescriptlang.org/)

* **UI:** [shadcn/ui](https://ui.shadcn.com/)

* **Styling:** [Tailwind CSS](https://tailwindcss.com/)

* **Runtime:** [Bun](https://bun.sh/)

* **Linting:** [ESLint](https://eslint.org/)

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Prerequisites

You must have [Bun](https://bun.sh/docs/installation) installed on your system.

### 2. Clone the Repository

git clone https://github.com/vaibhav092/nextmedi.git cd nextmedi


### 3. Install Dependencies

bun install


### 4. Set Up Environment Variables

This application requires an API key for the AI model (e.g., Google Gemini).

Create a new file named `.env.local` in the root of the project and add your API key:

Example for Google's Gemini API
GEMINI_API_KEY="YOUR_API_KEY_HERE"


### 5. Run the Development Server

Start the local development server with:

bun dev


Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the application. The page will auto-update as you edit the files.

## 📜 Available Scripts

* `bun dev`: Starts the development server.

* `bun build`: Creates a production-ready build of the application.

* `bun start`: Starts the production server (requires `bun build` to be run first).

* `bun lint`: Runs the ESLint linter to find and fix code issues.

## 🚀 Deployment

The easiest way to deploy this Next.js application is by using the [Vercel Platform](https://vercel.com/new).

**Important:** When deploying to Vercel, make sure to add your `GEMINI_API_KEY` (or other secret keys) as **Environment Variables** in the Vercel project settings.