import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { FormattedRelativeTime } from "react-intl";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { Block } from "@src/types";
import { Box, darken, Typography } from "@mui/material";

type Props = {
  errors?: string;
  block: Block;
};

const useStyles = makeStyles()(theme => ({
  root: {
    whiteSpace: "nowrap",
    height: "40px",
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.mode === "dark" ? darken(theme.palette.grey[700], 0.50) : theme.palette.action.hover
    },
    "& td": {
      border: "none"
    }
  }
}));

export const BlockRow: React.FunctionComponent<Props> = ({ block }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <TableRow className={classes.root}>
      <TableCell align="center">
        <Link href={UrlService.block(block.height)}>
          <a>{block.height}</a>
        </Link>
      </TableCell>
      <TableCell align="center">
        <Link href={UrlService.validator(block.proposer.operatorAddress)}>
          <a>
            <Box component="span" className="text-truncate" sx={{ maxWidht: "150px" }}>
              {block.proposer.moniker}
            </Box>
          </a>
        </Link>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          color: block.transactionCount > 0 ? theme.palette.secondary.main : "initial",
          opacity: block.transactionCount > 0 ? 1 : 0.3,
          fontWeight: block.transactionCount > 0 ? "bold" : "initial"
        }}
      >
        {block.transactionCount}
      </TableCell>
      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="caption">
          <FormattedRelativeTime
            value={(new Date(block.datetime).getTime() - new Date().getTime()) / 1000}
            numeric="auto"
            unit="second"
            style="short"
            updateIntervalInSeconds={7}
          />
        </Typography>
      </TableCell>
    </TableRow>
  );
};
