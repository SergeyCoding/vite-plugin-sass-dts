import path from 'path'
import { formatWriteFilePath } from './formatWriteFilePath'

jest.mock('./../write.ts', () => ({
  formatWriteFileName: jest.fn((p, legacy: boolean) => {
    return legacy ? p : p
  }),
}))

describe('formatWriteFilePath', () => {
  const testCases = [
    // Unix-style paths
    {
      input: '/src/styles/file.scss',
      srcDir: '/src',
      outDir: '/dist',
      expected: '/dist/styles/file.scss',
    },
    // Windows-style paths
    {
      input: 'C:\\src\\styles\\file.scss',
      srcDir: 'C:\\src',
      outDir: 'C:\\dist',
      expected: 'C:\\dist\\styles\\file.scss',
    },
    // Mixed slashes
    {
      input: '/src\\styles/file.scss',
      srcDir: '/src',
      outDir: '/dist',
      expected: '/dist/styles/file.scss',
    },
    // UNC paths
    {
      input: '\\\\server\\share\\src\\file.scss',
      srcDir: '\\\\server\\share\\src',
      outDir: '\\\\server\\share\\dist',
      expected: '\\\\server\\share\\dist\\file.scss',
    },
    // Relative path in src (should throw)
    {
      input: '/src/styles/file.scss',
      srcDir: 'relative/src',
      outDir: '/dist',
      shouldThrow: true,
    },
    // UNC src with non-UNC out (should throw)
    {
      input: '\\\\server\\share\\file.scss',
      srcDir: '\\\\server\\share',
      outDir: 'C:\\dist',
      shouldThrow: true,
    },
    // Missing srcDir or outDir
    {
      input: '/src/styles/file.scss',
      srcDir: undefined,
      outDir: '/dist',
      expected: '/src/styles/file.scss',
    },
    // Same dir (no replacement)
    {
      input: '/src/styles/file.scss',
      srcDir: '/src',
      outDir: '/src',
      expected: '/src/styles/file.scss',
    },
  ]

  testCases.forEach(({ input, srcDir, outDir, expected, shouldThrow }) => {
    it(`should handle ${JSON.stringify({ input, srcDir, outDir })}`, () => {
      if (shouldThrow) {
        expect(() =>
          formatWriteFilePath(input, { sourceDir: srcDir, outputDir: outDir })
        ).toThrow('must be an absolute path')
      } else {
        const result = formatWriteFilePath(input, {
          sourceDir: srcDir,
          outputDir: outDir,
        })
        expect(path.normalize(result)).toBe(path.normalize(expected as string))
      }
    })
  })
})
