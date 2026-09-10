/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'math-field': any;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'math-field': HTMLElement & {
      value: string;
      setValue: (val: string, options?: any) => void;
      getValue: (format?: string) => string;
      focus: () => void;
      menuItems?: any[];
    };
  }
}
