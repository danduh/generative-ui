export interface IModule {
  /**
   * Unique identifier for the module
   */
  id: string;

  /**
   * Display name of the module
   */
  name: string;

  /**
   * Remote entry URL for the module (Module Federation)
   */
  remoteEntry: string;

  /**
   * Remote module name (as exposed by Module Federation)
   */
  remoteModule: string;

  /**
   * Component name exported by the remote module
   */
  exposedComponent: string;

  /**
   * Render function for the module (dynamically loaded)
   */
  render: (props: IModuleProps) => Promise<Element>;
}

/**
 * Props passed to all module components
 */
export interface IModuleProps {
  parameters?: Record<string, unknown>;
  setFurtherInstructions: (instructions: string) => void;
}
