import { createTheme } from "@material-ui/core/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  spacing: 4,
});

export default theme;