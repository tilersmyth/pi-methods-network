# Raspberry Pi 3 network methods

A majority of these methods require root access, so include `sudo` prior to whatever command is used to spin up server

```sh
sudo npm run start
```

## Available Methods

### Iproute2

#### Iproute2.state - indicates 'UP' or 'DOWN' state based on interface (eth0 | wlan0)

#### Iproute2.addr - returns IP address based on interface (eth0 | wlan0) or NULL if not connected

<br />

### Iwlist

#### Iwlist.scan - find available wireless networks

<br />

### Iwconfig

#### Iwconfig.status - return status of UP wlan0 interface, returns NULL if not connected

<br />

### Supplicant

#### Supplicant.find - Find all networks (displayed by ssid) listed in wpa_supplicant.conf

#### Supplicant.enable - add network to wpa_supplicant.conf

#### Supplicant.disable - remove network from wpa_supplicant.conf

### WPA CLI

#### WpaCli.reconfigure - Reconfigure the wlan0 interface

<br />
