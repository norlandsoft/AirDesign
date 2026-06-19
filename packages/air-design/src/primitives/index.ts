/**
 * primitives 统一导出
 *
 * Radix UI 薄封装层，提供开箱即用的样式与无障碍能力。
 * 业务 components 基于这些原语组合，消费方一般不直接使用 primitives。
 *
 * @author ChaiMingXu, 2026/06/19
 */
export {Button, buttonVariants, type ButtonProps} from './button'
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog'
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet'
export {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from './tooltip'
export {Popover, PopoverTrigger, PopoverContent, PopoverAnchor} from './popover'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
} from './dropdown-menu'
export {Tabs, TabsList, TabsTrigger, TabsContent} from './tabs'
export {Input, Textarea, type InputProps, type TextareaProps} from './input'
export {Switch} from './switch'
export {Checkbox} from './checkbox'
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select'
export {Separator} from './separator'
export {ScrollArea, ScrollBar} from './scroll-area'
export {Skeleton} from './skeleton'
export {Slider} from './slider'
export {Avatar, AvatarImage, AvatarFallback} from './avatar'
export {Toaster, toast} from './sonner'
