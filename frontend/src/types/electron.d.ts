export interface IElectronAPI {
  isElectron: boolean;
  githubOAuthLogin: () => void;
  onOAuthSuccess: (callback: (code: string) => void) => () => void;
  onOAuthFailure: (callback: (error: string) => void) => () => void;
  offOAuthSuccess: (callback: (code: string) => void) => void;
  offOAuthFailure: (callback: (error: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}