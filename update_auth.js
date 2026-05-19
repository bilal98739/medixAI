const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "app/api/notifications/route.ts",
  "app/api/doctors/route.ts",
  "app/api/users/route.ts",
  "app/api/appointments/route.ts",
  "app/api/appointments/[id]/route.ts",
  "app/api/auth/me/route.ts",
  "app/api/users/me/route.ts",
  "app/api/users/analytics/route.ts"
];

for (const file of filesToUpdate) {
  const absolutePath = path.join(process.cwd(), file);
  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${absolutePath}`);
    continue;
  }
  
  let content = fs.readFileSync(absolutePath, 'utf8');
  let originalContent = content;
  
  // Replace getAuthUser(
  content = content.replace(/(?<!await\s)getAuthUser\(/g, 'await getAuthUser(');
  // Replace requireAuth(
  content = content.replace(/(?<!await\s)requireAuth\(/g, 'await requireAuth(');
  // Replace requireRole(
  content = content.replace(/(?<!await\s)requireRole\(/g, 'await requireRole(');
  
  if (content !== originalContent) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
