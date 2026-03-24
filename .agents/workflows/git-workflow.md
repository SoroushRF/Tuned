---
description: How to follow the Fork + Pull Request workflow
---

# Git Workflow: Fork + Pull Request

To collaborate effectively on the Nuro project, follow these steps:

## 1. Fork the Repository
- Go to the main repository: [SoroushRF/Tuned](https://github.com/SoroushRF/Tuned)
- Click the **Fork** button in the top-right corner.
- This creates a copy of the repo under your account.

## 2. Clone Your Fork
Open your terminal and run:
```bash
git clone https://github.com/parsaabbasian/Nuro.git
cd Nuro
```

## 3. Connect to Upstream
Keep your fork in sync with the original repo:
```bash
git remote add upstream https://github.com/SoroushRF/Tuned.git
```

## 4. Work on Features
Create a new branch for every task:
```bash
git checkout -b feat/your-feature-name
# Make your changes
git add .
git commit -m "feat: description of work"
```

## 5. Sync and Push
Before pushing, make sure you have the latest changes from Soroush:
```bash
git pull upstream main
git push origin feat/your-feature-name
```

## 6. Create Pull Request (PR)
- Go to your fork on GitHub.
- Click **Compare & pull request**.
- Add a description and request a review from your teammate.
## Troubleshooting: "I didn't fork first!"
If you've already made changes but haven't forked yet:
1. **Fork the repo** on GitHub.
2. **Rename** your current `origin`:
   ```bash
   git remote rename origin upstream
   ```
3. **Add your fork** as the new `origin`:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Tuned.git
   ```
4. **Push** your changes:
   ```bash
   git push -u origin your-branch-name
   ```
   
Now yours is `origin` and the main one is `upstream`.
