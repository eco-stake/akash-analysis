import { Box } from "@mui/material";
import { burningGradientStyle } from "@src/utils/colors";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const GradientText: React.FunctionComponent<Props> = ({ children }) => {
  return (
    <Box component="span" sx={{ ...burningGradientStyle }}>
      {children}
    </Box>
  );
};
