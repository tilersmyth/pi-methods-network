import { exec } from "child_process";

import { Scan } from "./types";
import { WifiError } from "./error";

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
 * Parse security type
 */
const security_type = (cell: string): string | null => {
  switch (true) {
    case /WPA2\s+Version/.test(cell):
      return "wpa2";
    case /WPA\s+Version/.test(cell):
      return "wpa";
    case /Encryption key\s*[:|=]\s*on/.test(cell):
      return "wep";
    case /Encryption key\s*[:|=]\s*off/.test(cell):
      return "open";
    default:
      return null;
  }
};

/**
 * Parses a scanned wireless network cell
 */
const parse_cell = (acc: Scan[], cell: string): Scan[] => {
  let match: RegExpMatchArray | null;
  const scan: Scan = {
    address: "",
    quality: 0,
    signal: 0,
    ssid: "",
    security: "",
  };

  // Required fields

  if (!(match = cell.match(/Address\s*[:|=]\s*([A-Fa-f0-9:]{17})/))) {
    return acc;
  }

  Object.assign(scan, { address: match[1].toLowerCase() });

  if (!(match = cell.match(/Quality\s*[:|=]\s*([0-9]+)/))) {
    return acc;
  }

  Object.assign(scan, { quality: parseInt(match[1], 10) });

  if (!(match = cell.match(/Signal level\s*[:|=]\s*(-?[0-9]+)/))) {
    return acc;
  }

  Object.assign(scan, { signal: parseInt(match[1], 10) });

  if (!(match = cell.match(/ESSID\s*[:|=]\s*"([^"]+)"/))) {
    return acc;
  }

  Object.assign(scan, { ssid: match[1] });

  const security = security_type(cell);

  if (!security) {
    return acc;
  }

  Object.assign(scan, { security });

  // Optional fields

  if ((match = cell.match(/Channel\s*([0-9]+)/))) {
    Object.assign(scan, { channel: parseInt(match[1], 10) });
  }

  if ((match = cell.match(/Frequency\s*[:|=]\s*([0-9\.]+)\s*GHz/))) {
    Object.assign(scan, { frequency: parseFloat(match[1]) });
  }

  if ((match = cell.match(/Mode\s*[:|=]\s*([^\s]+)/))) {
    Object.assign(scan, { mode: match[1].toLowerCase() });
  }

  if ((match = cell.match(/Noise level\s*[:|=]\s*(-?[0-9]+)/))) {
    Object.assign(scan, { noise: parseInt(match[1], 10) });
  }

  return [scan, ...acc];
};

/**
 * format network cell output
 */
const parse_scan = (cell: string): Scan[] => {
  return cell
    .split(/Cell [0-9]+ -/)
    .reduce(parse_cell, [])
    .sort(by_signal);
};

/**
 * find available public wifi networks
 */
export const scan = (): Promise<Scan[]> =>
  new Promise((resolve, reject) =>
    exec(commands.scan, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject(new WifiError("scan", error ? error.message : stderr));
      }

      return resolve(parse_scan(stdout));
    })
  );
