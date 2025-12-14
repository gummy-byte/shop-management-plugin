---
description: Build React assets and deploy plugin to DevKinsta
---

This workflow builds the React frontend and copies the entire plugin to the DevKinsta WordPress installation.

1. Build the React application

```bash
cd "/Users/syamim/Documents/Vibe App/shop-management-plugin/custom-management-dashboard"
npm install
npm run build
```

// turbo 2. Deploy to DevKinsta (Clean & Copy)

```bash
# Define paths
SOURCE_DIR="/Users/syamim/Documents/Vibe App/shop-management-plugin/custom-management-dashboard"
DEST_DIR="/Users/syamim/DevKinsta/public/fatimah-frozen/wp-content/plugins/custom-management-dashboard"

# Remove old version to ensure no stale files
rm -rf "$DEST_DIR"

# Copy new version
cp -r "$SOURCE_DIR" "/Users/syamim/DevKinsta/public/fatimah-frozen/wp-content/plugins/"

echo "Deployment complete! Plugin updated in DevKinsta."
```
