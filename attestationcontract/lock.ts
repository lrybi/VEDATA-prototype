import { Asset, mConStr0, stringToHex } from "@meshsdk/core";
import { getScript, getTxBuilder, wallet } from "./common";
 
async function main() {
  const assets: Asset[] = [
    {
      unit: "lovelace",
      quantity: "7000000",
    },
  ];
 
  const utxos = await wallet.getUtxos();
  const walletAddress = (await wallet.getUsedAddresses())[0];
 
  const { scriptAddr } = getScript();
 
  // Dữ liệu ban đầu cho Datum (2 trường: uri và attestation_root)
  const initialUri = stringToHex("ipfs://initial-uri");
  const initialRoot = stringToHex("initial-root-hash");
 
  // mConStr0 đại diện cho constructor đầu tiên của Datum
  // Thứ tự trong mảng phải khớp hoàn toàn với thứ tự trong Aiken
  const datum = mConStr0([initialUri, initialRoot]);
 
  const txBuilder = getTxBuilder();
  await txBuilder
    .txOut(scriptAddr, assets)
    .txOutInlineDatumValue(datum) // Gửi kèm Datum có 2 trường
    .changeAddress(walletAddress)
    .selectUtxosFrom(utxos)
    .complete();

  const unsignedTx = txBuilder.txHex;
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  
  console.log(`Locked 7 tADA with 2-field Datum at Tx ID: ${txHash}`);
}
 
main();

// Locked 7 tADA with 2-field Datum at Tx ID: 50743fa48d9dc605cb9ef657ef34161ba7b0393c532bd4017975f394846cfd88
// Done in 37.39s.

// Locked 7 tADA with 2-field Datum at Tx ID: c55691709f84457e42d5b33374007da24f8f299958c0d5ed24239e7ce7e1ef7c
// Done in 65.12s.