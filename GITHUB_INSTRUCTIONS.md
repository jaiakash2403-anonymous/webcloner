# How to Add WebCloner to GitHub

Since Git is not currently installed or in the system PATH of this environment, this guide provides step-by-step instructions to initialize a local Git repository and push this project to your GitHub account.

---

## Step 1: Install Git
If you do not have Git installed on your local machine:
1. Download Git for Windows from the official page: [git-scm.com/downloads](https://git-scm.com/downloads).
2. Run the installer. You can keep the default options. Make sure to check the box **"Git from the command line and also from 3rd-party software"** so it is added to your environment path.
3. Open a new Terminal (PowerShell or Command Prompt) and verify installation by running:
   ```bash
   git --version
   ```

---

## Step 2: Configure Git (One-Time Setup)
Set your global Git credentials in the terminal:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Initialize Git and Create Local Commit
Navigate to your project directory and initialize it:
1. Open your terminal in this workspace folder (`C:\Users\asus\.gemini\antigravity-ide\scratch\webcloner`).
2. Run the following commands:
   ```bash
   # Initialize local git repository
   git init

   # Add all project files
   git add .

   # Create initial commit
   git commit -m "Initial commit: WebCloner AI Frontend Replicator SPA"
   ```

---

## Step 4: Push to GitHub
1. Go to your GitHub profile and click **"New repository"**.
2. Name the repository `webcloner` (or any name you prefer).
3. Do **NOT** initialize it with a README, `.gitignore`, or License. Keep it completely empty.
4. Copy the remote repository URL (it will look like `https://github.com/your-username/webcloner.git`).
5. Run the following commands in your local project terminal:
   ```bash
   # Rename the default branch to main
   git branch -M main

   # Link your local repository to GitHub
   git remote add origin https://github.com/your-username/webcloner.git

   # Push your code to GitHub
   git push -u origin main
   ```

You are all set! Refresh your GitHub repository page to see your files.
