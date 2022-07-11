import Container from "@mui/material/Container";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const PageContainer: React.FunctionComponent<Props> = ({ children }) => {
  return <Container sx={{ paddingTop: { xs: "1rem", sm: "2rem" }, paddingBottom: "2rem", marginLeft: "0" }}>{children}</Container>;
};

export default PageContainer;
