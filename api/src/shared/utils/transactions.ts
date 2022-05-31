import { ripemd160, sha256 } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { Coin, decodePubkey } from "@cosmjs/proto-signing";
import { Any } from "cosmjs-types/google/protobuf/any";
import { MsgSend, MsgMultiSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { DecodedTx } from "./types";

export function getTransactionSignerAddresses(tx: DecodedTx): { multisigThreshold?: number; addresses: string[] } {
  const signerInfos = tx.authInfo.signerInfos;
  if (signerInfos.length !== 1) throw "Unexpected number of signers in tx";

  const pubkey = decodePubkey(signerInfos[0].publicKey);
  if (pubkey.type === "tendermint/PubKeySecp256k1") {
    const pubKeyBuffer = Buffer.from(pubkey.value, "base64");
    return {
      multisigThreshold: null,
      addresses: [toBech32("akash", rawSecp256k1PubkeyToRawAddress(pubKeyBuffer))]
    };
  } else if (pubkey.type === "tendermint/PubKeyMultisigThreshold") {
    return {
      multisigThreshold: pubkey.value.threshold,
      addresses: pubkey.value.pubkeys.map((p) => {
        const pubKeyBuffer = Buffer.from(p.value, "base64");
        return toBech32("akash", rawSecp256k1PubkeyToRawAddress(pubKeyBuffer));
      })
    };
  } else {
    throw "Unrecognized pubkey type: " + JSON.stringify(pubkey);
  }
}

// Copied from https://github.com/cosmos/cosmjs/blob/79396bfaa49831127ccbbbfdbb1185df14230c63/packages/tendermint-rpc/src/addresses.ts
// Found with help of https://github.com/cosmos/cosmjs/issues/1016
function rawSecp256k1PubkeyToRawAddress(pubkeyData: Uint8Array): Uint8Array {
  if (pubkeyData.length !== 33) {
    throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
  }
  return ripemd160(sha256(pubkeyData));
}

export function getMessageInfo(msg: Any) {
  switch (msg.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend":
      const msgSend = MsgSend.decode(msg.value);

      return {
        amount: parseAmount(msgSend.amount),
        addressReferences: [
          { type: "recipient", address: msgSend.toAddress },
          { type: "sender", address: msgSend.fromAddress }
        ]
      };

    case "/cosmos.bank.v1beta1.MsgMultiSend":
      const msgMultiSend = MsgMultiSend.decode(msg.value);

      return {
        addressReferences: [
          ...msgMultiSend.inputs.map((input) => ({ type: "sender", address: input.address })),
          ...msgMultiSend.outputs.map((output) => ({ type: "recipient", address: output.address }))
        ]
      };
  }

  return {};
}

function parseAmount(amount: Coin[]) {
  if (amount.length !== 1) {
    throw new Error("Unexpected number of coins in tx: " + JSON.stringify(amount));
  }

  if (amount[0].denom === "uakt") {
    return parseInt(amount[0].amount);
  } else if (amount[0].denom === "akt") {
    return parseInt(amount[0].amount) * 1_000_000;
  } else {
    return null;
    //throw new Error("Unexpected coin denom in tx: " + amount[0].denom);
  }
}
