/**
 * Form 字段组件统一导出
 *
 * @author ChaiMingXu, 2026/06/24
 */
export {default as Input, PasswordInput, type InputProps} from './Input'
export {default as TextArea, type TextAreaProps} from './TextArea'
export {default as NumberInput, type NumberInputProps} from './NumberInput'
export {default as Select, type SelectProps} from './Select'
export {default as Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps} from './Checkbox'
export {default as Radio, RadioGroup, type RadioProps, type RadioGroupProps} from './Radio'

/** Switch 与 Form 配合时使用 valuePropName="checked" */
export {Switch} from '@/primitives/switch'

/** 仍可直接使用的 primitives 表单原语 */
export {
  Input as PrimitiveInput,
  Textarea as PrimitiveTextarea,
} from '@/primitives/input'
export {
  Select as RadixSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/primitives/select'
