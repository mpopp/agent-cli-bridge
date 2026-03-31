export interface IElectronAPI {
  versions: {
    node: string
    chrome: string
    electron: string
    app: string
  }
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
