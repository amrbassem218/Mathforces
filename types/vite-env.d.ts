/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />
interface ImportMetaEnv {
readonly VITE_API_URL: string;
readonly VITE_APP_NAME: string;
// You can add more variables here with their expected types
readonly [key: string]: string | boolean | number | undefined;
}

interface ImportMeta {
readonly env: ImportMetaEnv;
}