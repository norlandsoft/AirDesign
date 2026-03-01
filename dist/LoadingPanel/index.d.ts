import './index.less';
interface LoadingPanelProps {
    loading?: boolean;
    message?: string;
}
declare const LoadingPanel: ({ loading, message }: LoadingPanelProps) => false | import("react/jsx-runtime").JSX.Element;
export default LoadingPanel;
