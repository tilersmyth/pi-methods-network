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
