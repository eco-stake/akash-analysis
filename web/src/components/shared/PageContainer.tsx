import { SxProps, Theme } from "@mui/material";
import Container from "@mui/material/Container";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

export const PageContainer: React.FunctionComponent<Props> = ({ children, sx = {} }) => {
  return <Container sx={{ paddingTop: "1rem", paddingBottom: "2rem", ...sx }}>{children}</Container>;
};

export default PageContainer;
