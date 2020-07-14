const isDevEnv = process.env.NODE_ENV === 'development'

const depricatedHosts = {
    mainnet: {
        secure: isDevEnv ? 'http://0.0.0.0:8082' : 'https://ide.wavesplatform.com',
        insecure: undefined
    },
    stagenet: {
        secure: isDevEnv ? 'http://0.0.0.0:8080' : 'https://ide-stagenet.wavesplatform.com',
        insecure: undefined
    }
}

const activeHosts = {
    mainnet: {
        secure: isDevEnv ? 'http://0.0.0.0:8083' : 'https://waves-ide.com',
        insecure: isDevEnv ? 'http://0.0.0.0:8084' : 'http://custom.waves-ide.com'
    },
    stagenet: {
        secure: isDevEnv ? 'http://0.0.0.0:8081' : 'https://stagenet.waves-ide.com',
        insecure: isDevEnv ? 'http://0.0.0.0:8085' : 'http://custom.stagenet.waves-ide.com'
    }
}

const depricatedHostSecure = depricatedHosts.mainnet.secure;
const activeHostSecure = activeHosts.mainnet.secure;

const isDepricatedHost = depricatedHostSecure.includes(window.origin);
const isActiveHost = activeHostSecure.includes(window.origin);

const formatHost = (host: string) =>  host.replace(/^https?:\/\//, '');

export {
    depricatedHosts,
    activeHosts,
    depricatedHostSecure,
    activeHostSecure,
    isDepricatedHost,
    isActiveHost,
    formatHost
}