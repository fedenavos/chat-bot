import React, { ReactNode, useEffect, useState } from "react";

type MessageProps = {
  content?: string | ReactNode;
};

export default function Message({ content }: MessageProps) {
  const [output, setOutput] = useState<string | ReactNode>("");

  useEffect(() => {
    if (typeof content === "string") {
      const interval = setInterval(() => {
        setOutput((prevOutput) => {
          const currentIndex = (prevOutput as string).length;
          if (currentIndex >= content.length) {
            clearInterval(interval);
            return prevOutput;
          }
          const nextChar = content[currentIndex];
          return prevOutput + nextChar;
        });
      }, 25);
      return () => clearInterval(interval);
    } else {
      setOutput(content);
    }
  }, [content]);

  return <div>{typeof content === "string" ? output : content}</div>;
}