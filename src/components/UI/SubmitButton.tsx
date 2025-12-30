import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
}

export function SubmitButton({ loading, children, disabled, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
}


