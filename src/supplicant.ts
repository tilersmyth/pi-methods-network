import { exec } from "child_process";
import { promises } from "fs";

import { scan } from "./iwlist";
import { WifiError } from "./error";
import { Wifi } from "./types";
import {
  NETWORK_SUPPLICANT_REGEX,
  NETWORK_UNENCRYPTED_PASSPHRASE_REGEX,
  NETWORK_EXISTS_REGEX,
  ALL_NETWORKS_SUPPLICANT_REGEX,
  NETWORK_SSID,
} from "./regex";

const supplicant_path = "/etc/wpa_supplicant/wpa_supplicant.conf";

const commands = {
  wpa_passphrase: (ssid: string, password: string) =>
    `sudo wpa_passphrase "${ssid}" "${password}"`,
};

/**
 * Generate network object with encrypted passphrase
 */
const wpa_supplicant = (ssid: string, password: string): Promise<string> =>
  new Promise((resolve, reject) =>
    exec(
      commands.wpa_passphrase(ssid, password),
      async (error, stdout, stderr) => {
        if (error || stderr) {
          return reject(
            new WifiError("supplicant", error ? error.message : stderr)
          );
        }

        return resolve(stdout);
      }
    )
  );

/**
 * Read supplicant.conf file
 */
const read_supplicant = async (file_path: string): Promise<string> => {
  try {
    const file = await promises.readFile(file_path, "utf-8");
    return file;
  } catch (err) {
    throw new WifiError("supplicant", "failed to read supplicant.conf file");
  }
};

/**
 * Write to supplicant.conf file
 */
const write_supplicant = async (
  file_path: string,
  data: string
): Promise<void> => {
  try {
    await promises.writeFile(file_path, data, "utf-8");
  } catch (err) {
    throw new WifiError(
      "supplicant",
      "failed to write to supplicant.conf file"
    );
  }
};

/**
 * Find network in scan array based on SSID
 * returns scan object or undefined
 */
const find_network_in_scan = async (
  ssid: string
): Promise<Wifi | undefined> => {
  const available_networks = await scan();

  return available_networks.find(
    (n) => n.ssid.toLowerCase().trim() === ssid.toLowerCase().trim()
  );
};

/**
 * Find all networks listed in supplicant
 * returns networks string or null
 */
const find_all_networks_in_supplicant = (file: string): string[] => {
  const matchArr = file.match(ALL_NETWORKS_SUPPLICANT_REGEX);

  if (!matchArr) {
    return [];
  }

  return matchArr
    .map((network) => {
      const ssid = network.match(NETWORK_SSID);
      return ssid ? ssid[1] : "";
    })
    .filter((network) => network);
};

/**
 * Find network listed in supplicant by SSID
 * returns network string or null
 */
const find_network_in_supplicant = (
  file: string,
  ssid: string
): string | undefined => {
  const regex = NETWORK_SUPPLICANT_REGEX(ssid);
  const match = file.match(regex);

  if (!match) {
    return;
  }

  return match[0];
};

/**
 * Insert network object in file content
 */
const update_supplicant_file_content = (
  file: string,
  network: string
): string => {
  try {
    // Check if any other networks exist, ignore anything commented out
    const regex = NETWORK_EXISTS_REGEX;
    const match = file.match(regex);

    // If wpa_supplicant.conf already has network(s) listed, add this one at beginning
    if (match) {
      return `${file.slice(0, match.index)}\n${network}\n${file.slice(
        match.index
      )}`;
    }

    // Add to bottom of file
    return `${file}\n${network}`;
  } catch (err) {
    throw new WifiError(
      "supplicant",
      "failed to update wpa_supplicant.conf content"
    );
  }
};

/**
 * Find all networks (displayed by ssid) listed in wpa_supplicant.conf
 */
export const find = async (): Promise<string[]> => {
  const supplicant_file = await read_supplicant(supplicant_path);
  return find_all_networks_in_supplicant(supplicant_file);
};

/**
 * Add wifi credentials to wpa_supplicant.conf
 */
export const enable = async (ssid: string, password: string): Promise<void> => {
  if (!ssid || !password) {
    throw new WifiError("supplicant", "ssid and password required");
  }

  const supplicant_file = await read_supplicant(supplicant_path);

  // check if network is already listed in supplicant.conf
  const existing_network = find_network_in_supplicant(supplicant_file, ssid);
  if (existing_network) {
    throw new WifiError(
      "supplicant",
      `${ssid} network already exists in supplicant.conf`
    );
  }

  // check that network is available
  const network_available = await find_network_in_scan(ssid);
  if (!network_available) {
    throw new WifiError("supplicant", `${ssid} network not available`);
  }

  // Generate network object
  const raw_network_object = await wpa_supplicant(ssid, password);

  // Remove unencrypted password
  const network_object = raw_network_object.replace(
    NETWORK_UNENCRYPTED_PASSPHRASE_REGEX,
    ""
  );

  // Add network object to wpa_supplicant.conf content
  const updated_content = update_supplicant_file_content(
    supplicant_file,
    network_object.trim()
  );

  // Update wpa_supplicant.conf file
  return write_supplicant(supplicant_path, updated_content);
};

/**
 * Remove wifi credentials from wpa_supplicant.conf
 */
export const disable = async (ssid: string): Promise<void> => {
  if (!ssid) {
    throw new WifiError("supplicant", "ssid required");
  }

  const supplicant_file = await read_supplicant(supplicant_path);

  const network = find_network_in_supplicant(supplicant_file, ssid);

  if (!network) {
    throw new WifiError(
      "supplicant",
      `network (${ssid}) not found in wpa_supplicant.conf`
    );
  }

  // Remove network from wpa_supplicant.conf content
  const updated_content = supplicant_file.replace(network, "");

  // Update wpa_supplicant.conf file
  return write_supplicant(supplicant_path, updated_content);
};
