import * as fs from 'fs'
import * as path from 'path'

// Files that need any type fixes
const filesToFix = [
  'src/app/admin/courses/[id]/builder/section/new/page.tsx',
  'src/app/admin/courses/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/quiz-scores/page.tsx',
  'src/app/api/auth/setup-profile/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/student/page.tsx',
  'src/app/teacher/quiz-scores/page.tsx'
]

async function fixAnyTypes() {
  for (const filePath of filesToFix) {
    try {
      const fullPath = path.join(process.cwd(), filePath)
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ File not found: ${filePath}`)
        continue
      }

      let content = fs.readFileSync(fullPath, 'utf8')
      let modified = false

      // Fix common any type patterns
      const fixes = [
        // Fix error handling
        { from: /catch \(err: any\)/g, to: 'catch (err: unknown)' },
        { from: /catch \(error: any\)/g, to: 'catch (error: unknown)' },
        { from: /catch \(e: any\)/g, to: 'catch (e: unknown)' },
        
        // Fix error message access
        { from: /err\.message/g, to: 'err instanceof Error ? err.message : "An error occurred"' },
        { from: /error\.message/g, to: 'error instanceof Error ? error.message : "An error occurred"' },
        { from: /e\.message/g, to: 'e instanceof Error ? e.message : "An error occurred"' },
        
        // Fix function parameters
        { from: /\(.*: any\)/g, to: (match: string) => match.replace(': any', ': unknown') },
        
        // Fix variable declarations
        { from: /: any\s*=/g, to: ': unknown =' },
        { from: /: any\s*;/g, to: ': unknown;' },
        { from: /: any\s*\)/g, to: ': unknown)' },
      ]

      for (const fix of fixes) {
        if (fix.from.test(content)) {
          content = content.replace(fix.from, fix.to as string)
          modified = true
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content)
        console.log(`✅ Fixed any types in: ${filePath}`)
      } else {
        console.log(`ℹ️ No any types found in: ${filePath}`)
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error)
    }
  }
}

fixAnyTypes().then(() => {
  console.log('🎉 Finished fixing any types!')
}).catch(console.error)
