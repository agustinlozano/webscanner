# 🐳 Docker Scripts Reference

## Available Docker Commands

All Docker operations are now available as npm/pnpm scripts for easy access:

### 🏗️ **Build & Development**

```bash
# Build TypeScript and create Docker image
pnpm docker:build

# Full restart workflow (stop → build → run)
pnpm docker:restart
```

### 🚀 **Container Management**

```bash
# Run the container with volume mounting
pnpm docker:run

# View container logs
pnpm docker:logs

# Stop the running container
pnpm docker:stop

# Remove the container
pnpm docker:remove

# Clean stop and remove (safe cleanup)
pnpm docker:clean
```

### 🔍 **Debugging & Inspection**

```bash
# Enter container shell for debugging
pnpm docker:shell

# Inspect container configuration
pnpm docker:inspect

# List running webscanner containers
pnpm docker:ps

# List web-scanner images
pnpm docker:images
```

---

## 🚀 **Quick Start Workflow**

### First Time Setup:

```bash
# 1. Build and run
pnpm docker:restart


# 2. View logs
pnpm docker:logs
```

### Development Workflow:

```bash
# After making changes:
pnpm docker:restart
```

### Debugging Issues:

```bash
# Check what's running
pnpm docker:ps

# View logs for errors
pnpm docker:logs

# Enter container for debugging
pnpm docker:shell
```

---

## 🆘 **Troubleshooting**

### Container Won't Start:

```bash
pnpm docker:logs  # Check for errors
pnpm docker:clean # Clean up
pnpm docker:build # Rebuild
```

### Port Already in Use:

```bash
pnpm docker:ps    # See what's running
pnpm docker:clean # Stop existing container
```

### Memory Issues:

```bash
pnpm docker:cleanup-all  # We don't have this script in `/scripts/docker-cleanup-all` yet
```

---

## 📊 **Script Breakdown**

| Script           | Purpose         | When to Use                 |
| ---------------- | --------------- | --------------------------- |
| `docker:build`   | Build image     | After code changes          |
| `docker:run`     | Start container | First run or after stop     |
| `docker:restart` | Full cycle      | Most common - after changes |
| `docker:logs`    | Debug           | When something's wrong      |
| `docker:clean`   | Safe cleanup    | Before rebuilding           |

---

**Your Docker setup is now fully scripted and ready for daily development! 🚀**
