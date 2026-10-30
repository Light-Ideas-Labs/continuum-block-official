import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
  useFieldArray,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, X, Plus, Eye, EyeOff } from "lucide-react";
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "switch"
    | "password"
    | "file"
    | "multi-input";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  value?: string;
  disabled?: boolean;
  multiple?: boolean;
  isIcon?: boolean;
  initialValue?: string | number | boolean | string[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number; 
  max?: number; 
}

export const CustomFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  accept,
  className,
  inputClassName,
  labelClassName,
  disabled = false,
  multiple = false,
  isIcon = false,
  initialValue,
  onChange,
  min,
  max,
}) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);

  const renderFormControl = (
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    switch (type) {
      case "password":
        return (
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              {...field}
              className={`border-none bg-customgreys-primarybg p-4 pr-10 ${inputClassName}`}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-customgreys-dirtyGrey hover:text-white-50"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        );
      case "tel": // Handle 'tel' for phone numbers
        return (
          <div className="relative">
            <Input
            type="tel"
            placeholder={placeholder}
            {...field}
            className={`border-none bg-customgreys-primarybg p-4 ${inputClassName}`}
            disabled={disabled}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value); // Ensure this updates the form state
              // console.log(`Phone value changed for ${name}:`, value); // Debug
            }}
            value={field.value || ""} // Explicitly bind the value
          />
          </div>
        );
      case "file":
        return (
          <input
            type="file"
            onChange={onChange}
            accept={accept}
            multiple={multiple}
            className={`border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            {...field}
            rows={3}
            className={`border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
          />
        );
      case "select":
        return (
          <Select
            value={field.value || (initialValue as string)}
            defaultValue={field.value || (initialValue as string)}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={`w-full border-none bg-customgreys-primarybg p-4 ${inputClassName}`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-full bg-customgreys-primarybg border-customgreys-dirtyGrey shadow">
              {options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={`cursor-pointer hover:!bg-gray-100 hover:!text-customgreys-darkGrey`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              id={name}
              className={`text-customgreys-dirtyGrey ${inputClassName}`}
            />
            <FormLabel htmlFor={name} className={labelClassName}>
              {label}
            </FormLabel>
          </div>
        );
      case "file":
        const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
        const acceptedFileTypes = accept ? [accept] : ACCEPTED_VIDEO_TYPES;

        return (
          <FilePond
            className={`${inputClassName}`}
            files={field.value ? [field.value] : []}
            allowMultiple={multiple}
            onupdatefiles={(fileItems) => {
              field.onChange(
                multiple
                  ? fileItems.map((fileItem) => fileItem.file)
                  : fileItems[0]?.file
              );
            }}
            acceptedFileTypes={acceptedFileTypes}
            labelIdle={`Drag & Drop your files or <span class="filepond--label-action">Browse</span>`}
            credits={false}
          />
        );
        case "date":
          return (
            <Input
              type="date"
              placeholder={placeholder}
              {...field}
              className={`border-none bg-customgreys-primarybg p-4 ${inputClassName}`}
              disabled={disabled}
              value={
                field.value instanceof Date
                  ? field.value.toISOString().split("T")[0] // Format Date as YYYY-MM-DD
                  : field.value || ""
              }
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : null;
                field.onChange(dateValue); // Convert string to Date
              }}
            />
          );
      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder}
            {...field}
            className={`border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
            disabled={disabled}
            min={min}
            max={max}
          />
        );
      case "multi-input":
        return (
          <MultiInputField
            name={name}
            control={control}
            placeholder={placeholder}
            inputClassName={inputClassName}
          />
        );
      default:
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            className={`border-none bg-customgreys-primarybg p-4 ${inputClassName}`}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={initialValue}
      render={({ field }) => (
        <FormItem
          className={`${
            type !== "switch" && "rounded-md"
          } relative ${className}`}
        >
          {type !== "switch" && (
            <div className="flex justify-between items-center">
              <FormLabel
                className={`text-customgreys-dirtyGrey text-sm ${labelClassName}`}
              >
                {label}
              </FormLabel>

              {!disabled &&
                isIcon &&
                type !== "file" &&
                type !== "multi-input" && (
                  <Edit className="size-4 text-customgreys-dirtyGrey" />
                )}
            </div>
          )}
          <FormControl>
            {renderFormControl({
              ...field,
              value: field.value !== undefined ? field.value : initialValue,
            })}
          </FormControl>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
};
interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
  inputClassName?: string;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({
  name,
  control,
  placeholder,
  inputClassName,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className={`flex-1 border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
                />
              </FormControl>
            )}
          />
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="icon"
            className="text-customgreys-dirtyGrey"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append("")}
        variant="outline"
        size="sm"
        className="mt-2 text-customgreys-dirtyGrey"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};