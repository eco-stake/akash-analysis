import { FormattedNumber } from "react-intl";
import { ceilDecimal } from "@src/utils/mathHelpers";
import CircularProgress from "@mui/material/CircularProgress";
import { usePriceData } from "@src/queries";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  value: string | number;
  showLt?: boolean;
};

export const PriceValue: React.FunctionComponent<Props> = ({ value, showLt }) => {
  const { data, isLoading } = usePriceData();
  const _value = (typeof value === "string" ? parseFloat(value) : value) * data?.price;
  const computedValue = _value > 0 ? ceilDecimal(_value) : 0;

  return (
    <>
      {isLoading && !data && <CircularProgress size=".8rem" color="secondary" />}
      {showLt && data?.price && _value !== computedValue && "< "}
      {data?.price && (
        <FormattedNumber
          value={computedValue}
          // eslint-disable-next-line react/style-prop-object
          style="currency"
          currency="USD"
        />
      )}
    </>
  );
};
