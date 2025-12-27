import path, { isAbsolute } from 'path'
import { PluginOptions } from 'type'

export const formatWriteFileName = (file: string, legacyFormat = false) => {
  if (legacyFormat) {
    return file
  }

  return file
}

export const formatWriteFilePath = (file: string, options?: PluginOptions) => {
  const srcDir = options?.sourceDir
  const outDir = options?.outputDir

  if (srcDir && !isAbsolute(srcDir)) {
    throw new Error('vite-plugin-sass-dts sourceDir must be an absolute path')
  }
  if (outDir && !isAbsolute(outDir)) {
    throw new Error('vite-plugin-sass-dts outputDir must be an absolute path')
  }

  if (!srcDir || !outDir) {
    return formatWriteFileName(path.resolve(file), options?.legacyFileFormat)
  }

  const relativePath = path.relative(srcDir, path.resolve(file))
  const newPath = path.join(outDir, relativePath)
  return formatWriteFileName(newPath, options?.legacyFileFormat)
}
