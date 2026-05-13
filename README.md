# react-highlight-within

<p align="center">
  <img src="./public/images/highlight-example.png" alt="Futuristic preview of rendered content, input, and textarea highlighting" width="900" />
</p>

Component-first search highlighting for real React UIs.

If people search in your interface, make the match impossible to miss across rendered content, nested children, inputs, and textareas.

## Install

```bash
npm install react-highlight-within
```

```bash
yarn add react-highlight-within
```

## Use It

```tsx
import { HighlightWithin } from "react-highlight-within";

function SearchResults() {
  const [search, setSearch] = useState("react");

  return (
    <>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search docs"
      />

      <HighlightWithin
        as="section"
        search={search}
        highlightInput
        highlightTextarea
      >
        <article>
          <h1>Learn React faster</h1>
          <p>Rendered content, inputs, and textareas all update live.</p>
        </article>

        <input value="React input example" readOnly />
        <textarea value="React textarea example" readOnly />
      </HighlightWithin>
    </>
  );
}
```

## Why It Wins

- Works on rendered output, not only literal JSX text
- Includes nested children without reshaping your component tree
- Supports opt-in highlighting for `input` and `textarea`
- Uses reversible DOM updates instead of `innerHTML`

## Key Props

- `search`
- `highlightInput`
- `highlightTextarea`
- `bgColor`
- `textColor`
- `highlightStyle`
- `caseSensitive`
- `as`

## Legacy Function

`highlightWithin()` is deprecated and kept only for compatibility. New code should use `HighlightWithin`.

## Supported Inputs

`text`, `search`, `email`, `url`, `tel`

## Contributing

Issues and pull requests are welcome. If you want to change behavior or add a feature, open a PR with a clear example of the expected result.

## License

MIT
