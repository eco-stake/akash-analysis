import { useState, useRef, ReactNode, useEffect, CSSProperties } from "react";
import { useWindowSize } from "@src/hooks/useWindowSize";

type Props = {
  // fixed height same as parent
  isSameAsParent?: boolean;
  // fixed height to a specific element, like the footer
  bottomElementId?: string;
  // fixed height with a ratio from the width like 2/3
  ratio?: number;
  style?: CSSProperties;
  children?: ReactNode;
};

export const ViewPanel: React.FunctionComponent<Props> = ({ children, bottomElementId, isSameAsParent, ratio, style = {}, ...rest }) => {
  const windowSize = useWindowSize();
  const [height, setHeight] = useState<any>("auto");
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (windowSize.height) {
      try {
        const boundingRect = ref.current.getBoundingClientRect();
        let height: number | string;

        if (bottomElementId) {
          const bottomElementRect = document.getElementById(bottomElementId).getBoundingClientRect();
          height = Math.abs(boundingRect.top - bottomElementRect.top);
        } else if (isSameAsParent) {
          const computedStyle = getComputedStyle(ref.current.parentElement);
          const parentRect = ref.current.parentElement.getBoundingClientRect();
          height = parentRect.height - parseFloat(computedStyle.paddingBottom) - Math.abs(boundingRect.top - parentRect.top);
        } else if (ratio) {
          height = Math.round(boundingRect.width * ratio);
        } else {
          height = "auto";
        }

        setHeight(height);
      } catch (error) {
        setHeight("auto");
      }
    }
  }, [windowSize, bottomElementId, isSameAsParent]);

  return (
    <div ref={ref} style={{ height, ...style }} {...rest}>
      {children}
    </div>
  );
};

export default ViewPanel;
