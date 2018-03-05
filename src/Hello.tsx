import * as React from "react";

import { load, evaluateFull } from "quicktype/dist/MarkovChain";

const markovChain = load();

const samples = [
  "property",
  "username",
  "a1b2c3d4",
  "010001010110",
  "giraffe",
  "@%#^$%&^*(",
  "phoneNumber"
];

function colorForScore(score: number): string {
  const s = Math.min(Math.pow(score / 0.3, 1 / 3), 1.0);
  let r, g: number;
  if (s < 0.5) {
    r = 255;
    g = Math.floor(s * 2 * 255);
  } else {
    r = Math.floor(255 - (s - 0.5) * 2 * 255);
    g = 255;
  }
  return `rgb(${r.toString()},${g.toString()},33)`;
}

const MarkovDisplay = ({ cells }: { cells: Array<[string, string]> }) => (
  <div className="markov-display">
    {cells.map(([c, backgroundColor], i) => (
      <div key={i} style={{ backgroundColor }}>
        {c}
      </div>
    ))}
  </div>
);

export class Hello extends React.Component<
  {},
  {
    word: string;
    sample: number;
    changed: boolean;
  }
> {
  input: HTMLInputElement;

  constructor() {
    super({});
    this.state = { word: samples[0], sample: 0, changed: false };
  }

  private append(s: string): void {
    console.log("appending", s);
    this.setState({
      word: this.state.word + s,
      changed: true
    });
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.append(event.target.value);
  }

  private handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    const l = this.state.word.length;
    if (l === 0) return;
    if (event.keyCode === 8) {
      this.setState({
        word: this.state.word.slice(0, l - 1),
        changed: true
      });
    }
  }

  private shuffle() {
    const sample = (this.state.sample + 1) % samples.length;
    this.setState({
      word: samples[sample],
      sample
    });
    this.input.focus();
  }

  public render(): React.ReactNode {
    const word = this.state.word;
    const [totalScore, charScores] = evaluateFull(markovChain, word);
    const cells: [string, string][] = [];
    for (let i = 0; i < word.length; i++) {
      const c = word.charAt(i);
      let color: string;
      if (i >= markovChain.depth - 1) {
        const score = charScores[i - markovChain.depth + 1];
        color = colorForScore(score);
      } else {
        color = "white";
      }
      cells.push([c, color]);
    }

    return (
      <div
        className="outer"
        style={{ backgroundColor: colorForScore(totalScore) }}
      >
        <div className="shuffle">
          <div onClick={() => this.shuffle()}>🔀</div>
        </div>
        <div className="input" onClick={() => this.input.focus()}>
          <MarkovDisplay cells={cells} />
          <input
            ref={r => (this.input = r as HTMLInputElement)}
            autoFocus={true}
            value=""
            size={2}
            onChange={e => this.handleChange(e)}
            onKeyDown={e => this.handleKeyDown(e)}
          />

          {!this.state.changed ? (
            <div className="instruction">(type here)</div>
          ) : null}
        </div>
      </div>
    );
  }
}
