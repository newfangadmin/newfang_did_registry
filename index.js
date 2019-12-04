const config = require('./config.json');
const ethers = require('ethers');
const Web3 = require('web3');
const contractJson = require('./build/EthereumDIDRegistry.json');
const DIDResolver = require('did-resolver');
const EDR = require('ethr-did-resolver');
const currentProvider = new Web3.providers.HttpProvider(config.network);
const provider = new ethers.providers.Web3Provider(currentProvider);
const providerConfig = {rpcUrl: config.network, registry: config.EthereumDIDRegistry}
const ethrDidResolver = EDR.getResolver(providerConfig);
const didResolver = new DIDResolver.Resolver(ethrDidResolver);
var ethutil = require("ethereumjs-util");
var sha3 = require("js-sha3").keccak_256;
var BN = require("bn.js");

let didContract = new ethers.Contract(config.EthereumDIDRegistry, contractJson.abi, provider);

let wallet = new ethers.Wallet(config.private_key, provider);
// let wallet1 = new ethers.Wallet.fromMnemonic("swap robust expect kid alarm ten icon sign such forward script voice");
// let wallet2 = new ethers.Wallet.fromMnemonic("shine trend peasant winter coast room december exit snap soul abandon fresh");
let wallet1 = wallet;
let wallet2 = wallet;


const delegateTypes = {
  Secp256k1SignatureAuthentication2018: ethers.utils.formatBytes32String('sigAuth'),
  Secp256k1VerificationKey2018: ethers.utils.formatBytes32String('veriKey')
};

const attrTypes = {
  sigAuth: 'SignatureAuthentication2018',
  veriKey: 'VerificationKey2018'
};

let valid_days = 5;
// (async () => {
//   console.log(`Add delegate, ${wallet1.address} is delegate of ${wallet.address}`);
//   let tx = await didContract.connect(wallet).addDelegate(wallet.address, delegateTypes.Secp256k1SignatureAuthentication2018, wallet1.address, valid_days * 24 * 60 * 60);
//   console.log("Transaction hash", tx.hash, "Waiting for transaction to be mined....");
//   await tx.wait(2);
//   console.log("Sets attribute"); //Sets an attribute with the given name and value, valid for validity seconds.\
//   tx = await didContract.connect(wallet).setAttribute(wallet.address, ethers.utils.formatBytes32String("hello"),
//     ethers.utils.toUtf8Bytes("asdf"), 10);
//   console.log("Transaction hash", tx.hash, "Waiting for transaction to be mined....");
//   await tx.wait(2);
//   // console.log("transaction mined");
//
//   console.log("Transaction mined, Now revoke above delegate");
//   tx = await didContract.connect(wallet).revokeDelegate(wallet.address, delegateTypes.Secp256k1SignatureAuthentication2018, wallet1.address);
//   console.log("Transaction hash", tx.hash, "Waiting for transaction to be mined....");
//   await tx.wait(2);
//   console.log("transaction mined");
//   console.log(await didResolver.resolve(`did:ethr:${wallet.address}`));
//
//
// })();
function leftPad(data, size = 64) {
  if (data.length === size) return data;
  return "0".repeat(size - data.length) + data;
}

function stripHexPrefix(str) {
  if (str.startsWith("0x")) {
    return str.slice(2);
  }
  return str;
}

async function signData(identity, signer, key, data) {
  const nonce = parseInt(await didContract.functions.nonce(signer));
  const paddedNonce = leftPad(Buffer.from([nonce], 64).toString("hex"));
  const dataToSign =
    "1900" +
    stripHexPrefix(config.EthereumDIDRegistry) +
    paddedNonce +
    stripHexPrefix(identity) +
    data;
  const hash = Buffer.from(sha3.buffer(Buffer.from(dataToSign, "hex")));
  const signature = ethutil.ecsign(hash, key);
  const publicKey = ethutil.ecrecover(
    hash,
    signature.v,
    signature.r,
    signature.s
  );
  return {
    r: "0x" + signature.r.toString("hex"),
    s: "0x" + signature.s.toString("hex"),
    v: signature.v
  };
}

(async () => {
  let sig = await signData(
    wallet.address,
    wallet1.address,
    Buffer.from(
      wallet1.privateKey.substr(2,wallet1.privateKey.length),
      "hex"
    ),
    Buffer.from("addDelegate").toString("hex") +
    ethers.utils.formatBytes32String("attestor") +
    stripHexPrefix(wallet2.address) +
    leftPad(new BN(86400).toString(16))
  );
  console.log(sig);
  let tx1 = await didContract.connect(wallet).functions.addDelegateSigned(
    wallet.address,
    sig.v,
    sig.r,
    sig.s,
    ethers.utils.formatBytes32String("attestor"),
    wallet2.address,
    86400,
  );
  console.log(tx1.hash);
  await tx1.wait();
  console.log("transaction confirmed");
})();
