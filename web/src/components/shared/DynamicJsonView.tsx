import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";

const _DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

type Props = {
  src: object;
};

export const DynamicReactJson: React.FunctionComponent<Props> = ({ src }) => {
  const theme = useTheme();
  return <_DynamicReactJson src={src} theme={theme.palette.mode === "dark" ? "brewer" : "apathy:inverted"} />;
};
