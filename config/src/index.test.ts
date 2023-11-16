import {Config, configPath, loadConfig } from './index'
import { afterEach, vi, describe, expect, it} from 'vitest'
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
// Contains trailing forward slash
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const MOCK_AXIOM_JSON_CONFIG_DIR = __dirname + '__mocks__/json/'
const MOCK_AXIOM_JSON_CONFIG_DEV = __dirname + '__mocks__/json/.axiom.dev.json'
const MOCK_AXIOM_JSON_CONFIG_PROD = __dirname + '__mocks__/json/.axiom.json'

const MOCK_AXIOM_JS_CONFIG_DIR = __dirname + '__mocks__/js/'
const MOCK_AXIOM_JS_CONFIG_DEV = __dirname + '__mocks__/js/.axiom.dev.js'
const MOCK_AXIOM_JS_CONFIG_PROD = __dirname + '__mocks__/js/.axiom.js'

const mockProdConfig = {
    "name":"test", 
    "env":"prod", 
    "aws": {
        "account": "prod-account",
        "profile": "prod-profile",
        "region": "us-east-1",
        "baseParameterPath": "/prod-path",
    }
}

const mockDevConfig = {
    "name":"test", 
    "env":"dev", 
    "aws": {
        "account": "test-account",
        "profile": "test-profile",
        "region": "us-east-1",
        "baseParameterPath": "/test-path",
    }
}

describe('load configs', () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('override basic config', () => { 

        const jsonConfig = loadConfig({ cwd: MOCK_AXIOM_JSON_CONFIG_DIR})

        expect(jsonConfig.env).toBe('prod')
        
        const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR})

        expect(jsConfig.env).toBe('prod')
    })

    it('load prod env basic config', () => { 

        const jsonConfig = loadConfig({ cwd: MOCK_AXIOM_JSON_CONFIG_DIR})

        expect(jsonConfig.env).toBe('prod')
        
        const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR})

        expect(jsConfig.env).toBe('prod')
    })

    it('test path', () => {

        const jsonPath = configPath({env: 'dev', cwd: MOCK_AXIOM_JSON_CONFIG_DIR})

        expect(jsonPath).toBe(MOCK_AXIOM_JSON_CONFIG_DEV)

        const jsPath = configPath({env: 'dev', cwd: MOCK_AXIOM_JS_CONFIG_DIR})

        expect(jsPath).toBe(MOCK_AXIOM_JS_CONFIG_DEV)
    })
})
