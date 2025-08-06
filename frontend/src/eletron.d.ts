export interface IElectronAPI {
  isElectron: boolean;
}
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}