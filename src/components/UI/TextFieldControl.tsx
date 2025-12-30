import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';

interface TextFieldControlProps<T extends FieldValues> extends Omit<TextFieldProps, 'name' | 'control'> {
  name: FieldPath<T>;
  control: Control<T>;
}

export function TextFieldControl<T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: TextFieldControlProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
}



