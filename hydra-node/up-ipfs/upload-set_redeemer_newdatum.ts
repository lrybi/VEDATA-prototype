import lighthouse from '@lighthouse-web3/sdk'
import 'dotenv/config'

import * as fs from 'node:fs';

// Hàm chuyển chuỗi sang Hex (không cần thư viện ngoài)
const toHex = (str: string) => Buffer.from(str, 'utf8').toString('hex');

const PRE_CID = "bafkreih5bv6oayhhgr5xkliwmuy4yqrr3xriro2vuuz2veb42y5ue74efi";

const NEW_MERKLE_ROOT = "new-merkle-root-hash-v3";


const apiKey = process.env.LIGHTHOUSE_API_KEY!

async function uploadImageToLighthouse(imagePath:string) {
  const imageUploadResponse = await lighthouse.upload(imagePath, apiKey);
  if (!imageUploadResponse.data.Hash) {
    throw new Error('Failed to upload image to Lighthouse');
  }
  return imageUploadResponse.data.Hash;
}
const gateway = 'https://gateway.lighthouse.storage/ipfs/'
const imagePath = "images/durian-fruit-tree-is-almost-ready-be-harvested_.png";
const imageCID = await uploadImageToLighthouse(imagePath);
console.log("Image CID:", imageCID);


const metadata_a = {
    NFT: {
      Asset_Name: "Durian Tree 1",
      Policy_ID: "de9dc0605f856b371060f268ea9d53e43009796db8353fe512df1c51",
      Asset_ID: "asset1rfj02xz0srznqzax2742ypmnsdtmxagln6mtx4"
    },
    // Type: 'Durian',
    // Timestamp: 'Timestamp 1',
    // Total_Fruits: 3,
    // Fruits_InDepth: {"Fruit 1": "...", "Fruit n": "..."},
    
    image: gateway+imageCID,
    Previous_URI: gateway+PRE_CID   
}
const metadata_b = {
    NFT: {
      Asset_Name: "Charging Station 1",
      Policy_ID: "de9dc0605f856b371060f268ea9d53e43009796db8353fe512df1c51",
      Asset_ID: "asset1vmpjprhy78l0r4v0dx03a5ecxa72vtdqs6ve5q"
    },
    Type: 'Charging Station',
    Timestamp: 'Timestamp 2',
    Power_consumption: '9 kW',
    status: 'in use', // 'available' or 'in use'
    
    previous_uri: gateway+PRE_CID   
}


const jsonString = JSON.stringify(metadata_b)

async function main() {

  // // Kịch bản 1: Cập nhật URI (Redeemer constructor 0)
    // const res = await lighthouse.uploadText(jsonString, apiKey, 'metadata')
    // console.log(res)
    
  
    // const NEW_URI = gateway+res.data.Hash;
    // const PRE_URI = gateway+PRE_CID;
  
    // const redeemer = {
    //   constructor: 0,
    //   fields: [
    //     { bytes: toHex(PRE_URI) }, // previous_uri
    //     { bytes: toHex(NEW_URI) }      // new_uri
    //   ]
    // };
    // //const CURRENT_ROOT = "initial-root-hash";
    // const CURRENT_ROOT = "new-merkle-root-hash-v2";
    // const newDatum = {
    //   constructor: 0,
    //   fields: [
    //     { bytes: toHex(NEW_URI) },     // uri mới
    //     { bytes: toHex(CURRENT_ROOT) } // root giữ nguyên
    //   ]
    // };
    
    
    // Kịch bản 2: Cập nhật Root 
    const PRE_URI = gateway+PRE_CID;
    const redeemer = {
      constructor: 1, 
      fields: [
        { bytes: toHex(NEW_MERKLE_ROOT) } // new_root
      ]
    };
    const newDatum = {
      constructor: 0,
      fields: [
        { bytes: toHex(PRE_URI) }, // uri giữ nguyên
        { bytes: toHex(NEW_MERKLE_ROOT) }     // root mới
      ]
    };
    
    
    // --- GHI FILE ---
    fs.writeFileSync('../redeemer.json', JSON.stringify(redeemer, null, 2));
    fs.writeFileSync('../new_datum.json', JSON.stringify(newDatum, null, 2));
    
    console.log("✅ Đã tạo redeemer và new_datum");
}

main().catch(console.error)

// https://gateway.lighthouse.storage/ipfs/CID