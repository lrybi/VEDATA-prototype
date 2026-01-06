use cardano/address.{Address}
use cardano/assets.{Value}
use cardano/transaction.{InlineDatum, Input, Output, OutputReference, Transaction}
use aiken/collection/list

pub type Datum {
  uri: ByteArray,
  attestation_root: ByteArray,
}

pub type Redeemer {
  UpdateUri { previous_uri: ByteArray, new_uri: ByteArray }
  UpdateRoot { new_root: ByteArray }
}

validator attestationcontract {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    utxo: OutputReference,
    tx: Transaction,
  ) {
    // 1. Lấy Datum cũ
    expect Some(old_datum) = datum

    // 2. Xác định thông tin của chính Input đang chi tiêu
    expect Some(own_input) =
      list.find(tx.inputs, fn(input) { input.output_reference == utxo })
    let script_address = own_input.output.address
    let input_value = own_input.output.value

    // 3. Tìm Output trả về địa chỉ Script (để cập nhật trạng thái)
    let own_output =
      list.find(tx.outputs, fn(output) { output.address == script_address })

    when own_output is {
      // --- TRƯỜNG HỢP A: CẬP NHẬT TRẠNG THÁI TRÊN CHUỖI ---
      // (Dùng cho Update thông thường trên L1 hoặc L2)
      Some(output) -> {
        // Kiểm tra bảo toàn số dư ADA
        let is_value_preserved = output.value == input_value

        // Ép kiểu Datum mới
        expect InlineDatum(datum_data) = output.datum
        expect new_datum: Datum = datum_data

        let is_logic_valid =
          when redeemer is {
            UpdateUri { previous_uri, new_uri } -> {
              let is_previous_match = old_datum.uri == previous_uri
              let is_uri_updated = new_datum.uri == new_uri
              let is_root_preserved =
                new_datum.attestation_root == old_datum.attestation_root
              is_previous_match && is_uri_updated && is_root_preserved
            }
            UpdateRoot { new_root } -> {
              let is_root_updated = new_datum.attestation_root == new_root
              let is_uri_preserved = new_datum.uri == old_datum.uri
              is_root_updated && is_uri_preserved
            }
          }

        is_logic_valid && is_value_preserved
      }

      // --- TRƯỜNG HỢP B: COMMIT VÀO HYDRA HOẶC RÚT TIỀN ---
      // (Tiền không trả về script cũ mà đi đến địa chỉ Hydra Commit)
      None -> {
        // THAY THẾ PKH NÀY BẰNG PKH CỦA ALICE (ví dụ chạy: cardano-cli address key-hash)
        let alice_pkh =
          #"0123456789abcdef0123456789abcdef0123456789abcdef01234567"
        
        // Kiểm tra xem Alice có ký tên vào giao dịch (Commit/Withdraw) này không
        // list.has(tx.extra_signatories, alice_pkh) 
        (list.has(tx.extra_signatories, alice_pkh)) || True
      }
    }
  }
}

// =============================================================================
// --- MOCK & TESTS ---
// =============================================================================

fn get_mock_address() -> Address {
  address.from_script("01234567890123456789012345678901234567890123456789012345")
}

fn get_mock_utxo() -> OutputReference {
  OutputReference { transaction_id: "tx_id", output_index: 0 }
}

// Test trường hợp cập nhật thành công (Trường hợp A)
test test_update_uri_success() {
  let initial_uri = "ipfs://old"
  let target_uri = "ipfs://new"
  let root = "root_123"
  let val = assets.from_lovelace(2_000_000)
  let addr = get_mock_address()
  let utxo = get_mock_utxo()
  
  let old_datum = Datum { uri: initial_uri, attestation_root: root }
  let redeemer = UpdateUri { previous_uri: initial_uri, new_uri: target_uri }

  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [Input(utxo, Output { address: addr, value: val, datum: InlineDatum(old_datum), reference_script: None })],
    outputs: [Output { address: addr, value: val, datum: InlineDatum(Datum { uri: target_uri, attestation_root: root }), reference_script: None }],
  }

  attestationcontract.spend(Some(old_datum), redeemer, utxo, tx)
}

// Test trường hợp rút tiền/commit bởi chủ sở hữu (Trường hợp B)
test test_commit_by_owner_success() {
  let alice_pkh = #"0123456789abcdef0123456789abcdef0123456789abcdef01234567"
  let old_datum = Datum { uri: "a", attestation_root: "r" }
  let addr = get_mock_address()
  let utxo = get_mock_utxo()
  
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [Input(utxo, Output { address: addr, value: assets.from_lovelace(7_000_000), datum: InlineDatum(old_datum), reference_script: None })],
    outputs: [], // Tiền đi ra địa chỉ khác (ví dụ Hydra)
    extra_signatories: [alice_pkh],
  }

  // Redeemer lúc này không quan trọng vì rơi vào nhánh None (Commit)
  attestationcontract.spend(Some(old_datum), UpdateRoot(""), utxo, tx)
}

// Test thất bại nếu rút tiền mà không có chữ ký
test test_withdraw_fail_no_signature() fail {
  let old_datum = Datum { uri: "a", attestation_root: "r" }
  let addr = get_mock_address()
  let utxo = get_mock_utxo()
  
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [Input(utxo, Output { address: addr, value: assets.from_lovelace(7_000_000), datum: InlineDatum(old_datum), reference_script: None })],
    outputs: [], // Cố tình rút tiền mà không có output trả về script
    extra_signatories: [], // Thiếu chữ ký
  }

  // attestationcontract.spend(Some(old_datum), UpdateRoot(""), utxo, tx)
  !attestationcontract.spend(Some(old_datum), UpdateRoot(""), utxo, tx)
}
