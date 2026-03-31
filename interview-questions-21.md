# Interview Questions: Git

## Coding Question

> **Demonstrate Git version control knowledge and workflows.**
>
> **Topics Covered:**
> 1. Basic commands
> 2. Branching strategies
> 3. Merging and rebasing
> 4. Conflict resolution
> 5. Advanced operations

---

## Basic Commands

### Q1: What are the essential Git commands?
**Answer:**
```bash
# Initialize and clone
git init                          # Create new repo
git clone <url>                   # Clone existing repo

# Stage and commit
git status                        # Check working directory
git add <file>                    # Stage specific file
git add .                         # Stage all changes
git commit -m "message"           # Commit staged changes
git commit -am "message"          # Add + commit (tracked files)

# View history
git log                           # Full history
git log --oneline --graph         # Compact visual history
git show <commit>                 # Show commit details
git diff                          # Unstaged changes
git diff --staged                 # Staged changes

# Remote operations
git remote -v                     # List remotes
git fetch                         # Download remote changes
git pull                          # Fetch + merge
git push                          # Upload commits
git push -u origin main           # Set upstream
```

### Q2: What's the difference between `git fetch` and `git pull`?
**Answer:**
```bash
# git fetch - downloads without merging
git fetch origin
# Now you can inspect: origin/main vs main
git diff main origin/main

# git pull - downloads AND merges
git pull origin main
# Equivalent to:
git fetch origin main
git merge origin/main

# git pull with rebase
git pull --rebase origin main
# Equivalent to:
git fetch origin main
git rebase origin/main
```

**Use fetch when:** You want to see changes before integrating  
**Use pull when:** You're ready to integrate immediately

---

## Branching

### Q3: Explain common branching strategies
**Answer:**

**Git Flow:**
```
main ────●────────────●────────────●──── (releases)
          \          /              \
develop ───●──●──●──●────●──●──●───●──●── (integration)
             \    /         \    /
feature ──────●──●───        ──●──●──     (features)
```
- `main`: Production code
- `develop`: Integration branch
- `feature/*`: New features
- `release/*`: Prepare releases
- `hotfix/*`: Emergency fixes

**GitHub Flow (simpler):**
```
main ────●────●────●────●────● (always deployable)
          \    \    \ /    /
feature ───●────●────●────●    (short-lived branches)
```
- Only `main` + feature branches
- Deploy from `main` frequently

**Trunk-Based Development:**
- Very short-lived branches (hours, not days)
- Feature flags for incomplete features
- CI/CD required

### Q4: How do you create and manage branches?
**Answer:**
```bash
# Create branch
git branch feature-login          # Create only
git checkout -b feature-login     # Create and switch
git switch -c feature-login       # Modern alternative

# List branches
git branch                        # Local branches
git branch -r                     # Remote branches
git branch -a                     # All branches

# Switch branches
git checkout main
git switch main                   # Modern alternative

# Delete branch
git branch -d feature-login       # Safe delete (merged only)
git branch -D feature-login       # Force delete
git push origin --delete feature  # Delete remote

# Rename branch
git branch -m old-name new-name
git branch -m new-name            # Rename current
```

---

## Merging and Rebasing

### Q5: What's the difference between merge and rebase?
**Answer:**
```bash
# Merge - creates merge commit
       main: A──B──C──────M
                   \    /
feature:            D──E

git checkout main
git merge feature

# Rebase - rewrites history (linear)
       main: A──B──C
                     \
feature:              D'──E'

git checkout feature
git rebase main
```

**Merge:**
- Preserves complete history
- Non-destructive
- Can clutter history with merge commits

**Rebase:**
- Linear, clean history
- Rewrites commits (new SHAs)
- Never rebase public/shared branches!

### Q6: How do you squash commits?
**Answer:**
```bash
# Interactive rebase to squash last 3 commits
git rebase -i HEAD~3

# In editor:
pick abc1234 First commit
squash def5678 Second commit
squash ghi9012 Third commit

# Or use merge squash
git checkout main
git merge --squash feature
git commit -m "Feature complete"

# Soft reset for local commits
git reset --soft HEAD~3
git commit -m "Combined commit"
```

---

## Conflict Resolution

### Q7: How do you resolve merge conflicts?
**Answer:**
```bash
# Attempt merge
git merge feature-branch
# CONFLICT (content): Merge conflict in file.js

# Check status
git status

# Conflict markers in file:
<<<<<<< HEAD
const value = 'main version';
=======
const value = 'feature version';
>>>>>>> feature-branch

# Resolve manually, then:
git add file.js
git commit -m "Resolve merge conflict"

# Abort merge
git merge --abort

# Use mergetool
git mergetool
```

### Q8: How do you use `git stash`?
**Answer:**
```bash
# Save work in progress
git stash
git stash save "WIP: login feature"
git stash push -m "message" file.js  # Specific file

# List stashes
git stash list
# stash@{0}: WIP: login feature
# stash@{1}: On main: quick fix

# Apply stash
git stash pop               # Apply and remove
git stash apply             # Apply and keep
git stash apply stash@{1}   # Apply specific

# Drop stash
git stash drop stash@{0}
git stash clear             # Remove all

# Create branch from stash
git stash branch new-branch stash@{0}
```

---

## Advanced Operations

### Q9: How do you undo changes in Git?
**Answer:**
```bash
# Discard working directory changes
git checkout -- file.js          # Old way
git restore file.js              # Modern way

# Unstage files
git reset HEAD file.js           # Old way
git restore --staged file.js     # Modern way

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert (creates new commit)
git revert <commit-sha>

# Amend last commit
git commit --amend -m "new message"
git commit --amend --no-edit     # Keep message

# Reset to remote state
git fetch origin
git reset --hard origin/main
```

### Q10: What is `git cherry-pick`?
**Answer:**
```bash
# Apply specific commit to current branch
git cherry-pick abc1234

# Cherry-pick without committing
git cherry-pick --no-commit abc1234

# Cherry-pick range
git cherry-pick abc1234..def5678

# Handle conflicts
git cherry-pick abc1234
# Resolve conflicts
git add .
git cherry-pick --continue

# Abort
git cherry-pick --abort
```

Use cases:
- Port hotfix from release to main
- Selectively apply features
- Recover commits from deleted branches

### Q11: How do you use `git bisect`?
**Answer:**
```bash
# Start bisect
git bisect start

# Mark known states
git bisect bad                  # Current is broken
git bisect good v1.0.0          # This tag worked

# Git checks out middle commit
# Test it, then mark:
git bisect good
# or
git bisect bad

# Repeat until found
# Bisecting: 0 revisions left to test after this
# abc1234 is the first bad commit

# End bisect
git bisect reset

# Automated bisect
git bisect run npm test
```

### Q12: What are Git hooks?
**Answer:**
```bash
# Location: .git/hooks/
# Common hooks:
pre-commit      # Before commit (lint, format)
prepare-commit-msg  # Modify commit message
commit-msg      # Validate message format
pre-push        # Before push (run tests)
post-merge      # After merge

# Example pre-commit hook
#!/bin/sh
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed"
    exit 1
fi

# Use husky for easier management
npx husky init
npx husky add .husky/pre-commit "npm test"
```

---

## Best Practices

### Q13: What makes a good commit message?
**Answer:**
```
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Example
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth providers.
Includes token refresh and session management.

Closes #123
BREAKING CHANGE: removed legacy login endpoint

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting
refactor: Code restructure
test:     Adding tests
chore:    Maintenance

# Rules
- Use imperative mood ("add" not "added")
- Subject line < 50 chars
- Body < 72 chars per line
- Reference issues/PRs
```

### Q14: How do you clean up Git history?
**Answer:**
```bash
# Remove untracked files
git clean -n                    # Dry run
git clean -f                    # Force remove files
git clean -fd                   # Include directories
git clean -fdx                  # Include ignored files

# Garbage collection
git gc
git gc --aggressive

# Prune old objects
git prune

# Remove file from entire history
git filter-branch --tree-filter 'rm -f secrets.txt' HEAD
# Or use git-filter-repo (recommended)
git filter-repo --path secrets.txt --invert-paths

# Reduce repo size
git repack -a -d --depth=250 --window=250
```

---
