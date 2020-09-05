import { exec } from "child_process";

import { WifiError } from "./error";
import { parse_wlan0 } from "./utils";
import { Wifi } from "./types";

const commands = {
  status: "iwconfig wlan0",
};

/**
 * get status of wifi connection
 * will return null if wlan0 not UP
 */
export const status = (): Promise<Wifi | null> =>
  new Promise((resolve, reject) =>
    exec(commands.status, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(
          new WifiError("iwconfig", error ? error.message : stderr)
        );
      }

      return resolve(parse_wlan0(stdout));
    })
  );
