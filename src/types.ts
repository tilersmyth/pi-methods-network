export interface State {
  eth0: "UP" | "DOWN";
  wlan0: "UP" | "DOWN";
}

export interface Wifi {
  ssid: string;
  signal: number;
  quality: number;
  address?: string;
  security?: string;
  mode?: string;
  frequency?: number;
  channel?: number;
  noise?: number;
}
