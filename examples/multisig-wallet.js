//
// Detect multisig wallet out-going transaction and save it to Airtabel - in realtime.
// That way, anyone can get notification, email or slack/rocket chat message
// by connecting airtable to zapier/IFTTT
//

var Airtable = require("airtable");
var Dagger = require("eth-dagger");
var Web3 = require("web3");

var MultisigWalletABI = require("./abi/MultisigWallet").abi;
var config = require("../config");

// dagger server
var dagger = new Dagger(config.DAGGER_URL);
var web3 = new Web3(new Web3.providers.HttpProvider(config.INFURA_URL));

// base
var base = new Airtable({
  apiKey: config.AIRTABLE_API_KEY // API for airtable
}).base(config.AIRTABLE_BASE); // Base for airtable tabels

// Multisig wallet address
var WalletAddress = config.MULTISIG_WALLET_ADDRESS;

// contract
var web3Contract = new web3.eth.Contract(MultisigWalletABI, WalletAddress);

// add new record
function addOutTxRecord(block, tx, walletTx) {
  base(config.AIRTABLE_BASE_TABLE).create(
    {
      to: walletTx.destination.toLowerCase(),
      amount: web3.utils.fromWei(walletTx.value, "ether"),
      timestamp: block.timestamp,
      tx: tx.hash,
      from: tx.from.toLowerCase(),
      block: tx.blockNumber,
      // "gas-used": tx.gas,
      "gas-price": web3.utils.fromWei(tx.gasPrice, "gwei")
    },
    { typecast: true },
    function(err, record) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("New record created: ", record.getId());
    }
  );
}

// process execution event
function processEvent(contract, executionEvent) {
  const mt = parseInt(executionEvent.returnValues.transactionId);
  console.log("Fetching executed block/transaction info...");
  Promise.all([
    web3.eth.getBlock(executionEvent.blockNumber), // block
    web3.eth.getTransaction(executionEvent.transactionHash), // tx
    contract.methods.transactions(mt).call() // wallet tx info
  ]).then(function(result) {
    // add tx record
    addOutTxRecord(result[0], result[1], result[2]);
  });
}

// to test with past events
function pastWalletEvent(contract, fromBlock) {
  // web3 contract
  console.log("Fetching recent execution event...");
  contract.getPastEvents(
    "Execution",
    {
      fromBlock: fromBlock
    },
    function(e, events) {
      if (events.length > 0) {
        const executionEvent = events[0];
        processEvent(contract, executionEvent);
      }
    }
  );
}

// start listening
function startListening(web3Contract) {
  // dagger contract
  var contract = dagger.contract(web3Contract);
  var filter = contract.events.Execution({
    room: "latest"
  });

  // watch
  filter.watch(function(data, removed) {
    console.log("New transaction detected...");
    processEvent(web3Contract, data);
  });
}

// Testing purpose
// pastWalletEvent(web3Contract, 4451374);

// To start listening
startListening(web3Contract);
