import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  createCatalog,
  generateCatalogPrompt,
  generateSystemPrompt,
} from "./catalog";
import { defineSchema, defineCatalog } from "./schema";

describe("createCatalog", () => {
  it("creates catalog with components", () => {
    const catalog = createCatalog({
      components: {
        text: {
          props: z.object({ content: z.string() }),
          description: "Display text",
        },
        button: {
          props: z.object({ label: z.string() }),
          description: "A clickable button",
        },
      },
    });

    expect(catalog.componentNames).toHaveLength(2);
    expect(catalog.hasComponent("text")).toBe(true);
    expect(catalog.hasComponent("button")).toBe(true);
    expect(catalog.hasComponent("unknown")).toBe(false);
  });

  it("creates catalog with actions", () => {
    const catalog = createCatalog({
      components: {
        button: { props: z.object({ label: z.string() }) },
      },
      actions: {
        navigate: { description: "Navigate to URL" },
        submit: { description: "Submit form" },
      },
    });

    expect(catalog.actionNames).toHaveLength(2);
    expect(catalog.hasAction("navigate")).toBe(true);
    expect(catalog.hasAction("submit")).toBe(true);
    expect(catalog.hasAction("unknown")).toBe(false);
  });

  it("creates catalog with custom validation functions", () => {
    const catalog = createCatalog({
      components: {
        input: { props: z.object({ value: z.string() }) },
      },
      functions: {
        customValidator: {
          validate: (value) => typeof value === "string" && value.length > 0,
          description: "Custom validation",
        },
      },
    });

    expect(catalog.functionNames).toHaveLength(1);
    expect(catalog.hasFunction("customValidator")).toBe(true);
  });

  it("validates elements correctly", () => {
    const catalog = createCatalog({
      components: {
        text: {
          props: z.object({ content: z.string() }),
        },
      },
    });

    const validElement = {
      type: "text",
      props: { content: "Hello" },
    };
    const invalidElement = {
      type: "text",
      props: { content: 123 },
    };

    expect(catalog.validateElement(validElement).success).toBe(true);
    expect(catalog.validateElement(invalidElement).success).toBe(false);
  });

  it("validates UI specs", () => {
    const catalog = createCatalog({
      components: {
        text: { props: z.object({ content: z.string() }) },
      },
    });

    const validSpec = {
      root: "1",
      elements: {
        "1": { type: "text", props: { content: "Hello" } },
      },
    };

    expect(catalog.validateSpec(validSpec).success).toBe(true);
  });

  it("validates nested specs with children", () => {
    const catalog = createCatalog({
      components: {
        card: {
          props: z.object({ title: z.string() }),
          hasChildren: true,
        },
        text: {
          props: z.object({ content: z.string() }),
        },
      },
    });

    const validSpec = {
      root: "card-1",
      elements: {
        "card-1": {
          type: "card",
          props: { title: "Hello" },
          children: ["text-1"],
        },
        "text-1": {
          type: "text",
          props: { content: "World" },
        },
      },
    };

    expect(catalog.validateSpec(validSpec).success).toBe(true);
  });

  it("rejects specs with invalid component types", () => {
    const catalog = createCatalog({
      components: {
        text: { props: z.object({ content: z.string() }) },
      },
    });

    const invalidSpec = {
      root: "1",
      elements: {
        "1": { type: "nonexistent", props: { content: "Hello" } },
      },
    };

    expect(catalog.validateSpec(invalidSpec).success).toBe(false);
  });

  it("uses default name when not provided", () => {
    const catalog = createCatalog({
      components: {
        text: { props: z.object({ content: z.string() }) },
      },
    });

    expect(catalog.name).toBe("unnamed");
  });

  it("uses provided name", () => {
    const catalog = createCatalog({
      name: "MyCatalog",
      components: {
        text: { props: z.object({ content: z.string() }) },
      },
    });

    expect(catalog.name).toBe("MyCatalog");
  });
});

describe("generateCatalogPrompt", () => {
  it("generates prompt containing catalog name", () => {
    const catalog = createCatalog({
      name: "TestCatalog",
      components: {
        text: {
          props: z.object({ content: z.string() }),
          description: "Display text content",
        },
      },
    });

    const prompt = generateCatalogPrompt(catalog);

    expect(prompt).toContain("TestCatalog");
  });

  it("includes component descriptions", () => {
    const catalog = createCatalog({
      components: {
        text: {
          props: z.object({ content: z.string() }),
          description: "Display text content",
        },
      },
    });

    const prompt = generateCatalogPrompt(catalog);

    expect(prompt).toContain("text");
    expect(prompt).toContain("Display text content");
  });

  it("includes action descriptions", () => {
    const catalog = createCatalog({
      components: {
        button: { props: z.object({ label: z.string() }) },
      },
      actions: {
        alert: { description: "Show alert message" },
      },
    });

    const prompt = generateCatalogPrompt(catalog);

    expect(prompt).toContain("alert");
    expect(prompt).toContain("Show alert message");
  });

  it("includes visibility documentation", () => {
    const catalog = createCatalog({
      components: {
        text: { props: z.object({ content: z.string() }) },
      },
    });

    const prompt = generateCatalogPrompt(catalog);

    expect(prompt).toContain("Visibility");
    expect(prompt).toContain("visible");
  });

  it("includes validation documentation", () => {
    const catalog = createCatalog({
      components: {
        text: { props: z.object({ content: z.string() }) },
      },
    });

    const prompt = generateCatalogPrompt(catalog);

    expect(prompt).toContain("Validation");
    expect(prompt).toContain("required");
    expect(prompt).toContain("email");
  });
});

describe("generateSystemPrompt", () => {
  it("generates a complete system prompt", () => {
    const catalog = createCatalog({
      components: {
        Card: {
          props: z.object({ title: z.string() }),
          description: "A card container",
          hasChildren: true,
        },
        Text: {
          props: z.object({ content: z.string() }),
          description: "Display text",
        },
      },
    });

    const prompt = generateSystemPrompt(catalog);

    expect(prompt).toContain("You are a UI generator");
    expect(prompt).toContain("AVAILABLE COMPONENTS");
    expect(prompt).toContain("Card");
    expect(prompt).toContain("Text");
  });

  it("includes prop types in prompt", () => {
    const catalog = createCatalog({
      components: {
        Button: {
          props: z.object({
            label: z.string(),
            variant: z.enum(["primary", "secondary"]).optional(),
            disabled: z.boolean().optional(),
          }),
          description: "Clickable button",
        },
      },
    });

    const prompt = generateSystemPrompt(catalog);

    // Should include component name and description
    expect(prompt).toContain("Button");
    expect(prompt).toContain("Clickable button");
    // Should include AVAILABLE COMPONENTS section
    expect(prompt).toContain("AVAILABLE COMPONENTS");
  });

  it("includes actions in prompt", () => {
    const catalog = createCatalog({
      components: {
        Button: { props: z.object({ label: z.string() }) },
      },
      actions: {
        navigate: { description: "Navigate to a URL" },
        submit: { description: "Submit the form" },
      },
    });

    const prompt = generateSystemPrompt(catalog);

    expect(prompt).toContain("AVAILABLE ACTIONS");
    expect(prompt).toContain("navigate");
    expect(prompt).toContain("Navigate to a URL");
    expect(prompt).toContain("submit");
  });

  it("includes output format rules", () => {
    const catalog = createCatalog({
      components: {
        Text: { props: z.object({ content: z.string() }) },
      },
    });

    const prompt = generateSystemPrompt(catalog);

    expect(prompt).toContain("OUTPUT FORMAT");
    expect(prompt).toContain("RULES");
    expect(prompt).toContain("/root");
    expect(prompt).toContain("/elements");
  });

  it("allows custom system message", () => {
    const catalog = createCatalog({
      components: {
        Text: { props: z.object({ content: z.string() }) },
      },
    });

    const prompt = generateSystemPrompt(catalog, {
      system: "You are a dashboard builder.",
    });

    expect(prompt).toContain("You are a dashboard builder.");
    expect(prompt).not.toContain("You are a UI generator");
  });

  it("appends custom rules", () => {
    const catalog = createCatalog({
      components: {
        Card: { props: z.object({ title: z.string() }) },
      },
    });

    const prompt = generateSystemPrompt(catalog, {
      customRules: [
        "Always use Card as the root element",
        "Keep UIs simple and clean",
      ],
    });

    expect(prompt).toContain("Always use Card as the root element");
    expect(prompt).toContain("Keep UIs simple and clean");
  });

  it("includes custom validation functions when present", () => {
    const catalog = createCatalog({
      components: {
        Input: { props: z.object({ value: z.string() }) },
      },
      functions: {
        phoneNumber: {
          validate: (v) => /^\d{10}$/.test(String(v)),
          description: "Validates phone numbers",
        },
        zipCode: {
          validate: (v) => /^\d{5}$/.test(String(v)),
          description: "Validates zip codes",
        },
      },
    });

    const prompt = generateSystemPrompt(catalog);

    expect(prompt).toContain("CUSTOM VALIDATION FUNCTIONS");
    expect(prompt).toContain("phoneNumber");
    expect(prompt).toContain("zipCode");
  });
});

describe("defineCatalog (new schema API)", () => {
  const testSchema = defineSchema((s) => ({
    spec: s.object({
      root: s.string(),
      elements: s.record(
        s.object({
          type: s.ref("catalog.components"),
          props: s.any(),
          children: s.array(s.string()),
        }),
      ),
    }),
    catalog: s.object({
      components: s.map({
        props: s.zod(),
        description: s.string(),
        example: s.any(),
      }),
      actions: s.map({
        description: s.string(),
      }),
    }),
  }));

  it("creates a catalog from a schema", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Display text",
        },
        Button: {
          props: z.object({ label: z.string() }),
          description: "Clickable button",
        },
      },
      actions: {
        click: { description: "Handle click event" },
      },
    });

    expect(catalog.componentNames).toEqual(["Text", "Button"]);
    expect(catalog.actionNames).toEqual(["click"]);
  });

  it("generates prompt from schema-based catalog", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Card: {
          props: z.object({ title: z.string() }),
          description: "A card container",
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt();

    expect(prompt).toContain("Card");
    expect(prompt).toContain("A card container");
    expect(prompt).toContain("AVAILABLE COMPONENTS");
  });

  it("supports custom rules in prompt", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Text component",
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt({
      customRules: ["Always use semantic HTML", "Keep layouts responsive"],
    });

    expect(prompt).toContain("Always use semantic HTML");
    expect(prompt).toContain("Keep layouts responsive");
  });

  it("validates specs against catalog", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Text component",
        },
      },
      actions: {},
    });

    const validSpec = {
      root: "text-1",
      elements: {
        "text-1": {
          type: "Text",
          props: { content: "Hello" },
          children: [],
        },
      },
    };

    const result = catalog.validate(validSpec);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validSpec);
  });

  it("returns errors for invalid specs", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Text component",
        },
      },
      actions: {},
    });

    const invalidSpec = {
      root: 123, // Should be string
      elements: {},
    };

    const result = catalog.validate(invalidSpec);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("generates JSON Schema for structured outputs", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Text component",
        },
      },
      actions: {},
    });

    const jsonSchema = catalog.jsonSchema();

    // jsonSchema() returns a JSON Schema representation
    expect(jsonSchema).toBeDefined();
    expect(typeof jsonSchema).toBe("object");
  });

  it("provides Zod schema for custom validation", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Text component",
        },
      },
      actions: {},
    });

    const zodSchema = catalog.zodSchema();

    const result = zodSchema.safeParse({
      root: "text-1",
      elements: {
        "text-1": {
          type: "Text",
          props: { content: "Hello" },
          children: [],
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("does not include hardcoded component names in prompt (issue #88)", () => {
    // When a catalog only has "Text", the generated prompt should NOT
    // reference components like Stack, Grid, Heading, Card, Column,
    // Button, or Pressable that are not in the catalog.
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({ content: z.string() }),
          description: "Display text content",
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt();

    // The prompt should contain the actual catalog component
    expect(prompt).toContain("Text");
    expect(prompt).toContain("Display text content");

    // The prompt should NOT contain hardcoded component names not in the catalog
    // Check that these don't appear as component types in JSON examples
    const hardcodedComponents = [
      "Stack",
      "Grid",
      "Heading",
      "Card",
      "Column",
      "Pressable",
    ];

    for (const comp of hardcodedComponents) {
      // Check for "type":"<ComponentName>" patterns in JSON examples
      expect(prompt).not.toContain(`"type":"${comp}"`);
      // Also check for "type": "<ComponentName>" with space
      expect(prompt).not.toContain(`"type": "${comp}"`);
    }
  });

  it("uses actual catalog component names in prompt examples", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        MyBox: {
          props: z.object({ padding: z.number() }),
          description: "A box",
        },
        MyLabel: {
          props: z.object({ text: z.string() }),
          description: "A label",
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt();

    // The example output should use MyBox and MyLabel, not hardcoded names
    expect(prompt).toContain('"type":"MyBox"');
    expect(prompt).toContain('"type":"MyLabel"');

    // Should not contain any hardcoded component names in type fields
    expect(prompt).not.toContain('"type":"Stack"');
    expect(prompt).not.toContain('"type":"Grid"');
    expect(prompt).not.toContain('"type":"Heading"');
    expect(prompt).not.toContain('"type":"Column"');
    expect(prompt).not.toContain('"type":"Button"');
    expect(prompt).not.toContain('"type":"Pressable"');
  });

  it("generates example props from Zod schema when no example provided", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Text: {
          props: z.object({
            content: z.string(),
            size: z.number(),
            bold: z.boolean(),
            variant: z.enum(["body", "heading"]),
            color: z.string().optional(),
          }),
          description: "Display text",
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt();

    // Required props should appear with generated values in examples
    // (string -> "example", number -> 0, boolean -> true, enum -> first value)
    expect(prompt).toContain('"content":"example"');
    expect(prompt).toContain('"size":0');
    expect(prompt).toContain('"bold":true');
    expect(prompt).toContain('"variant":"body"');

    // Optional props should NOT appear in examples (keeps them concise)
    // The prop name "color" should still appear in the AVAILABLE COMPONENTS
    // section but not in the JSON example objects
    const exampleSection = prompt.split("AVAILABLE COMPONENTS")[0]!;
    expect(exampleSection).not.toContain('"color"');

    // Prompt examples should never have empty props:{}
    expect(exampleSection).not.toContain('"props":{}');
  });

  it("uses explicit example field over Zod-generated values", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Heading: {
          props: z.object({
            text: z.string(),
            level: z.enum(["h1", "h2", "h3"]),
          }),
          description: "A heading",
          example: { text: "Welcome to My App", level: "h1" },
        },
        Paragraph: {
          props: z.object({ content: z.string() }),
          description: "A paragraph",
          example: { content: "Lorem ipsum dolor sit amet" },
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt();

    // Should use the explicit example values, not "example" or first enum value
    expect(prompt).toContain('"text":"Welcome to My App"');
    expect(prompt).toContain('"level":"h1"');
    expect(prompt).toContain('"content":"Lorem ipsum dolor sit amet"');
  });

  it("uses $path binding on first string prop for repeat example", () => {
    const catalog = defineCatalog(testSchema, {
      components: {
        Card: {
          props: z.object({
            title: z.string(),
            subtitle: z.string(),
          }),
          description: "A card",
        },
      },
      actions: {},
    });

    const prompt = catalog.prompt();

    // In the repeat/item example, the first string prop should get a $path binding
    expect(prompt).toContain('"title":{"$path":"$item/title"}');
  });
});
