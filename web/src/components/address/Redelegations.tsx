import { makeStyles } from "tss-react/mui";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import { IRedelegationDetail } from "@src/types/address";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { Box } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { FormattedRelativeTime } from "react-intl";

type Props = {
  redelegations: IRedelegationDetail[];
};

const useStyles = makeStyles()(theme => ({}));

export const Redelegations: React.FunctionComponent<Props> = ({ redelegations }) => {
  const { classes } = useStyles();

  return redelegations.length === 0 ? (
    <Box sx={{ padding: "1rem", display: "flex", alignItems: "center" }}>
      <SearchOffIcon />
      &nbsp; No redelegations
    </Box>
  ) : (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Time</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {redelegations.map(redelegation => (
            <TableRow key={`${redelegation.srcAddress.operatorAddress}_${redelegation.dstAddress.operatorAddress}`}>
              <TableCell>
                <Link href={UrlService.validator(redelegation.srcAddress.operatorAddress)}>
                  <a>{redelegation.srcAddress.moniker}</a>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={UrlService.validator(redelegation.dstAddress.operatorAddress)}>
                  <a>{redelegation.dstAddress.moniker}</a>
                </Link>
              </TableCell>
              <TableCell align="right">
                {udenomToDenom(redelegation.amount, 6)}&nbsp;
                <AKTLabel />
              </TableCell>
              <TableCell align="right">
                <FormattedRelativeTime
                  value={(new Date(redelegation.completionTime).getTime() - new Date().getTime()) / 1000}
                  numeric="always"
                  unit="second"
                  style="narrow"
                  updateIntervalInSeconds={7}

                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
