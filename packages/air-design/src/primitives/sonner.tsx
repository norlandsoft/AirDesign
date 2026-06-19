/**
 * Toaster 原语：基于 sonner 的轻提示容器
 *
 * sonner 是 shadcn 推荐的 toast 方案。业务 Message 组件统一通过此 Toaster 渲染。
 * 消费方应用应在根布局渲染一次 <Toaster />，之后即可调用 toast()。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {Toaster as SonnerToaster, toast} from 'sonner'

function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border',
          description: 'group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}

export {Toaster, toast}
