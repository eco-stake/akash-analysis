import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { CSSProperties, ReactNode } from "react";

type Props = {
  height?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export const GridItem: React.FunctionComponent<Props> = ({ children, height = "auto", style = {} }) => {
  return <Item style={{ height, ...style }}>{children}</Item>;
};

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  position: "relative",
  overflow: "hidden"
}));

export default GridItem;
