import React, { ReactNode, useEffect, useState } from "react";

type MessageProps = {
    content?: string | ReactNode;
};

export default function Message({ content }: MessageProps) {
  const [output, setOutput] = useState<string | ReactNode>("");
  const cont = content as any;
    

    useEffect(() => {
        if (typeof content === "string") {
            const interval = setInterval(() => {
                setOutput((prevOutput) => {
                    const currentIndex = (prevOutput as string).length;
                    if (currentIndex >= (content as string).length) {
                        clearInterval(interval);
                        return prevOutput;
                    }
                    const nextChar = (content as string)[currentIndex];
                    return prevOutput + nextChar;
                });
            }, 25);
            return () => clearInterval(interval);
        } else {
            setOutput(content);
        }
    }, [content]);

    const renderElement = (element: any) => {
        if (typeof element === "string") {
            return element;
        } else {
            switch (element.type) {
                case "span":
                    return (
                        <span>
                            {element.props.children}
                        </span>
                    );
                case "a":
                    return (
                        <a href={element.props.href} target="_blank" rel="noreferrer">
                            {element.props.children}
                        </a>
                    );
                default:
                    return element;
            }
        }
    };

  return (
    <div>
        {content === "" && <span className="cursor">|</span>}
        { output }
    </div>
  );
}
