import { describe, it, expect } from "vitest";
import {
  traverseSpec,
  collectUsedComponents,
  collectDataPaths,
  collectActions,
} from "./traverse";
import type { Spec } from "@json-render/core";

describe("traverseSpec", () => {
  it("visits all elements depth-first", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          key: "root",
          type: "Card",
          props: {},
          children: ["child1", "child2"],
        },
        child1: {
          key: "child1",
          type: "Text",
          props: {},
        },
        child2: {
          key: "child2",
          type: "Button",
          props: {},
        },
      },
    };

    const visited: string[] = [];
    traverseSpec(spec, (element) => {
      visited.push(element.key);
    });

    expect(visited).toEqual(["root", "child1", "child2"]);
  });

  it("handles empty spec", () => {
    const visited: string[] = [];
    traverseSpec(null as unknown as Spec, (element) => {
      visited.push(element.key);
    });
    expect(visited).toEqual([]);
  });
});

describe("collectUsedComponents", () => {
  it("collects unique component types", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          key: "root",
          type: "Card",
          props: {},
          children: ["child1", "child2"],
        },
        child1: {
          key: "child1",
          type: "Text",
          props: {},
        },
        child2: {
          key: "child2",
          type: "Text",
          props: {},
        },
      },
    };

    const components = collectUsedComponents(spec);
    expect(components).toEqual(new Set(["Card", "Text"]));
  });
});

describe("collectDataPaths", () => {
  it("collects paths from valuePath props", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          key: "root",
          type: "Metric",
          props: { valuePath: "analytics/revenue" },
        },
      },
    };

    const paths = collectDataPaths(spec);
    expect(paths).toEqual(new Set(["analytics/revenue"]));
  });

  it("collects paths from dynamic value objects", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          key: "root",
          type: "Text",
          props: { content: { path: "user/name" } },
        },
      },
    };

    const paths = collectDataPaths(spec);
    expect(paths).toEqual(new Set(["user/name"]));
  });
});

describe("collectActions", () => {
  it("collects action names from props", () => {
    const spec: Spec = {
      root: "root",
      elements: {
        root: {
          key: "root",
          type: "Button",
          props: { action: "submit_form" },
        },
      },
    };

    const actions = collectActions(spec);
    expect(actions).toEqual(new Set(["submit_form"]));
  });
});
