import license from 'rollup-plugin-license'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/plugin.ts',
  output: {
    file: 'index.js',
	exports: 'named',
	generatedCode: 'es2015',
    format: 'cjs'
  },
  external: ['electron'],
  plugins: [
    resolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
	typescript(),
    json(),
    license({
      thirdParty: {
        includePrivate: true,
        output: {
          file: 'third-party-licenses.txt'
        }
      }
    })
  ]
}
