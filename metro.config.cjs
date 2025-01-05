// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = {
    ...config.resolver,
    alias: {
        '@': './src',
    },
    resolveRequest: (context, moduleName, platform) => {
        // First handle @ alias if present
        let resolvedName = moduleName;
        if (moduleName.startsWith('@/')) {
            resolvedName = moduleName.replace('@/', `${__dirname}/src/`);
        }

        // Then handle extension transformations
        if (resolvedName.endsWith('.jsx')) {
            const tsxName = resolvedName.replace(/\.jsx$/, '.tsx');
            try {
                return context.resolveRequest(context, tsxName, platform);
            } catch (e) {
                return context.resolveRequest(context, resolvedName, platform);
            }
        }

        if (resolvedName.endsWith('.js')) {
            // First try .ts
            const tsName = resolvedName.replace(/\.js$/, '.ts');
            try {
                return context.resolveRequest(context, tsName, platform);
            } catch (e) {
                // If .ts fails, try .tsx
                const tsxName = resolvedName.replace(/\.js$/, '.tsx');
                try {
                    return context.resolveRequest(context, tsxName, platform);
                } catch (tsxError) {
                    // If both fail, fallback to original
                    return context.resolveRequest(context, resolvedName, platform);
                }
            }
        }

        return context.resolveRequest(context, resolvedName, platform);
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
