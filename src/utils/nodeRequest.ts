import axios, { AxiosRequestConfig } from 'axios';

type TBasicAuth = {
    username: string;
    password: string;
};

const basicAuthCache = new Map<string, TBasicAuth>();

const normalizeBaseUrl = (apiBase: string): URL => {
    const base = new URL(apiBase);
    if (!base.pathname.endsWith('/')) {
        base.pathname = `${base.pathname}/`;
    }
    return base;
};

const parseAuthFromUrl = (nodeUrl: URL): TBasicAuth | undefined => {
    if (!nodeUrl.username) return undefined;

    return {
        username: decodeURIComponent(nodeUrl.username),
        password: decodeURIComponent(nodeUrl.password)
    };
};

const askBasicAuth = (origin: string): TBasicAuth | undefined => {
    if (typeof window === 'undefined') return undefined;

    const username = window.prompt(`Basic Auth username for ${origin}`) || '';
    if (!username) return undefined;

    const password = window.prompt(`Basic Auth password for ${origin}`) || '';

    return { username, password };
};

export const nodeGet = async <T = any>(apiBase: string, path: string, config: AxiosRequestConfig = {}) => {
    const nodeUrl = normalizeBaseUrl(apiBase);
    const baseKey = `${nodeUrl.origin}${nodeUrl.pathname}`;
    const auth = parseAuthFromUrl(nodeUrl) || basicAuthCache.get(baseKey);
    const requestUrl = new URL(path.replace(/^\/+/, ''), nodeUrl).toString();

    try {
        return await axios.get<T>(requestUrl, {
            ...config,
            auth,
            withCredentials: true
        });
    } catch (e: any) {
        const status = e?.response?.status;
        if (!status) {
            const isCrossOrigin = typeof window !== 'undefined' && new URL(requestUrl).origin !== window.location.origin;
            if (isCrossOrigin) {
                const corsError = new Error('CORS_BLOCKED');
                (corsError as any).code = 'CORS_BLOCKED';
                throw corsError;
            }
        }
        const shouldAskAuth = status === 401 || status === 403;
        if (!shouldAskAuth) throw e;

        const promptedAuth = askBasicAuth(baseKey);
        if (!promptedAuth) throw e;

        basicAuthCache.set(baseKey, promptedAuth);

        return axios.get<T>(requestUrl, {
            ...config,
            auth: promptedAuth,
            withCredentials: true
        });
    }
};
