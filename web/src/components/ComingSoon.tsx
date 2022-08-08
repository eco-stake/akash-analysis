import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Button, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { Address } from "./shared/Address";
import { donationAddress, validatorAddress } from "@src/utils/constants";
import { GradientText } from "./shared/GradientText";

type Props = {};

export const ComingSoon: React.FunctionComponent<Props> = ({}) => {
  const theme = useTheme();

  return (
    <Paper sx={{ padding: 2 }} elevation={2}>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Coming soon!
      </Typography>
      <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
        You can delegate to our validator or donate to this address{" "}
        <GradientText>
          <Address address={donationAddress} isCopyable showIcon />
        </GradientText>{" "}
        to support our development!
      </Typography>

      <Box sx={{ paddingTop: "1rem" }}>
        <Link href={UrlService.validator(validatorAddress)} passHref>
          <Button variant="contained" color="secondary">
            Delegate!
          </Button>
        </Link>
      </Box>
    </Paper>
  );
};
