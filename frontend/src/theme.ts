// teamflow/frontend/src/theme.ts
import { createTheme } from '@mui/material/styles';

export const getLightTheme = () => createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#667eea',
        },
        secondary: {
            main: '#764ba2',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
        },
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

export const getDarkTheme = () => createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#667eea',
        },
        secondary: {
            main: '#764ba2',
        },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
        },
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});
