import { ripemd160, sha256 } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { decodePubkey } from "@cosmjs/proto-signing";
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

export function getTransferEvents(tx) {
  try {
    const logs = JSON.parse(tx.tx_result.log);

    let transferEvents = [];
    for (let messageIndex = 0; messageIndex < logs.length; messageIndex++) {
      const messageLogs = logs[messageIndex];
      for (const event of messageLogs.events) {
        if (event.type == "transfer") {
          if (event.attributes.length % 3 !== 0) throw "Unexpected number of attributes in transfer event";

          for (let i = 0; i < event.attributes.length; i += 3) {
            if (event.attributes[i + 2].value.includes("ibc")) continue;

            transferEvents.push({
              messageIndex: messageIndex,
              recipient: event.attributes[i].value,
              sender: event.attributes[i + 1].value,
              amount: parseAmountToUAkt(event.attributes[i + 2].value)
            });
          }
        }
      }
    }

    return transferEvents;
  } catch (err) {
    throw `Unable to parse transfer events for tx (${tx.hash}): ${err}`;
  }
}

function parseAmountToUAkt(amount: string) {
  if (amount.endsWith("uakt")) {
    return parseInt(amount.substring(0, amount.length - 4));
  } else if (amount.endsWith("akt")) {
    return parseInt(amount.substring(0, amount.length - 3)) * 1000000;
  } else {
    throw "Unrecognized amount format: " + amount;
  }
}
