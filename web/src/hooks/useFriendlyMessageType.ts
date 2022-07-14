export const useFriendlyMessageType = (type: string) => {
  if (!type) return "";

  const splittedType = type.split(".");
  const msgType = splittedType[splittedType.length - 1];
  const friendlyMessageType = msgType
    .substring(3) // Remove "Msg"
    .replace(/[0-9]/g, "")
    .split(/(?=[A-Z])/)
    .join(" ");

  return friendlyMessageType;
};
