import { writeFile } from 'node:fs'
import { dirname, basename } from 'node:path'
import prettier from 'prettier'
const { format } = prettier

import { type Options } from 'prettier'
import { ContentReplacer, PluginOptions } from 'type'
import { getRelativePath } from './util'
import path from 'path'
import { mkdir } from 'node:fs/promises'

export const writeToFile = async (
  prettierOptions: Options,
  fileName: string,
  classNameKeys: Map<string, boolean>,
  options?: PluginOptions
) => {
  const baseName = path.basename(fileName)
  const typeName = getReplacerResult(baseName, options?.typeName)
  const exportName =
    getReplacerResult(baseName, options?.exportName) ?? 'classNames'
  let exportTypes = ''
  let namedExports = ''
  const exportStyle = options?.esmExport
    ? `export default ${exportName};`
    : `export = ${exportName};`
  for (const classNameKey of classNameKeys.keys()) {
    exportTypes = `${exportTypes}\n${formatExportType(classNameKey, typeName)}`
    namedExports = `${namedExports}\nexport const ${classNameKey}: '${
      typeName ?? classNameKey
    }';`
  }

  let outputFileString = ''
  if (options?.global?.outputFilePath) {
    const relativePath = getRelativePath(
      dirname(fileName),
      dirname(options.global.outputFilePath)
    )
    const exportTypeFileName = formatExportTypeFileName(
      options.global.outputFilePath
    )
    outputFileString = `import globalClassNames from '${relativePath}${exportTypeFileName}'\n`
    outputFileString = `${outputFileString}declare const ${exportName}: typeof globalClassNames & {${exportTypes}\n};\n${exportStyle}`
    if (options?.useNamedExport) {
      outputFileString = `${outputFileString}\n${namedExports}\n\n`
    }
  } else {
    outputFileString = `declare const ${exportName}: {${exportTypes}\n};\n${exportStyle}`
    if (options?.useNamedExport) {
      outputFileString = `${outputFileString}\n\n${namedExports}`
    }
  }

  const prettierdOutputFileString = await format(
    outputFileString,
    prettierOptions
  )

  const writePath = formatWriteFilePath(fileName, options)

  await ensureDirectoryExists(writePath)

  writeFile(writePath, `${prettierdOutputFileString}`, (err) => {
    if (err) {
      console.log(err)
      throw err
    }
  })
}

export const getReplacerResult = (
  fileName: string,
  replacer?: ContentReplacer
) => {
  if (replacer && replacer.replacement) {
    if (typeof replacer.replacement === 'function') {
      return replacer.replacement(fileName)
    } else {
      return replacer.replacement
    }
  }

  return undefined
}

export const formatExportType = (key: string, type = `'${key}'`) =>
  `  readonly '${key}': ${type};`

/**
 * Checks if two paths are in the same absolute path format.
 *
 * This function verifies that both paths follow the same format:
 * - Windows drive format (e.g., `C:\path`)
 * - UNIX format (e.g., `/path`)
 * - UNC format (e.g., `\\server\share`)
 *
 * @param absoluteDir - The reference absolute path. Must be an absolute path.
 * @param testDir - The path to check against the reference format.
 *
 * @returns `true` if both paths are in the same format, `false` otherwise.
 *
 * @throws {Error} If `absoluteDir` is not an absolute path.
 * @throws {Error} If `absoluteDir` is a UNC path but `testDir` is not.
 *
 * @remarks
 * - If `testDir` is a UNC path, the function always returns `true`.
 * - For non-UNC paths, the format is determined by the presence of a drive letter (`:`).
 */
const isAbsolutePlatform = (absoluteDir: string, testDir: string): boolean => {
  if (!path.isAbsolute(absoluteDir)) {
    throw new Error('vite-plugin-sass-dts file must be an absolute path')
  }

  // Rule: If reference is UNC, target must also be UNC
  if (absoluteDir.startsWith('\\\\') && !testDir.startsWith('\\\\')) {
    throw new Error(
      'vite-plugin-sass-dts if file is UNC, then testDir must be UNC'
    )
  }

  // UNC paths format (\\SRV-MAIN\Docs\Report.docx)
  if (testDir.startsWith('\\\\')) {
    return path.isAbsolute(testDir)
  }

  // Windows drive format (C:\path)
  if (absoluteDir.includes(':')) {
    return path.isAbsolute(testDir) && testDir.includes(':')
  }

  // UNIX format (/path) or other non-Windows formats
  return path.isAbsolute(testDir) && !testDir.includes(':')
}

export const formatWriteFilePath = (file: string, options?: PluginOptions) => {
  const srcDir = options?.sourceDir
  const outDir = options?.outputDir

  if (srcDir && !isAbsolutePlatform(file, srcDir)) {
    throw new Error('vite-plugin-sass-dts sourceDir must be an absolute path')
  }
  if (outDir && !isAbsolutePlatform(file, outDir)) {
    throw new Error('vite-plugin-sass-dts outputDir must be an absolute path')
  }

  if (!srcDir || !outDir) {
    return formatWriteFileName(file, options?.legacyFileFormat)
  }

  const relativePath = path.relative(srcDir, file)
  const absoluteOutDir = path.join(outDir, relativePath)
  return formatWriteFileName(absoluteOutDir, options?.legacyFileFormat)
}

export const formatWriteFileName = (file: string, legacyFormat = false) => {
  if (file.endsWith('d.ts')) {
    return file
  }

  if (legacyFormat) {
    // Legacy format: sample.module.scss.d.ts
    return `${file}.d.ts`
  }

  // TypeScript 5 format: sample.module.d.scss.ts
  // Extract the file extension (e.g., .scss, .sass, .css)
  const extensionMatch = file.match(/\.(scss|sass|css)$/)
  if (extensionMatch) {
    const extension = extensionMatch[1]
    const basePath = file.slice(0, -extension.length - 1) // Remove .scss/.sass/.css
    return `${basePath}.d.${extension}.ts`
  }

  // Fallback for unknown extensions
  return `${file}.d.ts`
}

export const formatExportTypeFileName = (file: string) =>
  basename(file.replace('.ts', ''))

export const ensureDirectoryExists = async (file: string) => {
  await mkdir(dirname(file), { recursive: true })
}
