module.exports = ({ env }) => ({
    'transformer': {
       enabled: true,
       config: {
         responseTransforms: {
           removeAttributesKey: true,
           removeDataKey: true
         }
       }
     },
     'import-export-entries': {
       enabled: true
     },
     'upload': {
        config: {
          provider: 'strapi-provider-upload-azure-storage',
          providerOptions: {
            account: env('STORAGE_ACCOUNT'),
            accountKey: env('STORAGE_ACCOUNT_KEY'),
            serviceBaseURL: env('STORAGE_URL'),
            containerName: env('STORAGE_CONTAINER_NAME'),
            cdnBaseURL: env('STORAGE_CDN_URL'),
            defaultPath: env('STORAGE_PATH'),
            maxConcurrent: env('STORAGE_MAX_CONCURRENT')
          }
        }
      }
   })