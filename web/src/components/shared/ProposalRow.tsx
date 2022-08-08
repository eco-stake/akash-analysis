import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Link from "next/link";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { FormattedNumber, FormattedTime } from "react-intl";
import { UrlService } from "@src/utils/urlUtils";
import { ProposalSummary } from "@src/types/proposal";
import { getFriendlyProposalStatus } from "@src/utils/proposals";
import { Box, darken, useTheme } from "@mui/material";
import { useProposalStatusColor } from "@src/hooks/useProposalStatusColor";
import { makeStyles } from "tss-react/mui";

type Props = {
  errors?: string;
  proposal: ProposalSummary;
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
  },
  cell: {
    fontSize: ".75rem"
  }
}));

export const ProposalRow: React.FunctionComponent<Props> = ({ proposal }) => {
  const status = getFriendlyProposalStatus(proposal.status);
  const { classes } = useStyles();
  const statusColor = useProposalStatusColor(status);

  return (
    <TableRow className={classes.root}>
      <TableCell>#{proposal.id}</TableCell>
      <TableCell>
        <Link href={UrlService.proposal(proposal.id)}>
          <a>{proposal.title}</a>
        </Link>
      </TableCell>
      <TableCell className={classes.cell}>
        <Box sx={{ color: statusColor }}>{status}</Box>
      </TableCell>
      <TableCell className={classes.cell}>
        <FormattedTime value={proposal.submitTime} day={"numeric"} month="numeric" year="numeric" />
      </TableCell>
      <TableCell className={classes.cell}>
        <FormattedTime value={proposal.votingEndTime} day={"numeric"} month="numeric" year="numeric" />
      </TableCell>
      <TableCell className={classes.cell} align="right">
        <FormattedNumber value={udenomToDenom(proposal.totalDeposit)} />
        &nbsp;
        <AKTLabel />
      </TableCell>
    </TableRow>
  );
};
