import { execSync } from 'child_process';
import CertificateException from './certificateException.js';

class PublicKey {
    constructor(publicKey) {
        this.rawKey = publicKey;
        this.read();
    }

    static createFromContent(content) {
        content = content.replace(/[\r\n]/g, '').match(/.{1,64}/g).join('\n');
        const certificate = `-----BEGIN CERTIFICATE-----\n${content}\n-----END CERTIFICATE-----\n`;
        return new PublicKey(certificate);
    }

    read() {
        try {
            const openssl = execSync('openssl x509 -noout -text', { input: this.rawKey });
            const details = openssl.toString();

            this.commonName = details.match(/Subject:.*? CN=([^,]+)/)[1];
            const emailMatch = details.match(/emailAddress=([^,]+)/);
            if (emailMatch) {
                this.emailAddress = emailMatch[1];
            }

            const orgUnitMatch = details.match(/Issuer:.*?OU=([^,]+)/);
            if (orgUnitMatch) {
                this.cspName = orgUnitMatch[1] + ' - ' + details.match(/Issuer:.*?CN=([^,]+)/)[1];
            }

            this.serialNumber = details.match(/Serial Number:\s+([^\s]+)/)[1];
            this.icp = details.match(/Subject:.*?O=([^,]+)/) ? details.match(/Subject:.*?O=([^,]+)/)[1] : '';

            const authorityInfoAccessMatch = details.match(/Authority Information Access:\n\s+CA Issuers - URI:(http[^,]+)/);
            if (authorityInfoAccessMatch) {
                this.caurl = this.between(authorityInfoAccessMatch[1], 'http', ['.p7b', '.p7c']);
            }

            this.validFrom = new Date(details.match(/Not Before:\s+([^\n]+)/)[1]);
            this.validTo = new Date(details.match(/Not After :\s+([^\n]+)/)[1]);

            if (details.match(/name/)) {
                const arrayName = details.match(/name\s+:\s+([^\n]+)/)[1].split('/').reverse().filter(Boolean);
                this.subjectNameValue = arrayName.join(',');
            }
        } catch (error) {
            // throw CertificateException.unableToOpen();
        }
    }

    verify(data, signature, algorithm = 'sha1') {
        try {
            const verify = execSync(`openssl dgst -${algorithm} -verify ${this.rawKey} -signature ${signature}`, { input: data });
            const result = verify.toString().trim();
            if (result === 'Verification Failure') {
                throw CertificateException.signatureFailed();
            }
            return result === 'Verified OK';
        } catch (error) {
            throw CertificateException.signatureFailed();
        }
    }

    isExpired() {
        return new Date() > this.validTo;
    }

    unFormated() {
        return this.rawKey.replace(/-----.*[\n]?/g, '').replace(/[\n\r]/g, '');
    }

    toString() {
        return this.rawKey;
    }

    cnpj() {
        return Asn1.getCNPJ(this.unFormated());
    }

    cpf() {
        return Asn1.getCPF(this.unFormated());
    }

    between(string, start, end = ['p7b', 'p7c']) {
        string = ' ' + string;
        for (const final of end) {
            if (string.includes(final)) {
                const ini = string.indexOf(start);
                if (ini === -1) return '';
                const path = string.substring(ini, string.indexOf(final) - 13);
                if (path.endsWith(final)) return path;
            }
        }
        return '';
    }
}

export default PublicKey;