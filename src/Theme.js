import React from 'react';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from './App';

export default function Theme() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const theme = React.useMemo(
		() =>
			createMuiTheme({
				palette: {
					type: prefersDarkMode ? 'dark' : 'light',
					primary: {
						light: '#aaec4c',
						main: '#8fc740',
						dark: '#6c9631',
						contrastText: '#fff',
					},
					secondary: {
						light: '#ff7961',
						main: '#f44336',
						dark: '#ba000d',
						contrastText: '#000',
					},
				},

				primary: {
					light: '#757ce8',
					main: '#3f50b5',
					dark: '#002884',
					contrastText: '#fff',
				},
				secondary: {
					light: '#ff7961',
					main: '#f44336',
					dark: '#ba000d',
					contrastText: '#000',
				},
			}),
		[prefersDarkMode]
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	);
}
