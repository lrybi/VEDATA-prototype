export PATH=$(pwd)/bin:$PATH
export GENESIS_VERIFICATION_KEY=$(curl https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-preprod/genesis.vkey 2> /dev/null)
export ANCILLARY_VERIFICATION_KEY=$(curl https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-preprod/ancillary.vkey 2> /dev/null)
export AGGREGATOR_ENDPOINT=https://aggregator.release-preprod.api.mithril.network/aggregator
export CARDANO_NODE_SOCKET_PATH=/home/lelan/node.socket
export CARDANO_NODE_NETWORK_ID=1

export CARDANO_NODE_SOCKET_PATH=/home/lelan/node.socket
export CARDANO_TESTNET_MAGIC=1
export CREDENTIALS_PATH=credentials

export SCRIPT_UTXO_TXIX=c20b459b9e90eafc45978c7eff203b04e7d5db32692183e9e8a4758fcd8295a0#0
export ALICE_UTXO_L1="9a743c06e3df869fb35576619ef43fce5354e4d4dd85437b31993faea7ae50f8#5"


cardano-node run \
  --config config.json \
  --topology topology.json \
  --socket-path /home/lelan/node.socket \
  --database-path db

cardano-cli query tip


cardano-cli query protocol-parameters \
  | jq '.txFeeFixed = 0 |.txFeePerByte = 0 | .executionUnitPrices.priceMemory = 0 | .executionUnitPrices.priceSteps = 0' \
  > protocol-parameters.json


export SCRIPT_UTXO_TXIX=$(cardano-cli query utxo --address $(cat script.addr) --testnet-magic $CARDANO_TESTNET_MAGIC --output-json | jq -r 'keys[1]')
echo "Captured script UTxO TxIn: $SCRIPT_UTXO_TXIX"

echo "# UTxO of alice-funds"
cardano-cli query utxo --address $(cat credentials/alice-funds.addr) --out-file /dev/stdout | jq


cardano-cli conway transaction build-raw \
  --tx-in $SCRIPT_UTXO_TXIX \
  --tx-in-script-file attestationcontract.plutus \
  --tx-in-inline-datum-present \
  --tx-in-redeemer-file redeemer.json \
  --tx-in-execution-units '(10000000, 1000000)' \
  --tx-in $ALICE_UTXO_L1 \
  --tx-out $(cat script.addr)+2000000\
  --tx-out "$(cat credentials/alice-funds.addr)+5000000" \
  --fee 0 \
  --out-file tx.json

UTXOS_JSON=$(cardano-cli query utxo \
  --tx-in ${SCRIPT_UTXO_TXIX} \
  --tx-in ${ALICE_UTXO_L1} \
  --testnet-magic $CARDANO_TESTNET_MAGIC \
  --output-json) && echo "$UTXOS_JSON"


hydra_version=1.2.0
hydra-node \
  --node-id "alice-node" \
  --persistence-dir persistence-alice \
  --cardano-signing-key credentials/alice-node.sk \
  --hydra-signing-key credentials/alice-hydra.sk \
  --hydra-scripts-tx-id $(curl -s https://raw.githubusercontent.com/cardano-scaling/hydra/master/hydra-node/networks.json | jq -r ".preprod.\"${hydra_version}\"") \
  --ledger-protocol-parameters protocol-parameters.json \
  --testnet-magic 1 \
  --node-socket /home/lelan/node.socket \
  --api-port 10005 \
  --api-host 127.0.0.1 \
  --listen 127.0.0.1:5001 \
  --peer 127.0.0.1:5002 \
  --hydra-verification-key credentials/bob-hydra.vk \
  --cardano-verification-key credentials/bob-node.vk

hydra_version=1.2.0
hydra-node \
  --node-id "bob-node" \
  --persistence-dir persistence-bob \
  --cardano-signing-key credentials/bob-node.sk \
  --hydra-signing-key credentials/bob-hydra.sk \
  --hydra-scripts-tx-id $(curl -s https://raw.githubusercontent.com/cardano-scaling/hydra/master/hydra-node/networks.json | jq -r ".preprod.\"${hydra_version}\"") \
  --ledger-protocol-parameters protocol-parameters.json \
  --testnet-magic 1 \
  --node-socket /home/lelan/node.socket \
  --api-port 10006 \
  --api-host 127.0.0.1 \
  --listen 127.0.0.1:5002 \
  --peer 127.0.0.1:5001 \
  --hydra-verification-key credentials/alice-hydra.vk \
  --cardano-verification-key credentials/alice-node.vk


websocat ws://127.0.0.1:10005 | jq

{ "tag": "Init" }

websocat ws://127.0.0.1:10006 | jq
websocat ws://localhost:10006 | jq


# Set variables
BLUEPRINT_JSON=$(cat tx.json)
UTXOS_JSON=$(cardano-cli query utxo --tx-in ${SCRIPT_UTXO_TXIX} --tx-in ${ALICE_UTXO_L1} --testnet-magic $CARDANO_TESTNET_MAGIC --output-json)

# Create the request body
jq -n \
  --argjson utxo "${UTXOS_JSON}" \
  --argjson blueprintTx "${BLUEPRINT_JSON}" \
  '{ "utxo": $utxo, "blueprintTx": $blueprintTx }' \
  > commit-request.json


curl -X POST --data @commit-request.json http://127.0.0.1:10005/commit > commit-tx.json


cardano-cli conway transaction sign \
  --tx-body-file commit-tx.json \
  --signing-key-file ${CREDENTIALS_PATH}/alice-funds.sk \
  --signing-key-file ${CREDENTIALS_PATH}/alice-node.sk \
  --out-file signed-tx.json

cardano-cli conway transaction submit \
  --tx-file signed-tx.json \
  --testnet-magic $CARDANO_TESTNET_MAGIC


commit empty:
curl -X POST 127.0.0.1:10006/commit --data "{}" > bob-commit-tx.json
cardano-cli latest transaction submit --tx-file bob-commit-tx.json



curl -s 127.0.0.1:10005/snapshot/utxo | jq

export SCRIPT_UTXO_IN_HYDRA=
export ALICE_UTXO_IN_HYDRA=


cardano-cli conway transaction build-raw \
  --tx-in $SCRIPT_UTXO_IN_HYDRA \
  --tx-in-script-file attestationcontract.plutus \
  --tx-in-inline-datum-present \
  --tx-in-redeemer-file redeemer.json \
  --tx-in-execution-units '(10000000, 1000000)' \
  --tx-in $ALICE_UTXO_IN_HYDRA \
  --tx-in-collateral $ALICE_UTXO_IN_HYDRA \
  --tx-out "$(cat script.addr)+2000000" \
  --tx-out-inline-datum-file new_datum.json \
  --tx-out "$(cat credentials/alice-funds.addr)+5000000" \
  --fee 0 \
  --protocol-params-file protocol-parameters.json \
  --out-file tx_update.json

cardano-cli conway transaction sign \
  --tx-body-file tx_update.json \
  --signing-key-file credentials/alice-funds.sk \
  --out-file tx_update_signed.json


cat tx_update_signed.json | jq -c '{tag: "NewTx", transaction: .}' | websocat ws://127.0.0.1:10005



{ "tag": "Close" }

{ "tag": "Fanout" }



