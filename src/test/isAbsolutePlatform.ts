import path from 'path'

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
 * - UNC paths (`\\server\share`) are always considered Windows format.
 * - If `testDir` is a UNC path, the function always returns `true`.
 * - For non-UNC paths, the format is determined by the presence of a drive letter (`:`).
 */
export const isAbsolutePlatform = (
  absoluteDir: string,
  testDir: string
): boolean => {
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
