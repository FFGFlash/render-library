import { computed, effect, signal } from "lib/signals";
import "./style.css";
import { createNode, render } from "lib/rendering/node";

function Odd() {
  const test = signal(0);

  effect(() => {
    console.log("test", test.value);
  });

  effect(() => {
    const interval = setInterval(() => {
      test.value++;
    }, 1000);
    return () => clearInterval(interval);
  });

  return createNode("h2", null, ["Odd for ", test]);
}

function Even() {
  return createNode("h2", null, "Even");
}

function Main() {
  const count = signal(0);

  effect(() => {
    console.log("test");
  });

  return createNode(
    "div",
    { className: "flex flex-col gap-10 p-10 items-center text-white" },
    [
      createNode("h1", { className: "text-4xl font-bold" }, "Counter"),
      createNode("div", { className: "flex gap-5" }, [
        createNode("button", { onClick: () => count.value-- }, "-"),
        createNode("span", null, count),
        createNode("button", { onClick: () => count.value++ }, "+"),
      ]),
      computed(() => {
        return count.value % 2 === 0 ? createNode(Even) : createNode(Odd);
      }),
    ]
  );
  // return (
  //   <div className="flex flex-col gap-10 p-10 items-center text-white">
  //     <h1 className="text-4xl font-bold">Counter</h1>
  //     <div className="flex gap-5">
  //       <button onClick={() => count.value--}>-</button>
  //       <span>{count}</span>
  //       <button onClick={() => count.value++}>+</button>
  //     </div>
  //     {count.value % 2 === 0 ? <Even /> : <Odd />}
  //   </div>
  // );
}

const rootEl = document.getElementById("app");
if (!rootEl) throw new Error("Root element not found");
render(rootEl, createNode(Main));
