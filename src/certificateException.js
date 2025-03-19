import { execSync } from 'child_process';

class CertificateException extends Error {
    constructor(message) {
        super(message);
        this.name = 'CertificateException';
    }

    static unableToRead() {
        return new CertificateException(`Impossível ler o certificado, ${this.getOpenSSLError()}`);
    }

    static unableToOpen() {
        return new CertificateException(`Impossível abrir o certificado, ${this.getOpenSSLError()}`);
    }

    static signContent() {
        return new CertificateException(`Ocorreu um erro inesperado durante o processo de assinatura, ${this.getOpenSSLError()}`);
    }

    static getPrivateKey() {
        return new CertificateException(`Ocorreu um erro ao recuperar a chave privada, ${this.getOpenSSLError()}`);
    }

    static signatureFailed() {
        return new CertificateException(`Ocorreu um erro enquanto verificava a assinatura, ${this.getOpenSSLError()}`);
    }

    static getOpenSSLError() {
        try {
            const errorCode = '0D0680A8'; // Replace with a dynamic error code if needed
            console.log(`Running OpenSSL command: openssl errstr ${errorCode}`);
            const msg = execSync(`openssl errstr ${errorCode}`, { encoding: 'utf-8' });
            console.log(`OpenSSL output: ${msg.trim()}`);
            return `ocorreu o seguinte erro: (${msg.trim()})`;
        } catch (err) {
            console.error('Erro ao executar o comando OpenSSL:', err.message);
            return 'ocorreu um erro desconhecido ao executar o comando OpenSSL.';
        }
    }
}

export default CertificateException;