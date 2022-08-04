import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { FormattedNumber } from "react-intl";
import { Typography } from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";

type SpecType = "cpu" | "ram" | "storage";
type Props = {
  type: SpecType;
  value: number | string;
};

export const LeaseSpecDetail: React.FunctionComponent<Props> = ({ value, type }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: ".2rem" }}>
      {type === "cpu" && <SpeedIcon sx={{ color: theme.palette.grey[600] }} fontSize="large" />}
      {type === "ram" && <MemoryIcon sx={{ color: theme.palette.grey[600] }} fontSize="large" />}
      {type === "storage" && <StorageIcon sx={{ color: theme.palette.grey[600] }} fontSize="large" />}

      <Box sx={{ marginLeft: ".5rem" }}>{typeof value === "string" ? value : <FormattedNumber value={value} />}</Box>
      <Box sx={{ color: theme.palette.grey[500], marginLeft: ".5rem" }}>
        <Typography variant="caption">
          {type === "cpu" && "vCPU"}
          {type === "ram" && "RAM"}
          {type === "storage" && "Disk"}
        </Typography>
      </Box>
    </Box>
  );
};
