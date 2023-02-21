import React, { ReactNode, useEffect, useState } from "react";


type MessageProps = {
  content?: string | ReactNode;
};

export default function Message({ content }: MessageProps) {
  const [output, setOutput] = useState<string | ReactNode>("");

  const typeAnimation = (text: string) => {
    const interval = setInterval(() => {
      setOutput((prevOutput) => {
        const currentIndex = (prevOutput as string).length;
        if (currentIndex >= text.length) {
          clearInterval(interval);
          return prevOutput;
        }
        const nextChar = text[currentIndex];
        return prevOutput + nextChar;
      });
    }, 25);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (typeof content === "string") {
      typeAnimation(content);
    } else {
      setOutput(content);
    }
  }, [content]);

  return <div>{typeof content === "string" ? output : content}</div>;
}