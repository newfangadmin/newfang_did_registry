var EC = require('elliptic').ec;

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

var sha3 = require("js-sha3").keccak_256;

let data = [
  "0x19",
  "0x00",
  config.EthereumDIDRegistry,
  parseInt(await didContract.functions.nonce(wallet.address)),
  wallet1.address,
  "addDelegate",
  ethers.utils.formatBytes32String("test"),
  wallet2.address,
  100
];
let signature = (ec.sign(sha3(data), wallet.privateKey, "hex", {canonical: true}));
let r = "0x"+ signature.r.toString("hex");
let s = "0x"+ signature.s.toString("hex");
let v = signature.recoveryParam;
