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

const MarkovDisplay = ({
  word,
  charScores
}: {
  word: string;
  charScores: number[];
}) => {
  const cells = word.split("").map((c, i) => {
    if (i >= markovChain.depth - 1) {
      const score = charScores[i - markovChain.depth + 1];
      return [c, colorForScore(score)];
    }
    return [c, "white"];
  });
  return (
    <div className="markov-display">
      {cells.map(([c, backgroundColor], i) => (
        <div key={i} style={{ backgroundColor }}>
          {c === " " ? <span>&nbsp;</span> : c}
        </div>
      ))}
    </div>
  );
};

export class App extends React.Component<
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

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      word: this.state.word + event.target.value,
      changed: true
    });
  }

  private handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { length } = this.state.word;
    if (length > 0 && event.keyCode === 8) {
      this.setState({
        word: this.state.word.slice(0, length - 1),
        changed: true
      });
    }
  }

  private shuffle() {
    const sample = (this.state.sample + 1) % samples.length;
    this.setState({ word: samples[sample], sample });
    this.input.focus();
  }

  public render(): React.ReactNode {
    const [totalScore, charScores] = evaluateFull(markovChain, this.state.word);
    return (
      <div
        className="outer"
        style={{ backgroundColor: colorForScore(totalScore) }}
      >
        <div className="shuffle">
          <div onClick={() => this.shuffle()}>🔀</div>
        </div>
        <div className="input" onClick={() => this.input.focus()}>
          <MarkovDisplay word={this.state.word} charScores={charScores} />

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
