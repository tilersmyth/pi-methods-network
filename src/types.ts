export interface Scan {
    address: string;
    quality: number;
    signal: number;
    ssid: string;
    security: string;
    mode?: string;
    frequency?: number;
    channel?: number;
    noise?: number;
}