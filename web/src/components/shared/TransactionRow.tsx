import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { FormattedRelativeTime } from "react-intl";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { BlockDetail, BlockTransaction } from "@src/types";
import { useSplitText } from "@src/hooks/useShortText";

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

  return (
    <TableRow>
      <TableCell>
        <Link href={UrlService.block(block.height)}>
          <a>{txHash}</a>
        </Link>
      </TableCell>
      <TableCell align="center">TYPE</TableCell>
      <TableCell align="center">{transaction.isSuccess ? "Success" : "Failed"}</TableCell>
      <TableCell align="center">AMOUNT</TableCell>
      <TableCell align="center">{transaction.fee}</TableCell>
      <TableCell align="center">
        <Link href={UrlService.transaction(transaction.hash)}>
          <a>{block.height}</a>
        </Link>
      </TableCell>
    </TableRow>
  );
};
