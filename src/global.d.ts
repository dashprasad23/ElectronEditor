export { };

declare global {
  interface Window {
    main: {
      ipcRenderer: {
        on: (channel: string, func: (...args: any[]) => void) => void;
        send: (channel: string, data: any) => void;
        invoke: (channel: string, data?: any) => Promise<any>;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
      fs: any;
      fsPromis: any;
      globalShortcut: any;
      path: any;
      os: {
        platform: string;
        homedir: string;
      };
      electron: () => string;
    };
  }
}
