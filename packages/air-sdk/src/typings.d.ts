/**
 * 全局类型定义
 *
 * @author ChaiMingXu, 2026/06/19
 */

declare module '*.css';

declare module 'umi' {
  export function connect(mapStateToProps: any): (Component: React.ComponentType<any>) => React.ComponentType<any>
  export function useDispatch(): any
  export function useSelector(selector: (state: any) => any): any
}
