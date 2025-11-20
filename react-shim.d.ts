// Minimal React/JSX definitions for environments without @types/react

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => JSX.Element | null;
  export interface ErrorInfo {
    componentStack?: string;
  }
  export class Component<P = {}, S = {}> {
    constructor(props: P);
    props: P;
    state: S;
    setState(state: Partial<S>): void;
  }
  export const useState: <T = any>(initial?: T) => [T, (value: T) => void];
  export const useEffect: any;
  export const useMemo: any;
  export const useCallback: any;
  export const useRef: <T = any>(initial?: T | null) => { current: T | null };
  export const useContext: any;
  export default {} as any;
}

declare namespace React {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => JSX.Element | null;
  export interface ErrorInfo {
    componentStack?: string;
  }
  export class Component<P = {}, S = {}> {
    constructor(props: P);
    props: P;
    state: S;
    setState(state: Partial<S>): void;
  }
  export type ComponentProps<T> = any;
  export interface DOMAttributes<T> {
    [key: string]: any;
  }
  export interface HTMLAttributes<T> extends DOMAttributes<T> {
    className?: string;
    [key: string]: any;
  }
  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface ChangeEvent<T = any> {
    target: T;
  }
}

declare module 'react-dom' {
  const ReactDOM: any;
  export default ReactDOM;
}

declare interface ImportMetaEnv {
  VITE_GEMINI_API_KEY?: string;
  DEV?: boolean;
}

declare interface ImportMeta {
  env: ImportMetaEnv;
}
