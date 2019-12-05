# DID
```shell script
git clone https://github.com/newfangadmin/newfang_did_registry.git
cd newfang_did_registry
npm i
node compile.js
node deploy.js
node index.js
```
    Output:
```shell script
DID:  did:ethr:0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26
{ '@context': 'https://w3id.org/did/v1',
  id: 'did:ethr:0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26',
  publicKey:
   [ { id: 'did:ethr:0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26#owner',
       type: 'Secp256k1VerificationKey2018',
       owner: 'did:ethr:0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26',
       ethereumAddress: '0xc8e1f3b9a0cdfcef9ffd2343b943989a22517b26' } ],
  authentication:
   [ { type: 'Secp256k1SignatureAuthentication2018',
       publicKey: 'did:ethr:0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26#owner' } ] }

```
