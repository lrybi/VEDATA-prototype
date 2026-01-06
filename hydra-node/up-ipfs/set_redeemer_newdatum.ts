import * as fs from 'node:fs';

// Hàm chuyển chuỗi sang Hex (không cần thư viện ngoài)
const toHex = (str: string) => Buffer.from(str, 'utf8').toString('hex');

// --- CẤU HÌNH DỮ LIỆU TẠI ĐÂY ---
const PRE_URI = "ipfs://initial-uri";
const CURRENT_ROOT = "initial-root-hash";

const NEW_URI = "ipfs://new-uri-v2";
const NEW_ROOT = "new-root-hash-v2";

// --- CHỌN HÀNH ĐỘNG (Bật 1 trong 2 khối bên dưới) ---

// Kịch bản 1: Cập nhật URI (Redeemer constructor 0)
const redeemer = {
  constructor: 0,
  //constructor: 1, 
  fields: [
    { bytes: toHex(PRE_URI) }, // previous_uri
    { bytes: toHex(NEW_URI) }      // new_uri
    
    // { bytes: toHex(NEW_ROOT) } // new_root
  ]
};
const newDatum = {
  constructor: 0,
  fields: [
    { bytes: toHex(NEW_URI) },     // uri mới
    { bytes: toHex(CURRENT_ROOT) } // root giữ nguyên
  ]
};

/* 
// Kịch bản 2: Cập nhật Root (Bỏ comment khối này và comment khối trên nếu muốn cập nhật Root)
const redeemer = {
  constructor: 1, 
  fields: [
    { bytes: toHex(NEW_ROOT) } // new_root
  ]
};
const newDatum = {
  constructor: 0,
  fields: [
    { bytes: toHex(PRE_URI) }, // uri giữ nguyên
    { bytes: toHex(NEW_ROOT) }     // root mới
  ]
};
*/

// --- GHI FILE ---
fs.writeFileSync('../redeemer.json', JSON.stringify(redeemer, null, 2));
fs.writeFileSync('../new_datum.json', JSON.stringify(newDatum, null, 2));

console.log("✅ Đã tạo redeemer và new_datum");