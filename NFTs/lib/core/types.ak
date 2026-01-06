// use aiken/crypto.{VerificationKeyHash}

// pub type ContractState {
//     Funded
// }

// pub type Datum {
//     aladin: VerificationKeyHash,
//     genie: VerificationKeyHash,
//     payment_amount: Int,
//     state: ContractState,
// }

pub type Redeemer {
    ApprovePayment
}

/// The metadatum can only be removed or updated.
pub type CIP68Redeemer {
  UpdateMeta
  RemoveMeta
}

/// The ref and nft tokens can be minted or burned.
pub type MintRedeemer {
  MintTokens
  BurnTokens
}