import { createNode } from "lib/rendering/node";
import { signal } from "lib/signals";

export default function Counter() {
  const count = signal(0);

  return createNode(
    "button",
    { onClick: () => count.value++ },
    "Count: ",
    count
  );
}
