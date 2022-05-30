import base64js from "base64-js";
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export interface DecodedTx {
  authInfo: AuthInfo;
  body: TxBody;
  signatures: Uint8Array[];
}

export function fromBase64(base64String) {
  if (!base64String.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
    throw new Error("Invalid base64 string format");
  }
  return base64js.toByteArray(base64String);
}

/**
 * Takes a serialized TxRaw (the bytes stored in Tendermint) and decodes it into something usable.
 */
export function decodeTxRaw(tx: Uint8Array): DecodedTx {
  const txRaw = TxRaw.decode(tx);
  return {
    authInfo: AuthInfo.decode(txRaw.authInfoBytes),
    body: TxBody.decode(txRaw.bodyBytes),
    signatures: txRaw.signatures
  };
}
