import { exec } from "child_process";

import { WifiError } from "./error";
import { State } from "./types";
import { NETWORK_INTERFACE_STATE } from "./regex";

const commands = {
  state: "ip addr | grep -E 'eth0|wlan0'",
};

/**
 * return state of specified interface
 */
const parse_state = (address: string, int: "wlan0" | "eth0") => {
  const match = address.match(NETWORK_INTERFACE_STATE(int));

  if (!match) {
    throw new WifiError("iproute2", `state not found for interface: ${int}`);
  }

  return match[1] as "UP" | "DOWN";
};

/**
 * get state of network interface
 */
export const state = (): Promise<State> =>
  new Promise((resolve, reject) =>
    exec(commands.state, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(
          new WifiError("iproute2", error ? error.message : stderr)
        );
      }

      return resolve({
        wlan0: parse_state(stdout, "wlan0"),
        eth0: parse_state(stdout, "eth0"),
      });
    })
  );
