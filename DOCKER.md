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

### 🧪 **Testing**

```bash
# Quick test - returns basic response
pnpm docker:test

# Detailed test - formatted JSON response
pnpm docker:test-detailed
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

### 🧹 **Cleanup**

```bash
# Remove unused Docker resources
pnpm docker:cleanup-all
```

---

## 🚀 **Quick Start Workflow**

### First Time Setup:

```bash
# 1. Build and run
pnpm docker:restart

# 2. Test it's working
pnpm docker:test

# 3. View logs
pnpm docker:logs
```

### Development Workflow:

```bash
# After making changes:
pnpm docker:restart
pnpm docker:test-detailed
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

## 📂 **File Output**

Results are automatically saved to:

- **Local Directory**: `./results/`
- **Container Directory**: `/tmp/` (mounted to local results)

### File Formats:

- **JSON**: `scan-results-YYYY-MM-DD-HH-MM-SS.json` (machine readable)
- **TXT**: `scan-results-YYYY-MM-DD-HH-MM-SS.txt` (human readable)

---

## 🛠️ **Advanced Usage**

### Custom Volume Mounting:

```bash
# If you want to change the results directory
docker run -d -p 9000:8080 -v "C:\your\custom\path:/tmp" --name webscanner-test web-scanner
```

### Environment Variables:

```bash
# Run with custom environment
docker run -d -p 9000:8080 -e NODE_ENV=production --name webscanner-test web-scanner
```

### Port Mapping:

```bash
# Use different port
docker run -d -p 8080:8080 --name webscanner-test web-scanner
# Then test with: http://localhost:8080
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
pnpm docker:cleanup-all  # Free up Docker resources
```

### Can't Access Files:

- Check that `./results/` directory exists
- Verify volume mounting path in the scripts

---

## 📊 **Script Breakdown**

| Script                 | Purpose         | When to Use                 |
| ---------------------- | --------------- | --------------------------- |
| `docker:build`         | Build image     | After code changes          |
| `docker:run`           | Start container | First run or after stop     |
| `docker:restart`       | Full cycle      | Most common - after changes |
| `docker:test`          | Quick check     | Verify it's working         |
| `docker:test-detailed` | Full results    | See actual scraped data     |
| `docker:logs`          | Debug           | When something's wrong      |
| `docker:clean`         | Safe cleanup    | Before rebuilding           |

---

## 🎯 **Production Notes**

For production deployment:

1. Use `pnpm deploy` for AWS Lambda
2. The Docker setup is for local testing
3. Files in production would go to S3 or similar storage

**Your Docker setup is now fully scripted and ready for daily development! 🚀**
