---
description: Automate git commits and pushes for every change
---
// turbo-all
For every change made to the codebase in this project, follow these steps automatically without asking for permission:

1. Stage all changes: `git add .`
2. Commit with a descriptive message: `git commit -m "[feat/fix/chore]: <description of changes>"`
3. Push to the remote repository: `git push origin main`

This rule is mandatory for all agents working on the Uni-Find project.
