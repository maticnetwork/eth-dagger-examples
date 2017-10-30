# eth-dagger-examples

This repository contains examples for [dagger](https://matic.network/dagger).

**Watch multisig wallet's outgoing transactions**

Detect multisig wallet out-going transaction and save it to Airtable - in realtime. That way, anyone can get notification, email or slack/rocket chat message by connecting airtable to zapier/IFTTT.

```bash
$ npm install

# need to set following ENV
# $ set AIRTABLE_API_KEY={AIRTABLE_API_KEY}
# $ set AIRTABLE_BASE={AIRTABLE_BASE}
# $ set AIRTABLE_BASE_TABLE={AIRTABLE_BASE_TABLE}

# aragon multisig wallet
# $ set MULTISIG_WALLET_ADDRESS=0xcafe1a77e84698c83ca8931f54a755176ef75f2c

$ npm run multisig-wallet
```

Here is an example of hot Airtable table for Aragon multi-sig wallet which tracks outgoing txs:

https://airtable.com/shrHxVJV6tPZIPA8G

### License

MIT
