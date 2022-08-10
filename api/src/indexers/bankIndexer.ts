import { Message, Send } from "@src/db/schema";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import * as benchmark from "../shared/utils/benchmark";
import { Indexer } from "./indexer";

export class BankIndexer extends Indexer {
  msgHandlers: { [key: string]: (msgSubmitProposal: any, height: number, blockGroupTransaction, msg: Message) => Promise<void> };

  constructor() {
    super();
    this.name = "BankIndexer";
    this.msgHandlers = {
      "/cosmos.bank.v1beta1.MsgSend": this.handleSend,
    };
  }

  hasHandlerForType(type: string): boolean {
    return Object.keys(this.msgHandlers).includes(type);
  }

  @benchmark.measureMethodAsync
  async dropTables(): Promise<void> {
    await Send.drop();
  }

  async createTables(): Promise<void> {
    await Send.sync({ force: false });
  }

  private async handleSend(decodedMessage: MsgSend, height: number, dbTransaction, msg: Message) {
    const sendInfo = {
      senderAddress: decodedMessage.fromAddress,
      recipientAddress: decodedMessage.toAddress,
      createdMsgId: msg.id,
      amount: parseInt(decodedMessage.amount[0].amount),
      // memo: decodedMessage.memo,
    };

    const existingSend = await Send.findOne({ where: { senderAddress: decodedMessage.fromAddress, recipientAddress: decodedMessage.toAddress }, transaction: dbTransaction });

    if (!existingSend) {
      console.log(`Creating send from ${decodedMessage.fromAddress} to ${decodedMessage.toAddress}`);
      await Send.create(sendInfo, { transaction: dbTransaction });
    } else {
      console.log(`Updating send from ${decodedMessage.fromAddress} to ${decodedMessage.toAddress}`);
      await Send.update(sendInfo, { where: { senderAddress: decodedMessage.fromAddress, recipientAddress: decodedMessage.toAddress }, transaction: dbTransaction });
    }
  }
}
