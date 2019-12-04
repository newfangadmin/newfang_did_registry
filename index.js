const config = require('./config.json');
const ethers = require('ethers');
const Web3 = require('web3');
const contractJson = require('./build/EthereumDIDRegistry.json');
const DIDResolver  = require('did-resolver');
const EDR   = require('ethr-did-resolver');
const currentProvider = new Web3.providers.HttpProvider(config.network);
const provider = new ethers.providers.Web3Provider(currentProvider);
const providerConfig = { rpcUrl: config.network, registry: config.EthereumDIDRegistry }
const ethrDidResolver = EDR.getResolver(providerConfig);
const didResolver = new DIDResolver.Resolver(ethrDidResolver);


let didContract = new ethers.Contract(config.EthereumDIDRegistry, contractJson.abi, provider);

let wallet = new ethers.Wallet(config.private_key, provider);
let wallet1 = new ethers.Wallet.fromMnemonic("swap robust expect kid alarm ten icon sign such forward script voice");
let wallet2 = new ethers.Wallet.fromMnemonic("shine trend peasant winter coast room december exit snap soul abandon fresh");



const delegateTypes = {
  Secp256k1SignatureAuthentication2018: ethers.utils.formatBytes32String('sigAuth'),
  Secp256k1VerificationKey2018: ethers.utils.formatBytes32String('veriKey')
};

const attrTypes = {
  sigAuth: 'SignatureAuthentication2018',
  veriKey: 'VerificationKey2018'
};

let valid_days = 5;
(async () => {
  console.log(`Add delegate, ${wallet1.address} is delegate of ${wallet.address}`);
  let tx = await didContract.connect(wallet).addDelegate(wallet.address, delegateTypes.Secp256k1SignatureAuthentication2018, wallet1.address, valid_days * 24 * 60 * 60);
  console.log("Transaction hash", tx.hash, "Waiting for transaction to be mined....");
  await tx.wait(2);
  console.log("Sets attribute"); //Sets an attribute with the given name and value, valid for validity seconds.\
  tx = await didContract.connect(wallet).setAttribute(wallet.address, ethers.utils.formatBytes32String("hello"),
    ethers.utils.toUtf8Bytes("asdf"), 10);
  console.log("Transaction hash", tx.hash, "Waiting for transaction to be mined....");
  await tx.wait(2);
  // console.log("transaction mined");

  console.log("Transaction mined, Now revoke above delegate");
  tx = await didContract.connect(wallet).revokeDelegate(wallet.address, delegateTypes.Secp256k1SignatureAuthentication2018, wallet1.address);
  console.log("Transaction hash", tx.hash, "Waiting for transaction to be mined....");
  await tx.wait(2);
  console.log("transaction mined");
  console.log(await didResolver.resolve(`did:ethr:${wallet.address}`));


})();

// ec.sign(ethers.utils.keccak256())


