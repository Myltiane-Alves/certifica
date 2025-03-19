import fs from 'fs';
import forge from 'node-forge';
import PublicKey from './publicKey.js';

class CertificationChain {
    constructor(chainkeysstring = null) {
        this.rawKey = '';
        this.chainKeys = [];

        if (chainkeysstring) {
            this.rawKey = chainkeysstring;
            this.loadListChain();
        }
    }

    add(content) {
        if (this.isBinary(content)) {
            content = Buffer.from(content, 'binary').toString('base64');
            content = content.match(/.{1,64}/g).join('\n');
            content = `-----BEGIN CERTIFICATE-----\n${content}\n-----END CERTIFICATE-----\n`;
        }
        return this.loadList(content);
    }

    isBinary(str) {
        return /[^\x20-\x7E\t\r\n]/.test(str);
    }

    removeExpiredCertificates() {
        this.chainKeys = this.chainKeys.filter(publickey => !publickey.isExpired());
    }

    listChain() {
        return this.chainKeys;
    }

    toString() {
        this.rawString();
        return this.rawKey;
    }

    getExtraCertsForPFX() {
        const ec = this.chainKeys.map(cert => cert.toString());
        return ec.length ? { extracerts: ec } : {};
    }

    loadListChain() {
        const arr = this.rawKey.split("-----END CERTIFICATE-----");
        arr.forEach(a => {
            if (a.length > 20) {
                const cert = `${a}-----END CERTIFICATE-----\n`;
                this.loadList(cert);
            }
        });
    }

    loadList(certificate) {
        const publickey = new PublicKey(certificate);
        this.chainKeys.push(publickey);
        return this.chainKeys;
    }

    rawString() {
        this.rawKey = this.chainKeys.map(publickey => publickey.toString()).join('');
    }

    // New method to load a PFX file
    loadPFX(pfxPath, password) {
        const pfxData = fs.readFileSync(pfxPath);
        const pfx = forge.pkcs12.pkcs12FromAsn1(
            forge.asn1.fromDer(pfxData.toString('binary')),
            password
        );

        pfx.safeContents.forEach(safeContent => {
            safeContent.safeBags.forEach(safeBag => {
                if (safeBag.cert) {
                    const cert = forge.pki.certificateToPem(safeBag.cert);
                    this.add(cert);
                }
            });
        });
    }
}

export default CertificationChain;

// Example usage
const chain = new CertificationChain();
chain.loadPFX('GTO 2024-2025.pfx', '#senhagto2024#');
console.log(chain.listChain());