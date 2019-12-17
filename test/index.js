const assert = require('assert');
const ethers = require('ethers');
const config = require('../config.json');

const ganache = require('ganache-cli');
const provider = new ethers.providers.Web3Provider(ganache.provider({gasLimit: 8000000}));

const newfangJson = require('../build/NewfangDIDRegistry.json');

let wallet, newfangDID, accounts, wallet1 = new ethers.Wallet(config.private_key);
let IDs = [
  "0x4de0e96b0a8886e42a2c35b57df8a9d58a93b5bff655bc37a30e2ab8e29dc066",
  "0x3d725c5ee53025f027da36bea8d3af3b6a3e9d2d1542d47c162631de48e66c1c",
  "0x967f2a2c7f3d22f9278175c1e6aa39cf9171db91dceacd5ee0f37c2e507b5abe"
];
let AccessTypes = {
  read: ethers.utils.formatBytes32String("read"),
  reshare: ethers.utils.formatBytes32String("reshare"),
  delete: ethers.utils.formatBytes32String("delete")
};

describe('Ganache Setup', async () => {
  it('initiates ganache and generates a bunch of demo accounts', async () => {
    accounts = await provider.listAccounts();
    wallet = provider.getSigner(accounts[0]);
    assert.ok(accounts.length >= 2, 'atleast 2 accounts should be present in the array');
  });
});

describe('Contract initialization, DID creation', async () => {
  it('Deploying the contract', async () => {
    const newfangContract = new ethers.ContractFactory(
      newfangJson.abi,
      newfangJson.bytecode,
      wallet
    );
    newfangDID = await newfangContract.deploy();
    await newfangDID.deployed();
    assert.ok(newfangDID.address, 'Newfang DID  Register deployed');
  });

  it('Create an DID', async () => {
    let tx = await newfangDID.functions.createDID(IDs[0]);
    await tx.wait();
    assert.ok(await newfangDID.functions.owners(IDs[0]) === await wallet.getAddress(),
      "Owner should be the person who calls the function");
  });

  it('Create an DID with same ID', async () => {
    try {
      let tx = await newfangDID.functions.createDID(IDs[0]);
      await tx.wait();
      assert(false, 'Should get an error');
    } catch (e) {
      assert.ok(e.message.includes('revert'), e.message)
    }
  });

});


describe('Contract functions', async () => {
  it('Share a file', async () => {
    let tx = await newfangDID.functions.share(IDs[0], accounts[1], AccessTypes["read"],
      ethers.utils.hashMessage("asdf"), 120);
    await tx.wait();
    let ACK = (await newfangDID.functions.accessSpecifier(IDs[0], AccessTypes["read"], accounts[1]));
    assert.ok(ACK.encrypted_key !== "0x0000000000000000000000000000000000000000000000000000000000000000",
      "encrypted key's hash not set");
    assert.ok(parseInt(ACK.validity) !== 0, "Validity can not be 0")
  });

  it('share file with zero validity period', async () => {
    try {
      let tx = await newfangDID.functions.share(IDs[0], accounts[2], AccessTypes["read"],
        ethers.utils.hashMessage("asdf"), 0);
      await tx.wait();
      assert(false, 'Should get an error');
    } catch (e) {
      assert.ok(e.message.includes('revert'), e.message)
    }
  });


  it('share file with without owning the file', async () => {
    try {
      let tx = await newfangDID.connect(provider.getSigner(accounts[1])).functions.share(IDs[0], accounts[3], AccessTypes["read"],
        ethers.utils.hashMessage("asdf"), 120);
      await tx.wait();
      assert(false, 'Should get an error');
    } catch (e) {
      assert.ok(e.message.includes('revert'), e.message)
    }
  });

  it('Get Key hash', async () => {
    let tx = await newfangDID.connect(provider.getSigner(accounts[1])).functions.getKeyHash(IDs[0], AccessTypes["read"]);
    let ACK = await newfangDID.functions.accessSpecifier(IDs[0], AccessTypes["read"], accounts[1]);
    let data = await tx.wait();
    assert.ok( data.events[0].args[0] === ACK.encrypted_key && parseInt(data.events[0].args[1]) === parseInt(ACK.validity), "Wrong data" );
  });

  it('Update file access', async () => {
    let tx = await newfangDID.functions.share(IDs[0], accounts[1], AccessTypes["read"],
      ethers.utils.hashMessage("asdfasdf"), 120);
    await tx.wait();
    let ACK = (await newfangDID.functions.accessSpecifier(IDs[0], AccessTypes["read"], accounts[1]));
    assert.ok(ACK.encrypted_key === ethers.utils.hashMessage("asdfasdf"),
      "encrypted key's hash not updated");
  });

  it('Change File Owner', async () => {
    let tx = await newfangDID.functions.changeFileOwner(IDs[0], accounts[1]);
    await tx.wait();
    assert.ok(await newfangDID.owners(IDs[0]) === accounts[1], "owner do not match");
  });

});

describe('Signed Functions', async () => {
  it('Get Key hash Signed', async () => {
    let payload = ethers.utils.defaultAbiCoder.encode([ "bytes32", "bytes32", "uint256" ], [ IDs[0], AccessTypes.read, await newfangDID.functions.nonce(accounts[1])]);
    let payloadHash = ethers.utils.keccak256(payload);
    let signature = await provider.getSigner(accounts[1]).signMessage(ethers.utils.arrayify(payloadHash));
    let sig = ethers.utils.splitSignature(signature);
    let tx = await newfangDID.functions.getKeyHashSigned(IDs[0], AccessTypes.read, accounts[1], sig.v, sig.r, sig.s);
    let data = await tx.wait();
    let ACK = (await newfangDID.functions.accessSpecifier(IDs[0], AccessTypes["read"], accounts[1]));
    assert.ok( data.events[0].args[0] === ACK.encrypted_key && parseInt(data.events[0].args[1]) === parseInt(ACK.validity), "Wrong data" );
  });

  it('Change Owner Signed', async () => {
    let payload = ethers.utils.defaultAbiCoder.encode([ "bytes32", "address", "uint256"], [ IDs[0], accounts[2], await newfangDID.functions.nonce(accounts[1])]);
    let payloadHash = ethers.utils.keccak256(payload);
    let signature = await provider.getSigner(accounts[1]).signMessage(ethers.utils.arrayify(payloadHash));
    let sig = ethers.utils.splitSignature(signature);
    let tx = await newfangDID.functions.changeOwnerSigned(IDs[0], accounts[2], accounts[1], sig.v, sig.r, sig.s);
    await tx.wait();
    assert.ok(await newfangDID.owners(IDs[0]) === accounts[2], "owner do not match");
  });

  it('Create DID Signed', async () => {
    let payload = ethers.utils.defaultAbiCoder.encode([ "bytes32", "uint256"], [ IDs[2], await newfangDID.functions.nonce(accounts[1])]);
    let payloadHash = ethers.utils.keccak256(payload);
    let signature = await provider.getSigner(accounts[1]).signMessage(ethers.utils.arrayify(payloadHash));
    let sig = ethers.utils.splitSignature(signature);
    let tx = await newfangDID.functions.createDIDSigned(IDs[2], accounts[1], sig.v, sig.r, sig.s);
    await tx.wait();
    assert.ok(await newfangDID.owners(IDs[2]) === accounts[1], "owner do not match");
  });



});
