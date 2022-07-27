import { Op, Validator } from "./schema";
import fetch from "node-fetch";

export async function fetchValidatorKeybaseInfos() {
  const validators = await Validator.findAll({
    where: {
      identity: { [Op.ne]: null, [Op.ne]: "" }
    }
  });

  const requests = validators.map(async (validator) => {
    try {
      if (!/^[A-F0-9]{16}$/.test(validator.identity)) {
        console.warn("Invalid identity " + validator.identity + " for validator " + validator.operatorAddress);
        return Promise.resolve();
      }

      console.log("Fetching keybase info for " + validator.operatorAddress);
      const response = await fetch(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${validator.identity}`);

      if (response.status === 200) {
        const data = await response.json();

        if (data.status.name === "OK" && data.them.length > 0) {
          validator.keybaseUsername = data.them[0].basics?.username;
          validator.keybaseAvatarUrl = data.them[0].pictures?.primary?.url;
          await validator.save();
        }
      }

      await validator.save();
    } catch (err) {
      console.error("Error while fetching keybase info for " + validator.operatorAddress);
      throw err;
    }
  });

  await Promise.allSettled(requests);
}
