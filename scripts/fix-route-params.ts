import * as fs from 'fs'
import * as path from 'path'

// Find all route.ts files
function findRouteFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath))
    } else if (item === 'route.ts') {
      files.push(fullPath)
    }
  }
  
  return files
}

async function fixRouteParams() {
  const routeFiles = findRouteFiles(path.join(process.cwd(), 'src/app/api'))
  
  for (const filePath of routeFiles) {
    try {
      let content = fs.readFileSync(filePath, 'utf8')
      let modified = false
      
      // Fix params type from { params: { id: string } } to { params: Promise<{ id: string }> }
      const paramRegex = /{ params }: { params: { ([^}]+) } }/g
      const matches = content.match(paramRegex)
      
      if (matches) {
        for (const match of matches) {
          const newMatch = match.replace('{ params: { ', '{ params: Promise<{ ').replace(' } }', ' }> }')
          content = content.replace(match, newMatch)
          modified = true
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content)
        console.log(`✅ Fixed route params in: ${filePath}`)
      } else {
        console.log(`ℹ️ No params to fix in: ${filePath}`)
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error)
    }
  }
}

fixRouteParams().then(() => {
  console.log('🎉 Finished fixing route params!')
}).catch(console.error)
