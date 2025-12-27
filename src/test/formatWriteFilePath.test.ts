import { PluginOptions } from 'type'
import * as path from 'path'
import { formatWriteFilePath } from './formatWriteFilePath'

// // Мокаем вторую функцию из того же модуля
// jest.mock('./write', () => {
//   const original = jest.requireActual('./write')
//   return {
//     ...original,
//     formatWriteFileName: jest.fn((p) => p + '.d.ts'),
//   }
// })

// jest.mock('./../write.ts', () => ({
//   formatWriteFileName: jest.fn((p, legacy: boolean) => {
//     if (legacy) {
//       return p
//     }
//     return p
//   }),
// }))

describe('formatWriteFilePath', () => {
  it('should replace srcDir with outDir', () => {
    const result = formatWriteFilePath('/src/styles/file.scss.d.ts', {
      sourceDir: '/src',
      outputDir: '/dist',
    } satisfies PluginOptions)
    expect(result).toBe(path.join('/dist', 'styles', 'file.scss.d.ts'))
  })
})
