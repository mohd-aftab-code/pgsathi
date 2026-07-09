const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // 1. Change import
      if (content.includes('import { requireManageAccess } from "@/lib/manage-auth"')) {
        content = content.replace(/import \{ requireManageAccess \} from "@\/lib\/manage-auth"/g, 'import { requireManagerAccess } from "@/lib/manager-auth"');
        modified = true;
      }
      // Also handle multi-line or other imports from manage-auth
      if (content.match(/import\s*\{[^}]*requireManageAccess[^}]*\}\s*from\s*"@\/lib\/manage-auth"/)) {
          // It's safer to just replace requireManageAccess with requireManagerAccess and the file path
          content = content.replace(/requireManageAccess/g, 'requireManagerAccess');
          content = content.replace(/"@\/lib\/manage-auth"/g, '"@/lib/manager-auth"');
          modified = true;
      }

      if (content.includes('requireManageAccess')) {
        content = content.replace(/requireManageAccess/g, 'requireManagerAccess');
        modified = true;
      }

      // 3. Change routes
      if (content.includes('/dashboard/owner/manage')) {
        content = content.replace(/\/dashboard\/owner\/manage/g, '/dashboard/manager');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app', '(dashboard)', 'dashboard', 'manager'));
console.log('Done processing.');
