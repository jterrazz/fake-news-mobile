// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
        // Handle .jsx -> .tsx
        if (moduleName.endsWith('.jsx')) {
            const tsxName = moduleName.replace(/\.jsx$/, '.tsx');
            try {
                return context.resolveRequest(context, tsxName, platform);
            } catch (e) {
                return context.resolveRequest(context, moduleName, platform);
            }
        }

        // Handle .js -> .ts
        if (moduleName.endsWith('.js')) {
            const tsName = moduleName.replace(/\.js$/, '.ts');
            try {
                return context.resolveRequest(context, tsName, platform);
            } catch (e) {
                return context.resolveRequest(context, moduleName, platform);
            }
        }

        return context.resolveRequest(context, moduleName, platform);
    },
    sourceExts: [
        'expo.tsx',
        'expo.ts',
        'expo.js',
        'expo.jsx',
        'tsx',
        'ts',
        'jsx',
        'js',
        'json',
        'cjs',
    ],
};

module.exports = config;
