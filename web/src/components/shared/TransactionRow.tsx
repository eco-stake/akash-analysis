import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { FormattedRelativeTime } from "react-intl";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { BlockDetail, BlockTransaction } from "@src/types";
import { useSplitText } from "@src/hooks/useShortText";
import { useFriendlyMessageType } from "@src/hooks/useFriendlyMessageType";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { udenomToDemom } from "@src/utils/mathHelpers";
import Box from "@mui/material/Box";

type Props = {
  errors?: string;
  block: BlockDetail;
  transaction: BlockTransaction;
};

const useStyles = makeStyles()(theme => ({}));

export const TransactionRow: React.FunctionComponent<Props> = ({ transaction, block }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const txHash = useSplitText(transaction.hash, 6, 6);
  const firstMessageType = useFriendlyMessageType(transaction.messages[0].type);

  return (
    <TableRow>
      <TableCell>
        <Link href={UrlService.transaction(transaction.hash)}>
          <a>{txHash}</a>
        </Link>
      </TableCell>
      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
        <Chip label={firstMessageType} size="small" color="secondary" />
        <Typography variant="caption">{transaction.messages.length > 1 ? " +" + (transaction.messages.length - 1) : ""}</Typography>
      </TableCell>
      <TableCell align="center">{transaction.isSuccess ? "Success" : "Failed"}</TableCell>
      <TableCell align="center">AMOUNT</TableCell>
      <TableCell align="center">
        {udenomToDemom(transaction.fee, 6)}&nbsp;
        <Box component="span" sx={{ color: theme.palette.secondary.main }}>
          AKT
        </Box>
      </TableCell>
      <TableCell align="center">
        <Link href={UrlService.block(block.height)}>
          <a>{block.height}</a>
        </Link>
      </TableCell>
    </TableRow>
  );
};
