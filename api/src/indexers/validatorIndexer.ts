import { Message, sequelize, Validator } from "@src/db/schema";
import { MsgCreateValidator, MsgEditValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import * as benchmark from "../shared/utils/benchmark";
import { Indexer } from "./indexer";
import { ripemd160, sha256 } from "@cosmjs/crypto";
import { fromBase64, fromBech32, toBech32, toHex } from "@cosmjs/encoding";
import { IGenesis, IGenesisValidator } from "@src/akash/genesisTypes";

export class ValidatorIndexer extends Indexer {
  msgHandlers: { [key: string]: (msgSubmitProposal: any, height: number, blockGroupTransaction, msg: Message) => Promise<void> };

  constructor() {
    super();
    this.name = "ValidatorIndexer";
    this.msgHandlers = {
      "/cosmos.staking.v1beta1.MsgCreateValidator": this.handleCreateValidator,
      "/cosmos.staking.v1beta1.MsgEditValidator": this.handleEditValidator
    };
  }

  hasHandlerForType(type: string): boolean {
    return Object.keys(this.msgHandlers).includes(type);
  }

  @benchmark.measureMethodAsync
  async dropTables(): Promise<void> {
    await Validator.drop();
  }

  async createTables(): Promise<void> {
    await Validator.sync({ force: false });
  }

  @benchmark.measureMethodAsync
  async seed(genesis: IGenesis) {
    const validators = genesis.app_state.staking.validators;

    const dbTransaction = await sequelize.transaction();

    for (const validator of validators) {
      console.log("Creating validator :" + validator.operator_address);

      await this.createValidatorFromGenesis(validator, dbTransaction);
    }

    await dbTransaction.commit();
  }

  private async createValidatorFromGenesis(validator: IGenesisValidator, dbTransaction) {
    await Validator.create(
      {
        operatorAddress: validator.operator_address,
        accountAddress: toBech32("akash", fromBech32(validator.operator_address).data),
        hexAddress: toHex(this.pubkeyToRawAddress(validator.consensus_pubkey["@type"], fromBase64(validator.consensus_pubkey.key))).toUpperCase(),
        moniker: validator.description.moniker,
        identity: validator.description.identity,
        website: validator.description.website,
        description: validator.description.details,
        securityContact: validator.description.security_contact,
        rate: parseFloat(validator.commission.commission_rates.rate),
        maxRate: parseFloat(validator.commission.commission_rates.max_rate),
        maxChangeRate: parseFloat(validator.commission.commission_rates.max_change_rate),
        minSelfDelegation: parseInt(validator.min_self_delegation)
      },
      { transaction: dbTransaction }
    );
  }

  private async handleCreateValidator(decodedMessage: MsgCreateValidator, height: number, dbTransaction, msg: Message) {
    const validatorInfo = {
      operatorAddress: decodedMessage.validatorAddress,
      accountAddress: decodedMessage.delegatorAddress,
      hexAddress: toHex(this.pubkeyToRawAddress(decodedMessage.pubkey.typeUrl, decodedMessage.pubkey.value.slice(2))).toUpperCase(),
      createdMsgId: msg.id,
      moniker: decodedMessage.description.moniker,
      identity: decodedMessage.description.identity,
      website: decodedMessage.description.website,
      description: decodedMessage.description.details,
      securityContact: decodedMessage.description.securityContact,
      rate: parseFloat(decodedMessage.commission.rate),
      maxRate: parseFloat(decodedMessage.commission.maxRate),
      maxChangeRate: parseFloat(decodedMessage.commission.maxChangeRate),
      minSelfDelegation: parseInt(decodedMessage.minSelfDelegation)
    };

    const existingValidator = await Validator.findOne({ where: { operatorAddress: decodedMessage.validatorAddress }, transaction: dbTransaction });

    if (!existingValidator) {
      console.log(`Creating validator ${decodedMessage.validatorAddress}`);
      await Validator.create(validatorInfo, { transaction: dbTransaction });
    } else {
      console.log(`Updating validator ${decodedMessage.validatorAddress}`);
      await Validator.update(validatorInfo, { where: { operatorAddress: decodedMessage.validatorAddress }, transaction: dbTransaction });
    }
  }

  private async handleEditValidator(decodedMessage: MsgEditValidator, height: number, dbTransaction, msg: Message) {
    const validator = await Validator.findOne({
      where: {
        operatorAddress: decodedMessage.validatorAddress
      },
      transaction: dbTransaction
    });

    if (!validator) throw new Error(`Validator not found: ${decodedMessage.validatorAddress}`);

    if (decodedMessage.description.moniker !== "[do-not-modify]") {
      validator.moniker = decodedMessage.description.moniker;
    }
    if (decodedMessage.description.identity !== "[do-not-modify]") {
      validator.identity = decodedMessage.description.identity;
    }
    if (decodedMessage.description.website !== "[do-not-modify]") {
      validator.website = decodedMessage.description.website;
    }
    if (decodedMessage.description.details !== "[do-not-modify]") {
      validator.description = decodedMessage.description.details;
    }
    if (decodedMessage.description.securityContact !== "[do-not-modify]") {
      validator.securityContact = decodedMessage.description.securityContact;
    }
    if (decodedMessage.commissionRate) {
      validator.rate = parseFloat(decodedMessage.commissionRate);
    }
    if (decodedMessage.minSelfDelegation) {
      validator.minSelfDelegation = parseInt(decodedMessage.minSelfDelegation);
    }

    await validator.save({ transaction: dbTransaction });
  }

  // FROM https://github.com/cosmos/cosmjs/blob/79396bfaa49831127ccbbbfdbb1185df14230c63/packages/tendermint-rpc/src/addresses.ts
  private rawSecp256k1PubkeyToRawAddress(pubkeyData: Uint8Array): Uint8Array {
    if (pubkeyData.length !== 33) {
      throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
    }
    return ripemd160(sha256(pubkeyData));
  }

  // FROM https://github.com/cosmos/cosmjs/blob/79396bfaa49831127ccbbbfdbb1185df14230c63/packages/tendermint-rpc/src/addresses.ts
  private rawEd25519PubkeyToRawAddress(pubkeyData: Uint8Array): Uint8Array {
    if (pubkeyData.length !== 32) {
      throw new Error(`Invalid Ed25519 pubkey length: ${pubkeyData.length}`);
    }
    return sha256(pubkeyData).slice(0, 20);
  }

  // For secp256k1 this assumes we already have a compressed pubkey.
  private pubkeyToRawAddress(type: string, data: Uint8Array): Uint8Array {
    switch (type) {
      case "/cosmos.crypto.ed25519.PubKey":
        return this.rawEd25519PubkeyToRawAddress(data);
      case "/cosmos.crypto.secp256k1.PubKey":
        return this.rawSecp256k1PubkeyToRawAddress(data);
      default:
        // Keep this case here to guard against new types being added but not handled
        throw new Error(`Pubkey type ${type} not supported`);
    }
  }
}
