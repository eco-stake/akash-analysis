import { darken, useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { BlockTransaction } from "@src/types";
import { getSplitText } from "@src/hooks/useShortText";
import { useFriendlyMessageType } from "@src/hooks/useFriendlyMessageType";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { udenomToDenom } from "@src/utils/mathHelpers";
import Box from "@mui/material/Box";
import { FormattedRelativeTime } from "react-intl";
import { FormattedDecimal } from "./FormattedDecimal";

type Props = {
  errors?: string;
  isSimple?: boolean;
  blockHeight: number;
  transaction: BlockTransaction;
};

const useStyles = makeStyles()(theme => ({
  root: {
    whiteSpace: "nowrap",
    height: "40px",
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.mode === "dark" ? darken(theme.palette.grey[700], 0.5) : theme.palette.action.hover
    },
    "& td": {
      border: "none"
    }
  }
}));

export const TransactionRow: React.FunctionComponent<Props> = ({ transaction, blockHeight, isSimple }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const txHash = getSplitText(transaction.hash, 6, 6);
  const firstMessageType = useFriendlyMessageType(transaction.messages[0].type);

  return (
    <TableRow className={classes.root}>
      <TableCell>
        <Link href={UrlService.transaction(transaction.hash)}>
          <a target="_blank">{txHash}</a>
        </Link>
      </TableCell>
      <TableCell align="center">
        <Chip
          label={firstMessageType}
          size="small"
          color="secondary"
          sx={{ height: "1rem", fontSize: ".75rem", maxWidth: "120px" }}
          className="text-truncate"
        />
        <Typography variant="caption">{transaction.messages.length > 1 ? " +" + (transaction.messages.length - 1) : ""}</Typography>
      </TableCell>
      {!isSimple && (
        <>
          <TableCell align="center">{transaction.isSuccess ? "Success" : "Failed"}</TableCell>
          <TableCell align="center">AMOUNT</TableCell>
          <TableCell align="center">
            <FormattedDecimal value={udenomToDenom(transaction.fee, 6)} />
            &nbsp;
            <Box component="span" sx={{ color: theme.palette.secondary.main }}>
              AKT
            </Box>
          </TableCell>
        </>
      )}
      <TableCell align="center">
        <Link href={UrlService.block(blockHeight)}>
          <a>{blockHeight}</a>
        </Link>
      </TableCell>
      <TableCell align="center">
        <Typography variant="caption">
          <FormattedRelativeTime
            value={(new Date(transaction.datetime).getTime() - new Date().getTime()) / 1000}
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
