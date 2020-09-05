/**
 * Extracts network from wpa_supplicant.conf by ssid
 * [^(?!#).+$]network={ - exclude lines that start with # (comment) but must have 'network={'
 * \\n\\s[^}] - line break and space but should not hit closed curly brace yet
 * *ssid="${SSID}" - must match ssid
 * [^}]*} - capture all until next closing curly brace
 */
export const NETWORK_SUPPLICANT_REGEX = (SSID: string) =>
  new RegExp(`[^(?!#).+$]network={\\n\\s[^}]*ssid="${SSID}"[^}]*}`);

/**
 * Extracts networks from wpa_supplicant.conf
 * [^(?!#).+$]network={ - exclude lines that start with # (comment) but must have 'network={'
 * \\n\\s[^}]*ssid= - line break and space but should not hit closed curly brace until after ssid
 * [^}]*} - capture all until next closing curly brace
 */
export const ALL_NETWORKS_SUPPLICANT_REGEX = new RegExp(
  "[^(?!#).+$]network={\\n\\s[^}]*ssid=[^}]*}",
  "g"
);

/**
 * Identifies unencrypted passphrase in network object returned from wpa_passphrase command
 * #psk=.* - capture whole line starting with '#psk='
 * \\n\\s* - include line break and space until next character
 */
export const NETWORK_UNENCRYPTED_PASSPHRASE_REGEX = new RegExp(
  "#psk=.*\\n\\s*"
);

/**
 * Identifies existence of network object in wpa_supplicant.conf
 * [^(?!#).+$]network={ - exclude lines that start with # (comment) but must have 'network={'
 */
export const NETWORK_EXISTS_REGEX = new RegExp("[^(?!#).+$]network={");

/**
 * Looks for ssid in network string
 * ssids*=s* - find string 'ssid' followed by '='; allowing for spaces
 * "([^"]+)" - get value between quotes
 */
export const NETWORK_SSID = new RegExp('ssids*=s*"([^"]+)"');

/**
 * Extracts state for ethernet (eth0) and wifi (wlan0)
 * ${int}.*state - get 'state' immediately following specified interface
 * \\s+([^\\s]+) - after space get contents until next space
 */
export const NETWORK_INTERFACE_STATE = (int: "wlan0" | "eth0") =>
  new RegExp(`${int}.*state\\s+([^\\s]+)`);
