import { makeStyles } from "tss-react/mui";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import { IDelegationDetail } from "@src/types/address";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { Box } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { FormattedNumber, FormattedNumberParts } from "react-intl";
import { FormattedDecimal } from "../shared/FormattedDecimal";

type Props = {
  delegations: IDelegationDetail[];
};

const useStyles = makeStyles()(theme => ({}));

export const Delegations: React.FunctionComponent<Props> = ({ delegations }) => {
  const { classes } = useStyles();

  return delegations.length === 0 ? (
    <Box sx={{ padding: "1rem", display: "flex", alignItems: "center" }}>
      <SearchOffIcon />
      &nbsp; No delegations
    </Box>
  ) : (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Validator</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Reward</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {delegations.map(delegation => (
            <TableRow key={delegation.validator.operatorAddress}>
              <TableCell>
                <Link href={UrlService.validator(delegation.validator.operatorAddress)}>
                  <a>{delegation.validator.moniker}</a>
                </Link>
              </TableCell>
              <TableCell align="right">
                <FormattedDecimal value={udenomToDenom(delegation.amount, 6)} />
                &nbsp;
                <AKTLabel />
              </TableCell>
              <TableCell align="right">
                <FormattedDecimal value={udenomToDenom(delegation.reward, 6)} />
                &nbsp;
                <AKTLabel />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
