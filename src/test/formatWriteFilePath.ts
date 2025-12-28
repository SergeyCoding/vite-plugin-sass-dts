import path from 'path'
import { PluginOptions } from 'type'
import { formatWriteFileName } from './../write'
import { isAbsolutePlatform } from './isAbsolutePlatform'

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
