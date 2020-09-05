import { Wifi } from "./types";

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
export const parse_wlan0 = (cell: string): Wifi | null => {
  let match: RegExpMatchArray | null;
  const scan: Wifi = {
    ssid: "",
    quality: 0,
    signal: 0,
  };

  // Required fields
  if (!(match = cell.match(/ESSID\s*[:|=]\s*"([^"]+)"/))) {
    return null;
  }
  Object.assign(scan, { ssid: match[1] });

  if (!(match = cell.match(/Quality\s*[:|=]\s*([0-9]+)/))) {
    return null;
  }
  Object.assign(scan, { quality: parseInt(match[1], 10) });

  if (!(match = cell.match(/Signal level\s*[:|=]\s*(-?[0-9]+)/))) {
    return null;
  }
  Object.assign(scan, { signal: parseInt(match[1], 10) });

  // Optional fields
  if ((match = cell.match(/Address\s*[:|=]\s*([A-Fa-f0-9:]{17})/))) {
    Object.assign(scan, { address: match[1].toLowerCase() });
  }

  const security = security_type(cell);
  if (security) {
    Object.assign(scan, { security });
  }

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

  return scan;
};
