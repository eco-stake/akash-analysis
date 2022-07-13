import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { FormattedRelativeTime } from "react-intl";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { Block } from "@src/types";

type Props = {
  errors?: string;
  block: Block;
};

const useStyles = makeStyles()(theme => ({}));

export const BlockRow: React.FunctionComponent<Props> = ({ block }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <TableRow key={block.height}>
      <TableCell align="center">
        <Link href={UrlService.block(block.height)}>
          <a>{block.height}</a>
        </Link>
      </TableCell>
      <TableCell align="center">{block.proposer}</TableCell>
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
        <FormattedRelativeTime
          value={(new Date(block.date).getTime() - new Date().getTime()) / 1000}
          numeric="auto"
          unit="second"
          updateIntervalInSeconds={7}
        />
      </TableCell>
    </TableRow>
  );
};
