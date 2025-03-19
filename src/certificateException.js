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
        let error = 'ocorreu o seguinte erro: ';
        let msg;
        while (msg = require('child_process').execSync('openssl errstr', { encoding: 'utf-8' })) {
            error += `(${msg.trim()})`;
        }
        return error;
    }
}

export default CertificateException;