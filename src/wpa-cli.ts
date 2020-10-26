import { exec } from "child_process";

import { Wifi } from "./types";
import { WifiError } from "./error";
import { parse_wlan0 } from "./utils";

const commands = {
  reconfigure: "wpa_cli -i wlan0 reconfigure",
};

/**
 * Reconfigure the interface after any changes are made
 */
export const reconfigure = (): Promise<string> =>
  new Promise((resolve, reject) =>
    exec(commands.reconfigure, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(new WifiError("wpa-cli", error ? error.message : stderr));
      }

      return resolve(stdout);
    })
  );
