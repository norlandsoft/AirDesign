declare global {
    interface NodeRequire {
        context: (directory: string, useSubdirectories?: boolean, regExp?: RegExp) => {
            (key: string): any;
            keys(): string[];
        };
    }
}
declare const Icons: ({ name, size, color, thickness }: IconProps) => import("react/jsx-runtime").JSX.Element | null;
export default Icons;
