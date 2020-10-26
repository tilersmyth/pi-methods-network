import { exec } from "child_process";

import { WifiError } from "./error";
import { NETWORK_INTERFACE_STATE, NETWORK_INTERFACE_ADDR } from "./regex";

type IpState = "UP" | "DOWN";

const commands = {
  state: "ip addr | grep -E 'eth0|wlan0'",
};

/**
 * get state of network interface
 */
export const state = (int: "wlan0" | "eth0"): Promise<IpState> =>
  new Promise((resolve, reject) =>
    exec(commands.state, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(
          new WifiError("iproute2", error ? error.message : stderr)
        );
      }

      const match = stdout.match(NETWORK_INTERFACE_STATE(int));

      if (!match) {
        throw new WifiError(
          "iproute2",
          `state not found for interface: ${int}`
        );
      }

      return resolve(match[1] as IpState);
    })
  );

/**
 * Get IP address of interface, return NULL if not connected
 */
export const addr = (int: "wlan0" | "eth0"): Promise<string | null> =>
  new Promise((resolve, reject) =>
    exec(commands.state, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(
          new WifiError("iproute2", error ? error.message : stderr)
        );
      }

      const match = stdout.match(NETWORK_INTERFACE_ADDR(int));

      if (!match) {
        return resolve(null);
      }

      return resolve(match[1]);
    })
  );
