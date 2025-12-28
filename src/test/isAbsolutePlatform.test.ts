import { isAbsolutePlatform } from './isAbsolutePlatform'

describe('isAbsolutePlatform', () => {
  const testCases = [
    // Windows absolute paths
    { absoluteDir: 'C:\\src', testDir: 'D:\\file', expected: true },
    { absoluteDir: 'C:\\src', testDir: 'relative/file', expected: false },
    { absoluteDir: 'C:\\src', testDir: '/unix/path', expected: false },

    // Unix absolute paths
    { absoluteDir: '/src', testDir: '/home/file', expected: true },
    { absoluteDir: '/src', testDir: 'relative/file', expected: false },
    { absoluteDir: '/src', testDir: 'C:\\windows', expected: false },

    // Mixed (should use first path format)
    { absoluteDir: '/src', testDir: '/another', expected: true },
    { absoluteDir: 'C:\\src', testDir: 'C:\\another', expected: true },
  ]

  testCases.forEach(({ absoluteDir, testDir, expected }) => {
    it(`should return ${expected} for (${absoluteDir}, ${testDir})`, () => {
      const result = isAbsolutePlatform(absoluteDir, testDir)
      expect(result).toBe(expected)
    })
  })

  describe('error cases', () => {
    it('should throw error if absoluteDir is not absolute', () => {
      expect(() => isAbsolutePlatform('relative/path', '/test')).toThrow(
        'vite-plugin-sass-dts file must be an absolute path'
      )
    })

    it('should throw error if absoluteDir is empty string', () => {
      expect(() => isAbsolutePlatform('', '/test')).toThrow(
        'vite-plugin-sass-dts file must be an absolute path'
      )
    })

    it('should throw error for protocol (http:)', () => {
      expect(() => isAbsolutePlatform('http://example.com', '/test')).toThrow(
        'vite-plugin-sass-dts file must be an absolute path'
      )
    })
  })

  describe('UNC paths', () => {
    it('should return true when testDir is UNC (regardless of absoluteDir format)', () => {
      expect(isAbsolutePlatform('C:\\src', '\\\\server\\share')).toBe(true)
      expect(isAbsolutePlatform('/src', '\\\\server\\share')).toBe(true)
      expect(
        isAbsolutePlatform('\\\\server\\share2', '\\\\server\\share')
      ).toBe(true)
    })

    it('should throw error if absoluteDir is UNC but testDir is not', () => {
      expect(() => isAbsolutePlatform('\\\\server\\share', 'C:\\file')).toThrow(
        'vite-plugin-sass-dts if file is UNC, then testDir must be UNC'
      )
      expect(() => isAbsolutePlatform('\\\\server\\share', '/file')).toThrow(
        'vite-plugin-sass-dts if file is UNC, then testDir must be UNC'
      )
    })

    it('should return true when both are UNC', () => {
      expect(
        isAbsolutePlatform('\\\\server\\share', '\\\\server2\\share2')
      ).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty testDir', () => {
      expect(isAbsolutePlatform('C:\\src', '')).toBe(false)
      expect(isAbsolutePlatform('/src', '')).toBe(false)
    })

    it('should handle mixed separators', () => {
      expect(isAbsolutePlatform('C:/src', 'D:\\file')).toBe(true)
      expect(isAbsolutePlatform('/src', '/file')).toBe(true)
    })
  })
})
