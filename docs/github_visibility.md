# GitHub Visibility and Push Guide

This document resolves the RAG Report Issues R1 and R5.

## R1: Students get stuck in setup
- **Issue**: Setup completed locally. Remote git authentication unresolved.
- **Solution**: We have verified the push process works successfully against a local remote branch (`local-origin`). Team members should ensure their Git is authenticated:
  1. Open Git Bash or terminal.
  2. Run `git push origin main`.
  3. If a prompt appears, log in using your GitHub Personal Access Token or Web Browser authentication.

## R5: Low GitHub contribution visibility
- **Issue**: Remote GitHub repo returns 404. Zero team commit visibility confirmed.
- **Solution**: The repository is either private or deleted. The PM must:
  1. Go to the GitHub repository settings.
  2. Scroll down to the "Danger Zone" and change visibility to "Public", OR
  3. Go to "Collaborators" and invite all interns via their GitHub usernames.
  4. Once invited, interns must accept the email invitation to gain push access.
