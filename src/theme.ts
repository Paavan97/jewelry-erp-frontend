import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5e3b63',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#5e3b63',
            },
            '&:hover fieldset': {
              borderColor: '#5e3b63',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5e3b63',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#000000',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#5e3b63',
          },
          '& .MuiOutlinedInput-input': {
            color: '#000000',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#5e3b63',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#000000',
        },
      },
    },
  },
});

