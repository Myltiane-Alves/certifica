import express from 'express';
const app = express();
const PORT = process.env.PORT || 3001;
// const PORT =  'http://164.152.244.96:6001';
// const PORT =  'https://confidencial-api.vercel.app';

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta `, PORT);
});


// import pem from 'pem';
// import { exec } from 'child_process';
// import fs from 'fs';

// // Configurações
// const senha = '#senhagto2024#';
// const nomeArquivoPFX = 'GTO2024-2025.pfx';

// // Gerar certificado SSL autoassinado
// pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
//   if (err) {
//     console.error('Erro ao gerar certificado:', err);
//     return;
//   }

//   console.log('Certificado e chave privada gerados.');

//   // Salvar a chave privada e o certificado em arquivos temporários
//   fs.writeFileSync('temp-key.pem', keys.serviceKey);
//   fs.writeFileSync('temp-cert.pem', keys.certificate);

//   console.log('Chave privada e certificado salvos em arquivos temporários.');

//   // Comando OpenSSL para criar o arquivo .pfx
//   const comandoOpenSSL = `openssl pkcs12 -export -out ${nomeArquivoPFX} -inkey temp-key.pem -in temp-cert.pem -passout pass:${senha}`;

//   // Executar o comando OpenSSL
//   exec(comandoOpenSSL, (error, stdout, stderr) => {
//     if (error) {
//       console.error('Erro ao criar o arquivo .pfx:', error);
//       return;
//     }

//     console.log(`Arquivo ${nomeArquivoPFX} criado com sucesso.`);

//     // Remover arquivos temporários
//     fs.unlinkSync('temp-key.pem');
//     fs.unlinkSync('temp-cert.pem');

//     console.log('Arquivos temporários removidos.');
//   });
// });



import fs  from 'fs';
import forge from'node-forge';

// Caminho para o arquivo .pfx
const pfxFilePath = './GTO 2024-2025.pfx';
const pfxPassword = '#senhagto2024#';

// Lê o arquivo .pfx
const pfxFile = fs.readFileSync(pfxFilePath, 'binary');

// Converte o arquivo .pfx para um objeto PKCS12
const p12Asn1 = forge.asn1.fromDer(pfxFile, false);
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, pfxPassword);

// Função para encontrar a chave privada e o certificado
function getPemFromP12(p12, password) {
    let certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    let keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    // Extrai o certificado
    const certBag = certBags[forge.pki.oids.certBag][0];
    const cert = forge.pki.certificateToPem(certBag.cert);

    // Extrai a chave privada
    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    const key = forge.pki.privateKeyToPem(keyBag.key);

    return { cert, key };
}

// Obtém o certificado e a chave privada
const { cert, key } = getPemFromP12(p12, pfxPassword);

// Caminhos para salvar os arquivos
const certFilePath = './certificado.pem';
const keyFilePath = './chave_privada.pem';

// Salva o certificado em um arquivo .pem
fs.writeFileSync(certFilePath, cert);
console.log(`Certificado salvo em: ${certFilePath}`);

// Salva a chave privada em um arquivo .pem
fs.writeFileSync(keyFilePath, key);
console.log(`Chave privada salva em: ${keyFilePath}`);