import lighthouse from '@lighthouse-web3/sdk'
import 'dotenv/config'

//const text = "Sometimes, I Wish I Was A Cloud, Just Floating Along"
const apiKey = process.env.LIGHTHOUSE_API_KEY!
//const name = "shi"

async function uploadImageToLighthouse(imagePath:string) {
  const imageUploadResponse = await lighthouse.upload(imagePath, apiKey);
  if (!imageUploadResponse.data.Hash) {
    throw new Error('Failed to upload image to Lighthouse');
  }
  return `https://gateway.lighthouse.storage/ipfs/${imageUploadResponse.data.Hash}`;
}
const imagePath = "images/durian-fruit-tree-is-almost-ready-be-harvested_.png";
const imageUrl = await uploadImageToLighthouse(imagePath);
console.log("Image URL:", imageUrl);


const metadata = {
    name: 'Shikamaru',
    NFT_Trx_Hash: 'Konoha',
    image: imageUrl,
    iq: 200
}
const jsonString = JSON.stringify(metadata)

async function main() {
    const res = await lighthouse.uploadText(jsonString, apiKey, 'metadata')
    console.log(res)
}

main().catch(console.error)

// https://gateway.lighthouse.storage/ipfs/CID