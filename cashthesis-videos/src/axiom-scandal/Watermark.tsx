import React from "react";
import { COLORS, interFont } from "./constants";

export const Watermark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 40,
        fontFamily: interFont,
        fontSize: 22,
        fontWeight: 600,
        color: COLORS.green,
        opacity: 0.7,
        letterSpacing: 1,
      }}
    >
      CashThesis
    </div>
  );
};
