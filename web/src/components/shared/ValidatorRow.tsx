import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Link from "next/link";
import { ValidatorSummaryDetail } from "@src/types/validator";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { FormattedNumber } from "react-intl";
import { UrlService } from "@src/utils/urlUtils";
import { Avatar, Box, lighten, useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";

type Props = {
  errors?: string;
  validator: ValidatorSummaryDetail;
};

export const ValidatorRow: React.FunctionComponent<Props> = ({ validator }) => {
  const theme = useTheme();
  const isTop10 = validator.rank <= 10;

  return (
    <TableRow
      sx={{
        whiteSpace: "nowrap",
        "&:nth-of-type(odd)": {
          backgroundColor: theme.palette.action.hover
        }
      }}
    >
      <TableCell>
        <Box
          sx={{
            width: "1.5rem",
            height: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isTop10 ? theme.palette.secondary.main : lighten(theme.palette.secondary.main, 0.9),
            color: isTop10 ? theme.palette.secondary.contrastText : theme.palette.secondary.main,
            borderRadius: "50%",
            fontWeight: "bold",
            fontSize: ".75rem"
          }}
        >
          {validator.rank}
        </Box>
      </TableCell>
      <TableCell>
        <Link href={UrlService.validator(validator.operatorAddress)}>
          <a style={{ display: "inline-flex", alignItems: "center" }}>
            <Box mr={1}>
              <Avatar src={validator.keybaseAvatarUrl} sx={{ width: "30px", height: "30px" }} />
            </Box>
            {validator.moniker}
          </a>
        </Link>
      </TableCell>
      <TableCell align="right">
        <FormattedNumber value={udenomToDenom(validator.votingPower)} maximumFractionDigits={0} />
        &nbsp;
        <AKTLabel />
        &nbsp;(
        <FormattedNumber style="percent" value={validator.votingPowerRatio} minimumFractionDigits={2} />)
      </TableCell>
      <TableCell align="center">
        <FormattedNumber style="percent" value={validator.commission} minimumFractionDigits={2} />
      </TableCell>
    </TableRow>
  );
};
