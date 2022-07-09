import Typography from "@mui/material/Typography";
import { ReactNode } from "react";
import { GridItem } from "../GridItem";
import { customColors } from "@src/utils/colors";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { makeStyles } from "tss-react/mui";
import { cx } from "@emotion/css";

type Props = {
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "1.5rem",
    lineHeight: "1.5rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(2)
  },
  list: {
    listStyle: "none"
  },
  listItem: {
    fontSize: "1.2rem",
    lineHeight: "2rem",
    display: "flex",
    alignItems: "center"
  },
  icon: { marginLeft: ".5rem" },
  place1: { color: theme.palette.secondary.main },
  place2: { color: theme.palette.grey[600] },
  place3: { color: customColors.brown }
}));

export const LeaderboardCard: React.FunctionComponent<Props> = ({ children }) => {
  const { classes } = useStyles();

  return (
    <GridItem height="240px">
      <Typography variant="h4" className={classes.title}>
        Top 5 active players (24h)
      </Typography>

      <ul className={classes.list}>
        {topPlayers.map((player, i) => (
          <li key={player.id}>
            <Typography variant="body1" className={classes.listItem}>
              #{i + 1} {player.name}
              {i < 3 && <EmojiEventsIcon className={cx(classes.icon, { [classes.place1]: i === 0, [classes.place2]: i === 1, [classes.place3]: i === 2 })} />}
            </Typography>
          </li>
        ))}
      </ul>
    </GridItem>
  );
};

// TODO
const topPlayers = [
  { id: 1, name: "Chalabi" },
  { id: 2, name: "Reece" },
  { id: 3, name: "Pasquale" },
  { id: 4, name: "Bean" },
  { id: 5, name: "Jawn" }
];

export default LeaderboardCard;
