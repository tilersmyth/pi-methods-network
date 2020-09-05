import { exec } from "child_process";

import { Wifi } from "./types";
import { WifiError } from "./error";
import { parse_wlan0 } from "./utils";

const commands = {
  scan: "sudo iwlist wlan0 scan",
};

/**
 * Sort networks by signal strength
 */
const by_signal = (a: any, b: any) => {
  return b.signal - a.signal;
};

/**
 * format network cell output
 */
const parse_scan = (cell: string): Wifi[] => {
  return cell
    .split(/Cell [0-9]+ -/)
    .reduce((acc: Wifi[], network: string) => {
      const wifi = parse_wlan0(network);
      return wifi ? [wifi, ...acc] : acc;
    }, [])
    .sort(by_signal);
};

/**
 * find available public wifi networks
 */
export const scan = (): Promise<Wifi[]> =>
  new Promise((resolve, reject) =>
    exec(commands.scan, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(new WifiError("scan", error ? error.message : stderr));
      }

      return resolve(parse_scan(stdout));
    })
  );
