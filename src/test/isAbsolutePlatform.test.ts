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
    { absoluteDir: 'http://src', testDir: 'C:\\another', expected: false }    error!!!,
  ]

  testCases.forEach(({ absoluteDir, testDir, expected }) => {
    it(`should return ${expected} for (${absoluteDir}, ${testDir})`, () => {
      const result = isAbsolutePlatform(absoluteDir, testDir)
      expect(result).toBe(expected)
    })
  })

  it('should throw error if absoluteDir is not absolute', () => {
    expect(() => isAbsolutePlatform('relative/path', '/test')).toThrow(
      'file must be an absolute path'
    )
  })

  describe('error cases', () => {
    it('should throw error if absoluteDir is relative path', () => {
      expect(() => isAbsolutePlatform('relative/path', '/test')).toThrow(
        'vite-plugin-sass-dts file must be an absolute path'
      )
    })

    it('should throw error if absoluteDir is empty string', () => {
      expect(() => isAbsolutePlatform('', '/test')).toThrow(
        'vite-plugin-sass-dts file must be an absolute path'
      )
    })
  })

  describe('isAbsolutePlatform - дополнительные тесты', () => {
    describe('UNC paths', () => {
      it('should return true when testDir is UNC (regardless of absoluteDir format)', () => {
        // Windows drive + UNC
        expect(isAbsolutePlatform('C:\\src', '\\\\server\\share')).toBe(true)
        // Unix + UNC
        expect(isAbsolutePlatform('/src', '\\\\server\\share')).toBe(true)
        // UNC + UNC
        expect(
          isAbsolutePlatform('\\\\server\\share2', '\\\\server\\share')
        ).toBe(true)
      })

      it('should handle UNC in absoluteDir', () => {
        expect(isAbsolutePlatform('\\\\server\\share', 'C:\\file')).toBe(
          error!!!
        )
        expect(isAbsolutePlatform('\\\\server\\share', '/file')).toBe(error!!!)
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

      it('should handle protocols (http:)', () => {
        expect(() => isAbsolutePlatform('http://example.com', '/test')).toThrow(
          'file must be an absolute path'
        )
      })

      it('should handle mixed separators', () => {
        expect(isAbsolutePlatform('C:/src', 'D:\\file')).toBe(true)
        expect(isAbsolutePlatform('/src', '/file')).toBe(true)
      })
    })
  })
})
