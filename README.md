# Raspberry Pi 3 network methods

A majority of these methods require root access, so include `sudo` prior to whatever command is used to spin up server

```sh
sudo npm run start
```

## Available Methods

### Iproute2

#### Iproute2.state - indicates 'UP' or 'DOWN' state for ethernet (eth0) and wifi (wlan0)

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

<br />
