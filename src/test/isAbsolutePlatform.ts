import path from 'path'

export const isAbsolutePlatform = (
  absoluteDir: string,
  testDir: string
): boolean => {
  if (!path.isAbsolute(absoluteDir)) {
    throw new Error('vite-plugin-sass-dts file must be an absolute path')
  }

  if (absoluteDir.startsWith('\\\\') && !testDir.startsWith('\\\\')) {
    throw new Error(
      'vite-plugin-sass-dts if file is UNC, then testDir must be UNC'
    )
  }

  // UNC
  if (testDir.startsWith('\\\\')) {
    return path.isAbsolute(testDir)
  }

  // win
  if (absoluteDir.includes(':')) {
    return path.isAbsolute(testDir) && testDir.includes(':')
  }

  // other
  return path.isAbsolute(testDir) && !testDir.includes(':')
}
