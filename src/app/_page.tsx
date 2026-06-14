"use client";

import { useState } from "react";

export default function Test() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(!show)}>Toggle</button>

      {show ? <h1 key={"one"}> Hello</h1> : <h1 key={"two"}>World</h1>}
    </>
  );
}
